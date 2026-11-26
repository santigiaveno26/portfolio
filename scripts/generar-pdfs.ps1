# Genera los PDF para adjuntar (portfolio completo + un PDF por caso, en ES y EN).
# Uso: con el servidor de desarrollo corriendo (npm run dev), ejecutar:
#   powershell -ExecutionPolicy Bypass -File scripts\generar-pdfs.ps1
# Salida: public\pdf\  (se publican en el sitio y se pueden adjuntar)

param([string]$Base = 'http://localhost:4321')

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'public\pdf'
New-Item -ItemType Directory -Force $out | Out-Null

$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") |
  Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw 'No encontré Microsoft Edge para imprimir los PDF.' }

$slugs = (Get-Content (Join-Path $root 'src\data\cases.ts') -Raw | Select-String -Pattern "slug: '([a-z0-9-]+)'" -AllMatches).Matches |
  ForEach-Object { $_.Groups[1].Value }

$jobs = @(
  @{ url = "$Base/pdf/";    file = 'Portfolio_Santiago_Giaveno_ES.pdf' },
  @{ url = "$Base/en/pdf/"; file = 'Portfolio_Santiago_Giaveno_EN.pdf' }
)
foreach ($s in $slugs) {
  $jobs += @{ url = "$Base/pdf/$s/";    file = "Santiago_Giaveno_Caso_$s.pdf" }
  $jobs += @{ url = "$Base/en/pdf/$s/"; file = "Santiago_Giaveno_Case_$s.pdf" }
}

$ErrorActionPreference = 'Continue' # Edge escribe avisos en stderr que no son errores
foreach ($j in $jobs) {
  $dest = Join-Path $out $j.file
  if (Test-Path $dest) { Remove-Item $dest }
  & $edge --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=4000 "--print-to-pdf=$dest" $j.url 2>$null | Out-Null
  if (Test-Path $dest) { "OK  $($j.file)" } else { "ERROR  $($j.file)" }
}
