# Servidor local para probar el portfolio.
#
# Uso:   powershell -NoProfile -ExecutionPolicy Bypass -File .herramientas\servidor.ps1
#        (o, desde Claude Code, preview_start con el nombre "portfolio")
# Abre:  http://localhost:8100/
#
# Por que no alcanza con cualquier servidor:
# - Soporta range requests. Sin eso los mp4 no se pueden adelantar y el
#   navegador corta la descarga; los servidores simples se caen al servir
#   el video grande de Green Eat.
# - Tolera que el navegador aborte una descarga a mitad de camino.
# - Manda Cache-Control: no-store, asi cada recarga trae el CSS, el JS y
#   las imagenes nuevas sin depender del ?v=.
#
# Sin acentos a proposito: PowerShell 5.1 lee los .ps1 como ANSI y un
# caracter no ASCII puede romper el script.

param([int]$Puerto = 8100)

$raiz = Split-Path -Parent $PSScriptRoot

$tipos = @{
  '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'
  '.js'='application/javascript; charset=utf-8'; '.json'='application/json'
  '.md'='text/plain; charset=utf-8'; '.txt'='text/plain; charset=utf-8'
  '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.png'='image/png'
  '.gif'='image/gif'; '.svg'='image/svg+xml'; '.webp'='image/webp'
  '.ico'='image/x-icon'; '.mp4'='video/mp4'; '.glb'='model/gltf-binary'
  '.pdf'='application/pdf'; '.woff2'='font/woff2'
}

$oyente = New-Object System.Net.HttpListener
$oyente.Prefixes.Add("http://localhost:$Puerto/")
$oyente.Start()
Write-Output "Sirviendo $raiz en http://localhost:$Puerto/  (Ctrl+C para cortar)"

while ($oyente.IsListening) {
  try {
    $ctx = $oyente.GetContext()
    $pedido = $ctx.Request
    $respuesta = $ctx.Response

    $relativa = [System.Uri]::UnescapeDataString($pedido.Url.AbsolutePath.TrimStart('/'))
    if ($relativa -eq '' -or $relativa.EndsWith('/')) { $relativa = $relativa + 'index.html' }
    $ruta = Join-Path $raiz ($relativa -replace '/', '\')

    if (-not (Test-Path -LiteralPath $ruta -PathType Leaf)) {
      $respuesta.StatusCode = 404
      $respuesta.Close()
      continue
    }

    $extension = [System.IO.Path]::GetExtension($ruta).ToLower()
    $tipo = $tipos[$extension]
    if (-not $tipo) { $tipo = 'application/octet-stream' }
    $respuesta.ContentType = $tipo
    $respuesta.Headers.Add('Cache-Control', 'no-store')
    $respuesta.Headers.Add('Accept-Ranges', 'bytes')

    $archivo = [System.IO.File]::Open($ruta, 'Open', 'Read', 'ReadWrite')
    $largo = $archivo.Length
    $desde = [int64]0
    $hasta = $largo - 1

    $rango = $pedido.Headers['Range']
    if ($rango -and $rango -match 'bytes=(\d*)-(\d*)') {
      if ($matches[1] -ne '') { $desde = [int64]$matches[1] }
      if ($matches[2] -ne '') { $hasta = [int64]$matches[2] }
      if ($hasta -ge $largo) { $hasta = $largo - 1 }
      $respuesta.StatusCode = 206
      $respuesta.Headers.Add('Content-Range', "bytes $desde-$hasta/$largo")
    }

    $cantidad = $hasta - $desde + 1
    $respuesta.ContentLength64 = $cantidad
    $archivo.Position = $desde

    $bufer = New-Object byte[] 65536
    $queda = $cantidad
    try {
      while ($queda -gt 0) {
        $leidos = $archivo.Read($bufer, 0, [Math]::Min($bufer.Length, $queda))
        if ($leidos -le 0) { break }
        $respuesta.OutputStream.Write($bufer, 0, $leidos)
        $queda -= $leidos
      }
    } catch {
      # El navegador corto la descarga: no es un error del servidor.
    }
    $archivo.Close()
    try { $respuesta.Close() } catch {}
  } catch {
    # Un pedido roto no puede tumbar el servidor.
  }
}
