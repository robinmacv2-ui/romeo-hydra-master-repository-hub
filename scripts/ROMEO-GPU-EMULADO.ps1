# ROMEO-HYDRA · Emulador de throughput tipo GPU en PowerShell puro (solo CPU)
# Autor: Luis Angel Vazquez Martinez
# Uso:  .\ROMEO-GPU-EMULADO.ps1 -NumReglas 100
# No requiere NVIDIA. Multiproceso / trabajos en paralelo del SO.

param(
    [int]$NumReglas = 100,
    [int]$Workers = 0
)

$ErrorActionPreference = "Stop"
if ($Workers -le 0) { $Workers = [Math]::Max(1, [Environment]::ProcessorCount) }

function Verificar-Regla {
    param([int]$Id)
    # Placeholder: trabajo CPU denso (reemplazar por P_LAM / Hessiana real)
    $acc = 0.0
    for ($i = 0; $i -lt 20000; $i++) {
        $acc += [Math]::Sqrt(($Id + 1) * ($i % 97 + 1))
    }
    return $acc
}

Write-Host "=== ROMEO CPU parallel (no GPU) ==="
Write-Host "Reglas=$NumReglas  Workers=$Workers  Cores=$([Environment]::ProcessorCount)"

# --- Serie ---
$sw = [System.Diagnostics.Stopwatch]::StartNew()
1..$NumReglas | ForEach-Object { [void](Verificar-Regla -Id $_) }
$sw.Stop()
$serial = $sw.Elapsed.TotalSeconds
Write-Host ("SERIE    : {0:N3} s" -f $serial)

# --- Paralelo (runspaces / ForEach-Object -Parallel si PS7+) ---
$sw.Restart()
if ($PSVersionTable.PSVersion.Major -ge 7) {
    1..$NumReglas | ForEach-Object -Parallel {
        $acc = 0.0
        for ($i = 0; $i -lt 20000; $i++) {
            $acc += [Math]::Sqrt(($_ + 1) * ($i % 97 + 1))
        }
        $acc
    } -ThrottleLimit $Workers | Out-Null
} else {
    # PS 5.1: jobs por lotes
    $batch = [Math]::Max(1, [Math]::Ceiling($NumReglas / $Workers))
    $jobs = @()
    for ($w = 0; $w -lt $Workers; $w++) {
        $start = $w * $batch + 1
        $end = [Math]::Min($NumReglas, ($w + 1) * $batch)
        if ($start -le $end) {
            $jobs += Start-Job -ScriptBlock {
                param($a, $b)
                function Verificar-Regla([int]$Id) {
                    $acc = 0.0
                    for ($i = 0; $i -lt 20000; $i++) {
                        $acc += [Math]::Sqrt(($Id + 1) * ($i % 97 + 1))
                    }
                    return $acc
                }
                for ($k = $a; $k -le $b; $k++) { [void](Verificar-Regla $k) }
            } -ArgumentList $start, $end
        }
    }
    $jobs | Wait-Job | Out-Null
    $jobs | Remove-Job
}
$sw.Stop()
$parallel = $sw.Elapsed.TotalSeconds
Write-Host ("PARALELO : {0:N3} s" -f $parallel)
if ($parallel -gt 0) {
    Write-Host ("Speedup  : {0:N2}x" -f ($serial / $parallel))
}
Write-Host "Nota: esto NO es CUDA/GPU; son nucleos CPU en paralelo."
