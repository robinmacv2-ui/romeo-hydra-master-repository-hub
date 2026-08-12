# ============================================================
# romeo_hydra_virtual.ps1
# Universo Virtual autocontenido para Romeo-Hydra
# Runspaces + Módulos en memoria + Topología de anillos
# ============================================================

# Forzar la consola a entender UTF-8 (acentos y flechas)
[console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ------------------------------------------------------------
# 1. Clase base de entidad virtual (nodo / universo)
# ------------------------------------------------------------
class EntidadVirtual {
    [string]$Id
    [int]$Ring
    [string]$Role
    [double]$Load
    [double]$Frequency
    [hashtable]$Atributos
    [System.Collections.Concurrent.ConcurrentDictionary[string,object]]$Estado

    EntidadVirtual([string]$id, [int]$ring = 0, [string]$role = "worker") {
        $this.Id         = $id
        $this.Ring       = $ring
        $this.Role       = $role
        $this.Load       = 0.0
        $this.Frequency  = if ($ring -eq 0) { 1.0 } else { 0.7 + 0.3 * ($ring / 4) }
        $this.Atributos  = @{
            Creado     = Get-Date
            Estado     = "Fluido"
            Coherencia = 99.8
        }
        $this.Estado = [System.Collections.Concurrent.ConcurrentDictionary[string,object]]::new()
    }

    [void] Mutar([string]$clave, [object]$valor) {
        $this.Atributos[$clave] = $valor
    }

    [void] Cargar([double]$cantidad = 1.0) {
        $this.Load += $cantidad
    }

    [void] Liberar([double]$cantidad = 1.0) {
        $this.Load = [Math]::Max(0.0, $this.Load - $cantidad)
    }
}

# ------------------------------------------------------------
# 2. Topología virtual de anillos (en memoria pura)
# ------------------------------------------------------------
class RomeoHydraVirtual {
    [int]$MaxRings
    [hashtable]$Nodos
    [string]$CentroId
    [System.Management.Automation.Runspaces.Runspace]$UniversoRunspace
    [powershell]$Motor

    RomeoHydraVirtual([int]$maxRings = 3) {
        $this.MaxRings = $maxRings
        $this.Nodos = @{}
        $this.BuildTopology()
        $this.CrearUniversoAislado()
    }

    [void] BuildTopology() {
        $densidades = @(1, 8, 16, 32)
        for ($r = 0; $r -le $this.MaxRings; $r++) {
            $count = if ($r -lt $densidades.Count) { $densidades[$r] } else { 8 }
            for ($i = 0; $i -lt $count; $i++) {
                $nid  = "r${r}_n$i"
                $role = if ($r -eq 0) { "center" } elseif ($r -eq $this.MaxRings) { "exception" } else { "worker" }
                $this.Nodos[$nid] = [EntidadVirtual]::new($nid, $r, $role)
                if ($r -eq 0) { $this.CentroId = $nid }
            }
        }
        Write-Host "[HydraVirtual] Universo creado: $($this.Nodos.Count) nodos en $($this.MaxRings+1) anillos (solo RAM)"
    }

    [void] CrearUniversoAislado() {
        $iss = [System.Management.Automation.Runspaces.InitialSessionState]::CreateDefault()
        $this.UniversoRunspace = [runspacefactory]::CreateRunspace($iss)
        $this.UniversoRunspace.Open()
        $this.Motor = [powershell]::Create()
        $this.Motor.Runspace = $this.UniversoRunspace
        Write-Host "[HydraVirtual] Runspace aislado abierto (universo paralelo listo)"
    }

    [string] Route([object]$payload, [int]$preferRing = -1) {
        $candidatos = $this.Nodos.Values | Where-Object {
            $preferRing -eq -1 -or $_.Ring -eq $preferRing
        }
        if (-not $candidatos) { $candidatos = $this.Nodos.Values }

        $mejor = $candidatos | Sort-Object { $_.Load / [Math]::Max($_.Frequency, 0.01) } | Select-Object -First 1
        $mejor.Cargar(1.0)
        return $mejor.Id
    }

    [void] Release([string]$nodeId, [double]$amount = 1.0) {
        if ($this.Nodos.ContainsKey($nodeId)) {
            $this.Nodos[$nodeId].Liberar($amount)
        }
    }

    [hashtable] Condense([hashtable]$estados) {
        $acc = @{}
        $totalW = 0.0

        foreach ($nid in $estados.Keys) {
            $n = $this.Nodos[$nid]
            if (-not $n) { continue }
            $w = $n.Frequency * (1.0 / (1 + $n.Ring))
            $val = $estados[$nid]

            if ($val -is [hashtable]) {
                foreach ($k in $val.Keys) {
                    $v = $val[$k]
                    if ($v -is [double] -or $v -is [int] -or $v -is [decimal]) {
                        if (-not $acc.ContainsKey($k)) { $acc[$k] = 0.0 }
                        $acc[$k] += $v * $w
                        $totalW += $w
                    }
                }
            }
            elseif ($val -is [double] -or $val -is [int]) {
                if (-not $acc.ContainsKey("value")) { $acc["value"] = 0.0 }
                $acc["value"] += $val * $w
                $totalW += $w
            }
        }

        if ($totalW -gt 0) {
            $res = @{}
            foreach ($k in $acc.Keys) { $res[$k] = $acc[$k] / $totalW }
            return $res
        }
        return $acc
    }

    [hashtable] ExecuteInVirtual([scriptblock]$script, [hashtable]$parametros = @{}) {
        $this.Motor.Commands.Clear()
        $this.Motor.AddScript($script)
        foreach ($k in $parametros.Keys) {
            $this.Motor.AddParameter($k, $parametros[$k])
        }
        $resultado = $this.Motor.Invoke()
        return @{ Resultado = $resultado; Errores = $this.Motor.Streams.Error }
    }

    [object] CrearModuloVirtual() {
        $modulo = New-Module -ScriptBlock {
            function Get-EstadoCuantico {
                param([string]$NodoId)
                [PSCustomObject]@{
                    Nodo       = $NodoId
                    Realidad   = "Virtual"
                    Coherencia = 99.8
                    Timestamp  = Get-Date
                    Plano      = "Abstracto-Romeo-Hydra"
                }
            }

            function Invoke-FlujoArmonico {
                param([double]$Valor, [int]$Ring)
                $factor = 1.0 / (1 + $Ring)
                return [Math]::Round($Valor * $factor, 4)
            }

            Export-ModuleMember -Function Get-EstadoCuantico, Invoke-FlujoArmonico
        } -AsCustomObject

        return $modulo
    }

    [string] Visualize() {
        $lines = @("=== Romeo-Hydra Universo Virtual (solo RAM) ===")
        for ($r = 0; $r -le $this.MaxRings; $r++) {
            $ringNodes = $this.Nodos.Values | Where-Object Ring -eq $r
            $info  = ($ringNodes | Select-Object -First 6 | ForEach-Object {
                "$($_.Id.Substring($_.Id.Length-3)):L$([int]$_.Load)"
            }) -join " "
            $extra = if ($ringNodes.Count -gt 6) { " ..." } else { "" }
            $lines += "  Ring $r ($($ringNodes.Count.ToString().PadLeft(2))) → $info$extra"
        }
        return $lines -join "`n"
    }

    [void] Destruir() {
        if ($this.Motor) { $this.Motor.Dispose() }
        if ($this.UniversoRunspace) {
            $this.UniversoRunspace.Close()
            $this.UniversoRunspace.Dispose()
        }
        $this.Nodos.Clear()
        Write-Host "[HydraVirtual] Universo destruido. Nada quedó en disco."
    }
}

# ============================================================
# DEMO – Crear e invocar el universo virtual
# ============================================================

Write-Host "`n>>> Iniciando Romeo-Hydra Virtual Universe...`n" -ForegroundColor Cyan

$hydra = [RomeoHydraVirtual]::new(3)
Write-Host $hydra.Visualize()

# Crear módulo fantasma en memoria
$modVirtual = $hydra.CrearModuloVirtual()
Write-Host "`nMódulo virtual creado en RAM:" -ForegroundColor Yellow
$modVirtual."Get-EstadoCuantico"("Centro") | Format-Table -AutoSize

# Ruteo de ejemplo
$destino = $hydra.Route("payload-prueba", 0)
Write-Host "`nRuteado al nodo central: $destino" -ForegroundColor Green

# Ejecutar código dentro del Runspace aislado
$scriptVirtual = {
    param($msg)
    $global:entidadFantasma = "Nodo activo en el plano abstracto"
    return "Hola desde la realidad virtual → $msg | $entidadFantasma"
}

$resultadoVirtual = $hydra.ExecuteInVirtual($scriptVirtual, @{ msg = "Romeo-Hydra" })
Write-Host "`nResultado del universo aislado:" -ForegroundColor Yellow
Write-Host $resultadoVirtual.Resultado

# Condensación de ejemplo
$estados = @{
    "r1_n0" = @{ valor = 10.0; ruido = 0.3 }
    "r2_n3" = @{ valor = 20.0; ruido = 0.7 }
    "r0_n0" = @{ valor = 50.0; ruido = 0.1 }
}
$condensado = $hydra.Condense($estados)
Write-Host "`nEstado condensado al centro:" -ForegroundColor Yellow
$condensado | Format-Table -AutoSize

# Limpieza total
$hydra.Destruir()
Write-Host "`n>>> Universo virtual eliminado. Memoria liberada.`n" -ForegroundColor Cyan