# Convierte imagenes del material del autor al tamanio web del portfolio.
#
# Uso, un archivo:
#   powershell -NoProfile -ExecutionPolicy Bypass -File .herramientas\convertir.ps1 `
#     -Origen 'D:\Martin\PORTFOLIO WEB\...\1.jpg' -Destino 'assets\images\x\01.jpg' -Ancho 1400
#
# Uso, una carpeta entera (mismos nombres, en .jpg):
#   ... -Origen 'D:\Martin\PORTFOLIO WEB\...\carpeta' -Destino 'assets\images\x' -Ancho 1200
#
# Opciones:
#   -Ancho    ancho maximo de salida. Nunca agranda: si el original es mas
#             chico, sale a su tamanio.
#   -Calidad  JPEG, 82 por defecto. Para ilustraciones de linea sobre plano
#             usar 88: a 82 el contorno negro anilla.
#
# Ojo con los PNG con transparencia: al pasar a JPG se aplanan. Los logos
# recortados y los GIF animados se copian sin convertir.
#
# Sin acentos a proposito: PowerShell 5.1 lee los .ps1 como ANSI. Para
# rutas con enie, pasarlas desde la linea de comandos, no escribirlas
# dentro de un script, o usar comodines (1REDISE*O DE SUMA).
# Y cuidado al tocar esto: las variables no distinguen mayusculas, $h pisa
# a $H. Por eso los nombres largos.

param(
  [Parameter(Mandatory = $true)][string]$Origen,
  [Parameter(Mandatory = $true)][string]$Destino,
  [Parameter(Mandatory = $true)][int]$Ancho,
  [int]$Calidad = 82
)

Add-Type -AssemblyName System.Drawing

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$parametros = New-Object System.Drawing.Imaging.EncoderParameters 1
$parametros.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]$Calidad)

function Convertir-Una([string]$entrada, [string]$salida) {
  $imagen = [System.Drawing.Image]::FromFile($entrada)
  try {
    $anchoSalida = [Math]::Min($Ancho, $imagen.Width)
    $altoSalida = [int][Math]::Round($anchoSalida * $imagen.Height / $imagen.Width)
    $lienzo = New-Object System.Drawing.Bitmap ($anchoSalida, $altoSalida)
    $grafico = [System.Drawing.Graphics]::FromImage($lienzo)
    $grafico.InterpolationMode = 'HighQualityBicubic'
    $grafico.PixelOffsetMode = 'HighQuality'
    $grafico.SmoothingMode = 'HighQuality'
    $grafico.DrawImage($imagen, 0, 0, $anchoSalida, $altoSalida)
    $carpeta = Split-Path -Parent $salida
    if ($carpeta -and -not (Test-Path $carpeta)) { New-Item -ItemType Directory -Path $carpeta | Out-Null }
    $lienzo.Save($salida, $codec, $parametros)
    $grafico.Dispose(); $lienzo.Dispose()
    $kb = [int]((Get-Item $salida).Length / 1024)
    Write-Output ('{0}  {1}x{2} -> {3}x{4}  proporcion {5}  {6} KB' -f (Split-Path -Leaf $salida), $imagen.Width, $imagen.Height, $anchoSalida, $altoSalida, [Math]::Round($anchoSalida / $altoSalida, 4), $kb)
  } finally {
    $imagen.Dispose()
  }
}

if (Test-Path -LiteralPath $Origen -PathType Container) {
  $total = 0
  Get-ChildItem -LiteralPath $Origen -File | Where-Object { $_.Extension -match '^\.(jpe?g|png)$' } | Sort-Object Name | ForEach-Object {
    $salida = Join-Path $Destino ($_.BaseName + '.jpg')
    Convertir-Una $_.FullName $salida
    $total += (Get-Item $salida).Length
  }
  Write-Output ('Total: {0} KB' -f [int]($total / 1024))
} else {
  Convertir-Una $Origen $Destino
}
