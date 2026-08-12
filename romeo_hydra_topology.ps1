# romeo_hydra_topology.ps1
# Capa de topología biomimética (anillos concéntricos / chakras) para Romeo Hydra

class Node {
    [string]$Id
    [int]$Ring
    [string]$Role
    [double]$Load
    [hashtable]$State
    [double]$Frequency

    Node([string]$id, [int]$ring, [string]$role = "worker", [double]$freq = 1.0) {
        $this.Id = $id
        $this.Ring = $ring
        $this.Role = $role
        $this.Load = 0.0
        $this.State = @{}
        $this.Frequency = $freq
    }
}

class RomeoHydraTopology {
    [int]$MaxRings
    [int[]]$NodesPerRing
    [hashtable]$Nodes
    [string]$CenterId
    [System.Collections.Concurrent.ConcurrentDictionary[string, object]]$LockObj

    RomeoHydraTopology([int]$maxRings = 4, [int[]]$nodesPerRing = $null) {
        $this.MaxRings = $maxRings
        if ($null -eq $nodesPerRing) {
            $this.NodesPerRing = @(1, 8, 24, 48, 96)
        } else {
            $this.NodesPerRing = $nodesPerRing
        }
        $this.Nodes = @{}
        $this.CenterId = $null
        $this.LockObj = [System.Collections.Concurrent.ConcurrentDictionary[string, object]]::new()
        $this.BuildTopology()
    }

    [void] BuildTopology() {
        $nodeCount = 0
        for ($ring = 0; $ring -le $this.MaxRings; $ring++) {
            $count = if ($ring -lt $this.NodesPerRing.Count) { $this.NodesPerRing[$ring] } else { 8 }
            for ($i = 0; $i -lt $count; $i++) {
                $nid = "r${ring}_n$i"
                $role = if ($ring -eq 0) { "center" } elseif ($ring -eq $this.MaxRings) { "exception" } else { "worker" }
                $freq = if ($ring -eq 0) { 1.0 } else { 0.7 + 0.3 * ($ring / $this.MaxRings) }
                $this.Nodes[$nid] = [Node]::new($nid, $ring, $role, $freq)
                $nodeCount++
                if ($ring -eq 0) { $this.CenterId = $nid }
            }
        }
        Write-Host "[HydraTopology] Construida: $nodeCount nodos en $($this.MaxRings + 1) anillos"
    }

    [string] Route([object]$payload, [int]$preferRing = -1) {
        $candidates = @()
        foreach ($n in $this.Nodes.Values) {
            if ($preferRing -eq -1 -or $n.Ring -eq $preferRing) {
                $candidates += $n
            }
        }
        if ($candidates.Count -eq 0) { $candidates = $this.Nodes.Values }

        $best = $candidates | Sort-Object { $_.Load / [Math]::Max($_.Frequency, 0.01) } | Select-Object -First 1
        $best.Load += 1.0
        return $best.Id
    }

    [void] Release([string]$nodeId, [double]$amount = 1.0) {
        if ($this.Nodes.ContainsKey($nodeId)) {
            $this.Nodes[$nodeId].Load = [Math]::Max(0.0, $this.Nodes[$nodeId].Load - $amount)
        }
    }

    [hashtable] Condense([hashtable]$states, [string]$method = "harmonic") {
        if ($null -eq $states -or $states.Count -eq 0) { return @{} }

        if ($method -eq "harmonic") {
            $acc = @{}
            $totalW = 0.0

            foreach ($nid in $states.Keys) {
                $node = $this.Nodes[$nid]
                if ($null -eq $node) { continue }

                $w = $node.Frequency * (1.0 / (1 + $node.Ring))
                $val = $states[$nid]

                if ($val -is [int] -or $val -is [double] -or $val -is [decimal]) {
                    if (-not $acc.ContainsKey("value")) { $acc["value"] = 0.0 }
                    $acc["value"] += $val * $w
                    $totalW += $w
                }
                elseif ($val -is [hashtable]) {
                    foreach ($k in $val.Keys) {
                        $v = $val[$k]
                        if ($v -is [int] -or $v -is [double] -or $v -is [decimal]) {
                            if (-not $acc.ContainsKey($k)) { $acc[$k] = 0.0 }
                            $acc[$k] += $v * $w
                            $totalW += $w
                        }
                    }
                }
            }

            if ($totalW -gt 0) {
                $result = @{}
                foreach ($k in $acc.Keys) {
                    $result[$k] = $acc[$k] / $totalW
                }
                return $result
            }
            return $acc
        }
        return @{ collapsed = ($states.Values | Select-Object -First 3); method = "spectral_stub" }
    }

