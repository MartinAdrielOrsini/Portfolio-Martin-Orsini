# Rasteriza las paginas de un PDF a JPG, con la API nativa de Windows
# (Windows.Data.Pdf). No hay poppler, ImageMagick ni Python en esta maquina.
#
# Ver cuantas paginas tiene y de que tamanio:
#   powershell -NoProfile -ExecutionPolicy Bypass -File .herramientas\pdf.ps1 `
#     -Pdf 'D:\Martin\PORTFOLIO WEB\...\archivo.pdf' -Info
#
# Todas las paginas a una carpeta (01.jpg, 02.jpg...):
#   ... -Pdf '...\archivo.pdf' -Destino 'assets\images\x' -Ancho 1100
#
# Una sola pagina a un archivo:
#   ... -Pdf '...\archivo.pdf' -Pagina 1 -Destino 'assets\images\x\portada.jpg' -Ancho 800
#
# Opciones:
#   -Ancho    ancho de salida en px. La pagina se dibuja al doble y se achica
#             con bicubica: el texto sale mas parejo que dibujandola directo.
#   -Calidad  JPEG, 80 por defecto (lo mismo que las paginas del libro).
#
# El fondo es blanco: las paginas con transparencia se aplanan sobre blanco.
#
# Sin acentos a proposito: PowerShell 5.1 lee los .ps1 como ANSI. Las rutas
# con enie se pasan desde la linea de comandos.

param(
  [Parameter(Mandatory = $true)][string]$Pdf,
  [string]$Destino,
  [int]$Ancho = 1100,
  [int]$Calidad = 80,
  [int]$Pagina = 0,
  [switch]$Info
)

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime]
$null = [Windows.Data.Pdf.PdfPageRenderOptions, Windows.Data.Pdf, ContentType = WindowsRuntime]
$null = [Windows.Storage.Streams.InMemoryRandomAccessStream, Windows.Storage.Streams, ContentType = WindowsRuntime]

# PowerShell no sabe esperar operaciones de WinRT: se pasan a Task de .NET.
$metodosAsTask = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 }
$asTaskOperacion = $metodosAsTask | Where-Object { $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } | Select-Object -First 1
$asTaskAccion = $metodosAsTask | Where-Object { $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction' } | Select-Object -First 1

function Esperar($operacion, [Type]$tipo) {
  $tarea = $asTaskOperacion.MakeGenericMethod($tipo).Invoke($null, @($operacion))
  $tarea.Wait(-1) | Out-Null
  $tarea.Result
}
function Esperar-Accion($accion) {
  $tarea = $asTaskAccion.Invoke($null, @($accion))
  $tarea.Wait(-1) | Out-Null
}

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$parametros = New-Object System.Drawing.Imaging.EncoderParameters 1
$parametros.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]$Calidad)

function Renderizar-Pagina($documento, [int]$numero, [string]$salida) {
  $paginaPdf = $documento.GetPage([uint32]($numero - 1))
  try {
    $opciones = New-Object Windows.Data.Pdf.PdfPageRenderOptions
    $opciones.DestinationWidth = [uint32]($Ancho * 2)
    $flujo = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
    Esperar-Accion ($paginaPdf.RenderToStreamAsync($flujo, $opciones))
    $flujoNet = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($flujo.GetInputStreamAt(0))
    $grande = [System.Drawing.Image]::FromStream($flujoNet)
    try {
      $altoSalida = [int][Math]::Round($Ancho * $grande.Height / $grande.Width)
      $lienzo = New-Object System.Drawing.Bitmap ($Ancho, $altoSalida)
      $grafico = [System.Drawing.Graphics]::FromImage($lienzo)
      $grafico.Clear([System.Drawing.Color]::White)
      $grafico.InterpolationMode = 'HighQualityBicubic'
      $grafico.PixelOffsetMode = 'HighQuality'
      $grafico.SmoothingMode = 'HighQuality'
      $grafico.DrawImage($grande, 0, 0, $Ancho, $altoSalida)
      $carpeta = Split-Path -Parent $salida
      if ($carpeta -and -not (Test-Path $carpeta)) { New-Item -ItemType Directory -Path $carpeta | Out-Null }
      $lienzo.Save($salida, $codec, $parametros)
      $grafico.Dispose(); $lienzo.Dispose()
      $kb = [int]((Get-Item $salida).Length / 1024)
      Write-Output ('{0}  {1}x{2}  {3} KB' -f (Split-Path -Leaf $salida), $Ancho, $altoSalida, $kb)
    } finally {
      $grande.Dispose(); $flujoNet.Dispose(); $flujo.Dispose()
    }
  } finally {
    $paginaPdf.Dispose()
  }
}

$rutaPdf = (Resolve-Path -LiteralPath $Pdf).Path
$archivo = Esperar ([Windows.Storage.StorageFile]::GetFileFromPathAsync($rutaPdf)) ([Windows.Storage.StorageFile])
$documento = Esperar ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($archivo)) ([Windows.Data.Pdf.PdfDocument])

if ($Info) {
  Write-Output ('{0}: {1} paginas' -f (Split-Path -Leaf $rutaPdf), $documento.PageCount)
  for ($i = 0; $i -lt $documento.PageCount; $i++) {
    $paginaPdf = $documento.GetPage([uint32]$i)
    $tam = $paginaPdf.Size
    Write-Output ('  {0,2}  {1:0.##} x {2:0.##} pt  proporcion {3:0.0000}  rotacion {4}' -f ($i + 1), ($tam.Width * 0.75), ($tam.Height * 0.75), ($tam.Width / $tam.Height), $paginaPdf.Rotation)
    $paginaPdf.Dispose()
  }
  return
}

if (-not $Destino) { throw 'Falta -Destino' }

if ($Pagina -gt 0) {
  Renderizar-Pagina $documento $Pagina $Destino
} else {
  $total = 0
  for ($n = 1; $n -le $documento.PageCount; $n++) {
    $salida = Join-Path $Destino ('{0:00}.jpg' -f $n)
    Renderizar-Pagina $documento $n $salida
    $total += (Get-Item $salida).Length
  }
  Write-Output ('Total: {0} KB' -f [int]($total / 1024))
}
