# Saca la imagen compuesta de un PSD (la que Photoshop guarda aplanada al
# final del archivo) y la exporta a JPG. System.Drawing y WPF no abren PSD.
#
# Uso:
#   powershell -NoProfile -ExecutionPolicy Bypass -File .herramientas\psd-a-jpg.ps1 `
#     -Origen 'D:\Martin\PORTFOLIO WEB\algo.psd' -Destino 'assets\algo.jpg' [-Ancho 1200] [-Alto 630] [-Calidad 85]
#
# Con -Ancho y -Alto a la vez, llena ese cuadro y recorta al centro lo que
# sobra (para imagenes de medida fija, como la de compartir en redes). Con
# uno solo, escala sin recortar. Sin ninguno, sale al tamanio del PSD.
#
# Soporta PSD de 8 bits en RGB o escala de grises, sin comprimir o con RLE.
# Si el PSD se guardo sin "Maximizar compatibilidad", la compuesta puede
# venir en blanco: en ese caso hay que reexportar desde Photoshop.
#
# Sin acentos a proposito: PowerShell 5.1 lee los .ps1 como ANSI.

param(
  [Parameter(Mandatory = $true)][string]$Origen,
  [Parameter(Mandatory = $true)][string]$Destino,
  [int]$Ancho = 0,
  [int]$Alto = 0,
  [int]$Calidad = 85
)

Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;

public static class LectorPsd {
  static int U16(byte[] b, int p) { return (b[p] << 8) | b[p + 1]; }
  static long U32(byte[] b, int p) { return ((long)b[p] << 24) | ((long)b[p + 1] << 16) | ((long)b[p + 2] << 8) | b[p + 3]; }

  public static Bitmap Compuesta(string ruta, out string info) {
    byte[] b = File.ReadAllBytes(ruta);
    if (b[0] != '8' || b[1] != 'B' || b[2] != 'P' || b[3] != 'S') throw new Exception("No es un PSD");
    int version = U16(b, 4);
    int canales = U16(b, 12);
    int alto = (int)U32(b, 14), ancho = (int)U32(b, 18);
    int prof = U16(b, 22), modo = U16(b, 24);
    info = string.Format("{0}x{1}, {2} canales, {3} bits, modo {4}, version {5}", ancho, alto, canales, prof, modo, version);
    if (prof != 8) throw new Exception("Solo 8 bits por canal: " + info);
    if (modo != 3 && modo != 1) throw new Exception("Solo RGB o escala de grises: " + info);
    bool psb = version == 2;
    int p = 26;
    p += 4 + (int)U32(b, p);                       // datos de color
    p += 4 + (int)U32(b, p);                       // recursos de imagen
    long capas = psb ? ((long)U32(b, p) << 32) | U32(b, p + 4) : U32(b, p);
    p += (psb ? 8 : 4) + (int)capas;               // capas y mascaras
    int compresion = U16(b, p); p += 2;
    int usados = Math.Min(canales, modo == 3 ? 3 : 1);
    byte[][] planos = new byte[canales][];
    for (int c = 0; c < canales; c++) planos[c] = new byte[ancho * alto];

    if (compresion == 0) {
      for (int c = 0; c < canales; c++) { Array.Copy(b, p, planos[c], 0, ancho * alto); p += ancho * alto; }
    } else if (compresion == 1) {
      int tam = psb ? 4 : 2;
      int[] cuentas = new int[canales * alto];
      for (int i = 0; i < cuentas.Length; i++) cuentas[i] = psb ? (int)U32(b, p + i * 4) : U16(b, p + i * 2);
      p += cuentas.Length * tam;
      for (int c = 0; c < canales; c++) {
        for (int y = 0; y < alto; y++) {
          int fin = p + cuentas[c * alto + y];
          int x = 0, fila = y * ancho;
          while (p < fin && x < ancho) {
            int n = (sbyte)b[p++];
            if (n >= 0) { int k = n + 1; for (int i = 0; i < k && x < ancho; i++) planos[c][fila + x++] = b[p++]; }
            else if (n != -128) { int k = 1 - n; byte v = b[p++]; for (int i = 0; i < k && x < ancho; i++) planos[c][fila + x++] = v; }
          }
          p = fin;
        }
      }
    } else throw new Exception("Compresion no soportada: " + compresion);

    Bitmap bmp = new Bitmap(ancho, alto, PixelFormat.Format24bppRgb);
    BitmapData d = bmp.LockBits(new Rectangle(0, 0, ancho, alto), ImageLockMode.WriteOnly, PixelFormat.Format24bppRgb);
    byte[] fila24 = new byte[d.Stride];
    for (int y = 0; y < alto; y++) {
      for (int x = 0; x < ancho; x++) {
        int i = y * ancho + x;
        byte r = planos[0][i];
        byte g = usados == 3 ? planos[1][i] : r;
        byte bl = usados == 3 ? planos[2][i] : r;
        fila24[x * 3] = bl; fila24[x * 3 + 1] = g; fila24[x * 3 + 2] = r;
      }
      System.Runtime.InteropServices.Marshal.Copy(fila24, 0, d.Scan0 + y * d.Stride, d.Stride);
    }
    bmp.UnlockBits(d);
    return bmp;
  }
}
"@

$ruta = (Resolve-Path -LiteralPath $Origen).Path
if (-not [System.IO.Path]::IsPathRooted($Destino)) { $Destino = Join-Path (Get-Location).Path $Destino }
$info = ''
$compuesta = [LectorPsd]::Compuesta($ruta, [ref]$info)
Write-Output "PSD: $info"

$w0 = $compuesta.Width; $h0 = $compuesta.Height
if ($Ancho -gt 0 -and $Alto -gt 0) {
  $escala = [Math]::Max($Ancho / $w0, $Alto / $h0)
  $anchoSalida = $Ancho; $altoSalida = $Alto
} elseif ($Ancho -gt 0) {
  $escala = [Math]::Min(1, $Ancho / $w0); $anchoSalida = [int][Math]::Round($w0 * $escala); $altoSalida = [int][Math]::Round($h0 * $escala)
} elseif ($Alto -gt 0) {
  $escala = [Math]::Min(1, $Alto / $h0); $anchoSalida = [int][Math]::Round($w0 * $escala); $altoSalida = [int][Math]::Round($h0 * $escala)
} else {
  $escala = 1; $anchoSalida = $w0; $altoSalida = $h0
}
$lienzo = New-Object System.Drawing.Bitmap -ArgumentList $anchoSalida, $altoSalida
$grafico = [System.Drawing.Graphics]::FromImage($lienzo)
$grafico.InterpolationMode = 'HighQualityBicubic'
$grafico.PixelOffsetMode = 'HighQuality'
$wEsc = $w0 * $escala; $hEsc = $h0 * $escala
$grafico.DrawImage($compuesta, [float](($anchoSalida - $wEsc) / 2), [float](($altoSalida - $hEsc) / 2), [float]$wEsc, [float]$hEsc)
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$parametros = New-Object System.Drawing.Imaging.EncoderParameters 1
$parametros.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]$Calidad)
$lienzo.Save($Destino, $codec, $parametros)
$grafico.Dispose(); $lienzo.Dispose(); $compuesta.Dispose()
Write-Output ('{0}: {1}x{2} -> {3}x{4}, {5} KB' -f (Split-Path -Leaf $Destino), $w0, $h0, $anchoSalida, $altoSalida, [int]((Get-Item $Destino).Length / 1024))