    [hashtable] Execute([array]$tasks, [int]$maxWorkers = 8, [bool]$condenseAfter = $true) {
        $results = [System.Collections.Concurrent.ConcurrentDictionary[string, object]]::new()
        $runspacePool = [runspacefactory]::CreateRunspacePool(1, $maxWorkers)
        $runspacePool.Open()
        $jobs = @()

        for ($i = 0; $i -lt $tasks.Count; $i++) {
            $task = $tasks[$i]
            $fn   = $task[0]
            $arg  = $task[1]
            $prefer = if ($i % 5 -eq 0) { 0 } else { -1 }
            $nodeId = $this.Route($arg, $prefer)

            $ps = [powershell]::Create().AddScript({
                param($fn, $arg, $nodeId, $topo)
                try {
                    $res = & $fn $arg
                    return @{ NodeId = $nodeId; Result = $res }
                }
                finally {
                    $topo.Release($nodeId)
                }
            }).AddArgument($fn).AddArgument($arg).AddArgument($nodeId).AddArgument($this)

            $ps.RunspacePool = $runspacePool
            $jobs += @{ Pipe = $ps; Handle = $ps.BeginInvoke() }
        }

        foreach ($job in $jobs) {
            $output = $job.Pipe.EndInvoke($job.Handle)
            if ($output) {
                $results[$output.NodeId] = $output.Result
            }
            $job.Pipe.Dispose()
        }
        $runspacePool.Close()
        $runspacePool.Dispose()

        $raw = @{}
        foreach ($k in $results.Keys) { $raw[$k] = $results[$k] }

        if ($condenseAfter -and $raw.Count -gt 0) {
            $condensed = $this.Condense($raw)
            if ($this.CenterId) {
                $raw[$this.CenterId] = $condensed
            }
            return @{ raw = $raw; condensed = $condensed }
        }
        return @{ raw = $raw }
    }

    [hashtable] Snapshot() {
        $snap = @{}
        foreach ($nid in $this.Nodes.Keys) {
            $n = $this.Nodes[$nid]
            $snap[$nid] = @{
                ring = $n.Ring
                role = $n.Role
                load = [Math]::Round($n.Load, 2)
                freq = [Math]::Round($n.Frequency, 2)
            }
        }
        return $snap
    }

    [string] VisualizeAscii() {
        $lines = @("Romeo Hydra Topology (anillos concéntricos)")
        for ($r = 0; $r -le $this.MaxRings; $r++) {
            $ringNodes = $this.Nodes.Values | Where-Object { $_.Ring -eq $r }
            $loads = ($ringNodes | Select-Object -First 8 | ForEach-Object { "$($_.Id.Substring($_.Id.Length-3)):$([int]$_.Load)" }) -join " "
            $extra = if ($ringNodes.Count -gt 8) { " ..." } else { "" }
            $lines += "  Ring $r ($($ringNodes.Count.ToString().PadLeft(3)) nodes): $loads$extra"
        }
        return $lines -join "`n"
    }
}

# ---------------------------------------------------------------------------
# Ejemplo de uso
# ---------------------------------------------------------------------------

$topo = [RomeoHydraTopology]::new(3)

function Hard-Logic {
    param($x)
    Start-Sleep -Milliseconds 50
    return @{ stable = $x * 2; type = "core" }
}

function Peripheral {
    param($x)
    Start-Sleep -Milliseconds 20
    return @{ noise = $x + 0.1; type = "edge" }
}

$tasks = @()
for ($i = 0; $i -lt 20; $i++) {
    if ($i % 5 -eq 0) {
        $tasks += ,@( ${function:Hard-Logic}, $i )
    } else {
        $tasks += ,@( ${function:Peripheral}, $i )
    }
}

Write-Host $topo.VisualizeAscii()
Write-Host "`nEjecutando tareas..."
$result = $topo.Execute($tasks, 6, $true)

Write-Host "`nResultado condensado:"
$result.condensed | Format-Table -AutoSize

Write-Host "`nSnapshot (primeros nodos):"
$topo.Snapshot().GetEnumerator() | Select-Object -First 6 | ForEach-Object {
    Write-Host "  $($_.Key): ring=$($_.Value.ring) load=$($_.Value.load) freq=$($_.Value.freq)"
}