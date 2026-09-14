# Recorta un GIF animado sin perder la animacion y sin recomprimir colores.
#
# No hay ffmpeg ni ImageMagick en esta maquina, y System.Drawing no sabe
# escribir GIF animados: los aplana a un cuadro. Esto trabaja sobre el
# archivo mismo: decodifica el LZW de cada cuadro, recorta los indices de
# color y los vuelve a codificar con la MISMA paleta. Quedan intactos los
# tiempos de cada cuadro, el bucle, la transparencia y el metodo de
# descarte. No hay perdida: cada pixel del recorte es el del original.
#
# Uso, con una imagen que muestra el encuadre buscado (misma escala que el
# GIF; el script busca solo donde cae):
#   powershell -NoProfile -ExecutionPolicy Bypass -File .herramientas\recortar-gif.ps1 `
#     -Origen '...\5 sin encuadrar.gif' -Encuadre '...\5 encuadre.gif' -Destino 'assets\...\05.gif'
#
# Uso, con el rectangulo a mano:
#   ... -Origen '...\x.gif' -Destino '...\y.gif' -X 89 -Y 0 -Ancho 1222 -Alto 939
#
# Al terminar vuelve a abrir el resultado y compara cuadro por cuadro con el
# original recortado: la diferencia tiene que dar 0.
#
# Sin acentos a proposito: PowerShell 5.1 lee los .ps1 como ANSI.

param(
  [Parameter(Mandatory = $true)][string]$Origen,
  [Parameter(Mandatory = $true)][string]$Destino,
  [string]$Encuadre,
  [int]$X = -1,
  [int]$Y = -1,
  [int]$Ancho = 0,
  [int]$Alto = 0
)

Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.IO;
using System.Text;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;

public static class RecorteGif {

  // ---------- LZW de GIF ----------
  public static byte[] Decodificar(byte[] datos, int minimo, int cantidad) {
    byte[] salida = new byte[cantidad];
    int pos = 0;
    int clear = 1 << minimo, eoi = clear + 1;
    int tam = minimo + 1, sig = eoi + 1;
    int[] prefijo = new int[4096];
    byte[] sufijo = new byte[4096];
    byte[] pila = new byte[4097];
    for (int i = 0; i < clear; i++) sufijo[i] = (byte)i;
    int viejo = -1;
    byte primero = 0;
    long bits = 0; int nbits = 0; int idx = 0;
    while (true) {
      while (nbits < tam) {
        if (idx >= datos.Length) return salida;
        bits |= (long)datos[idx++] << nbits; nbits += 8;
      }
      int codigo = (int)(bits & ((1 << tam) - 1));
      bits >>= tam; nbits -= tam;
      if (codigo == clear) { tam = minimo + 1; sig = eoi + 1; viejo = -1; continue; }
      if (codigo == eoi) break;
      if (viejo == -1) {
        if (codigo >= clear) return salida;
        if (pos < cantidad) salida[pos++] = sufijo[codigo];
        viejo = codigo; primero = sufijo[codigo];
        continue;
      }
      int entrada = codigo;
      int sp = 0;
      if (codigo >= sig) { pila[sp++] = primero; codigo = viejo; }
      while (codigo >= clear) { pila[sp++] = sufijo[codigo]; codigo = prefijo[codigo]; }
      primero = sufijo[codigo];
      pila[sp++] = primero;
      while (sp > 0) { byte c = pila[--sp]; if (pos < cantidad) salida[pos++] = c; }
      if (sig < 4096) {
        prefijo[sig] = viejo; sufijo[sig] = primero; sig++;
        if (sig == (1 << tam) && tam < 12) tam++;
      }
      viejo = entrada;
    }
    return salida;
  }

  public static byte[] Codificar(byte[] indices, int minimo) {
    MemoryStream ms = new MemoryStream();
    int clear = 1 << minimo, eoi = clear + 1;
    int tam = minimo + 1, sig = eoi + 1;
    Dictionary<int, int> dic = new Dictionary<int, int>();
    long bits = 0; int nbits = 0;
    Action<int> emitir = delegate(int c) {
      bits |= (long)c << nbits; nbits += tam;
      while (nbits >= 8) { ms.WriteByte((byte)(bits & 0xFF)); bits >>= 8; nbits -= 8; }
    };
    emitir(clear);
    if (indices.Length > 0) {
      int pref = indices[0];
      for (int i = 1; i < indices.Length; i++) {
        int c = indices[i];
        int clave = (pref << 8) | c;
        int v;
        if (dic.TryGetValue(clave, out v)) { pref = v; continue; }
        emitir(pref);
        if (sig < 4096) {
          dic[clave] = sig++;
          if (sig > (1 << tam) && tam < 12) tam++;
        } else {
          emitir(clear);
          dic.Clear(); tam = minimo + 1; sig = eoi + 1;
        }
        pref = c;
      }
      emitir(pref);
    }
    emitir(eoi);
    if (nbits > 0) ms.WriteByte((byte)(bits & 0xFF));
    return ms.ToArray();
  }

  static byte[] LeerSubbloques(byte[] g, ref int p) {
    MemoryStream ms = new MemoryStream();
    while (true) { int n = g[p++]; if (n == 0) break; ms.Write(g, p, n); p += n; }
    return ms.ToArray();
  }

  static void EscribirSubbloques(Stream s, byte[] d) {
    int p = 0;
    while (p < d.Length) { int n = Math.Min(255, d.Length - p); s.WriteByte((byte)n); s.Write(d, p, n); p += n; }
    s.WriteByte(0);
  }

  static byte[] Desentrelazar(byte[] a, int w, int h) {
    byte[] r = new byte[w * h];
    int[] inicio = { 0, 4, 2, 1 };
    int[] paso = { 8, 8, 4, 2 };
    int fila = 0;
    for (int pasada = 0; pasada < 4; pasada++)
      for (int y = inicio[pasada]; y < h; y += paso[pasada]) { Array.Copy(a, fila * w, r, y * w, w); fila++; }
    return r;
  }

  static void Palabra(Stream s, int v) { s.WriteByte((byte)(v & 0xFF)); s.WriteByte((byte)((v >> 8) & 0xFF)); }

  // ---------- Recorte ----------
  public static string Recortar(string origen, string destino, int cx, int cy, int cw, int ch) {
    byte[] g = File.ReadAllBytes(origen);
    StringBuilder log = new StringBuilder();
    MemoryStream o = new MemoryStream();
    o.Write(g, 0, 6);
    int W = g[6] | (g[7] << 8), H = g[8] | (g[9] << 8);
    if (cx < 0 || cy < 0 || cx + cw > W || cy + ch > H) throw new Exception("El recorte se sale del GIF");
    Palabra(o, cw); Palabra(o, ch);
    o.Write(g, 10, 3);
    int p = 13;
    if ((g[10] & 0x80) != 0) { int n = 3 << ((g[10] & 7) + 1); o.Write(g, p, n); p += n; }
    int cuadros = 0, gce = -1;
    bool bucle = false, cerrado = false;
    while (p < g.Length) {
      byte b = g[p];
      if (b == 0x3B) { o.WriteByte(0x3B); cerrado = true; break; }
      if (b == 0x21) {
        byte etiqueta = g[p + 1];
        int ini = p; p += 2;
        if (etiqueta == 0xF9) {
          gce = (int)o.Position;
          int demora = g[ini + 4] | (g[ini + 5] << 8);
          log.AppendFormat("  cuadro {0}: demora {1} cs, descarte {2}{3}\n", cuadros + 1, demora, (g[ini + 3] >> 2) & 7, (g[ini + 3] & 1) != 0 ? ", con transparencia" : "");
        }
        if (etiqueta == 0xFF && g[ini + 3] == (byte)'N') bucle = true;
        while (true) { int n = g[p++]; if (n == 0) break; p += n; }
        o.Write(g, ini, p - ini);
        continue;
      }
      if (b == 0x2C) {
        int l = g[p + 1] | (g[p + 2] << 8), t = g[p + 3] | (g[p + 4] << 8);
        int w = g[p + 5] | (g[p + 6] << 8), h = g[p + 7] | (g[p + 8] << 8);
        byte pk = g[p + 9];
        p += 10;
        byte[] lct = null;
        if ((pk & 0x80) != 0) { int n = 3 << ((pk & 7) + 1); lct = new byte[n]; Array.Copy(g, p, lct, 0, n); p += n; }
        int minimo = g[p++];
        byte[] datos = LeerSubbloques(g, ref p);
        byte[] ind = Decodificar(datos, minimo, w * h);
        if ((pk & 0x40) != 0) ind = Desentrelazar(ind, w, h);
        int x0 = Math.Max(l, cx), y0 = Math.Max(t, cy);
        int x1 = Math.Min(l + w, cx + cw), y1 = Math.Min(t + h, cy + ch);
        int nw = x1 - x0, nh = y1 - y0;
        byte[] rec;
        if (nw <= 0 || nh <= 0) {
          // El cuadro cae entero fuera del recorte: se deja un pixel
          // transparente para no perder su tiempo.
          x0 = cx; y0 = cy; nw = 1; nh = 1; rec = new byte[1];
          if (gce >= 0) {
            byte[] buf = o.GetBuffer();
            if ((buf[gce + 3] & 1) == 0) { buf[gce + 3] |= 1; buf[gce + 6] = 0; }
            rec[0] = buf[gce + 6];
          }
        } else {
          rec = new byte[nw * nh];
          for (int y = 0; y < nh; y++) Array.Copy(ind, (y0 - t + y) * w + (x0 - l), rec, y * nw, nw);
        }
        o.WriteByte(0x2C);
        Palabra(o, x0 - cx); Palabra(o, y0 - cy); Palabra(o, nw); Palabra(o, nh);
        o.WriteByte((byte)(pk & ~0x40));
        if (lct != null) o.Write(lct, 0, lct.Length);
        o.WriteByte((byte)minimo);
        EscribirSubbloques(o, Codificar(rec, minimo));
        cuadros++; gce = -1;
        continue;
      }
      throw new Exception("Bloque desconocido en el byte " + p);
    }
    if (!cerrado) o.WriteByte(0x3B);
    File.WriteAllBytes(destino, o.ToArray());
    return string.Format("{0}x{1} -> {2}x{3} desde x {4} y {5}; {6} cuadros; bucle: {7}\n{8}",
      W, H, cw, ch, cx, cy, cuadros, bucle ? "si" : "NO", log.ToString());
  }

  // ---------- Pixeles para buscar y verificar ----------
  static byte[] Bytes(Bitmap bmp, out int stride) {
    BitmapData d = bmp.LockBits(new Rectangle(0, 0, bmp.Width, bmp.Height), ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
    stride = d.Stride;
    byte[] buf = new byte[stride * bmp.Height];
    System.Runtime.InteropServices.Marshal.Copy(d.Scan0, buf, 0, buf.Length);
    bmp.UnlockBits(d);
    return buf;
  }

  static List<Bitmap> Cuadros(string ruta) {
    List<Bitmap> r = new List<Bitmap>();
    using (Image img = Image.FromFile(ruta)) {
      FrameDimension fd = new FrameDimension(img.FrameDimensionsList[0]);
      int n = img.GetFrameCount(fd);
      for (int i = 0; i < n; i++) {
        img.SelectActiveFrame(fd, i);
        Bitmap b = new Bitmap(img.Width, img.Height, PixelFormat.Format24bppRgb);
        using (Graphics gr = Graphics.FromImage(b)) { gr.Clear(Color.White); gr.DrawImageUnscaled(img, 0, 0); }
        r.Add(b);
      }
    }
    return r;
  }

  // Donde cae la imagen de encuadre dentro del GIF (misma escala).
  public static int[] Buscar(string gif, string encuadre) {
    List<Bitmap> cuadros = Cuadros(gif);
    Bitmap e;
    using (Image ie = Image.FromFile(encuadre)) {
      e = new Bitmap(ie.Width, ie.Height, PixelFormat.Format24bppRgb);
      using (Graphics gr = Graphics.FromImage(e)) { gr.Clear(Color.White); gr.DrawImageUnscaled(ie, 0, 0); }
    }
    int se; byte[] be = Bytes(e, out se);
    int w = e.Width, h = e.Height;
    int[] mejor = { 0, 0, w, h, 0, int.MaxValue };
    for (int f = 0; f < cuadros.Count; f++) {
      Bitmap c = cuadros[f];
      int sc; byte[] bc = Bytes(c, out sc);
      for (int dy = 0; dy <= c.Height - h; dy++)
        for (int dx = 0; dx <= c.Width - w; dx++) {
          long suma = 0; int n = 0; bool corta = false;
          for (int y = 0; y < h && !corta; y += 4) {
            int fe = y * se, fc = (y + dy) * sc + dx * 3;
            for (int x = 0; x < w; x += 4) {
              int ie = fe + x * 3, ic = fc + x * 3;
              suma += Math.Abs(be[ie] - bc[ic]) + Math.Abs(be[ie + 1] - bc[ic + 1]) + Math.Abs(be[ie + 2] - bc[ic + 2]);
              n++;
            }
            if (mejor[5] != int.MaxValue && suma > (long)mejor[5] * n / 100 + 1000000) corta = true;
          }
          if (corta) continue;
          int media = (int)(suma * 100 / n);
          if (media < mejor[5]) { mejor[0] = dx; mejor[1] = dy; mejor[4] = f + 1; mejor[5] = media; }
        }
    }
    return mejor;
  }

  public static string Verificar(string origen, string destino, int cx, int cy) {
    List<Bitmap> a = Cuadros(origen), b = Cuadros(destino);
    StringBuilder s = new StringBuilder();
    s.AppendFormat("verificacion: {0} cuadros en el original, {1} en el recorte\n", a.Count, b.Count);
    for (int f = 0; f < Math.Min(a.Count, b.Count); f++) {
      int sa, sb; byte[] ba = Bytes(a[f], out sa), bb = Bytes(b[f], out sb);
      long dif = 0;
      int w = b[f].Width, h = b[f].Height;
      for (int y = 0; y < h; y++)
        for (int x = 0; x < w; x++) {
          int ia = (y + cy) * sa + (x + cx) * 3, ib = y * sb + x * 3;
          dif += Math.Abs(ba[ia] - bb[ib]) + Math.Abs(ba[ia + 1] - bb[ib + 1]) + Math.Abs(ba[ia + 2] - bb[ib + 2]);
        }
      s.AppendFormat("  cuadro {0}: {1}x{2}, diferencia total {3}\n", f + 1, w, h, dif);
    }
    return s.ToString();
  }
}
"@

$rutaOrigen = (Resolve-Path -LiteralPath $Origen).Path
if (-not [System.IO.Path]::IsPathRooted($Destino)) { $Destino = Join-Path (Get-Location).Path $Destino }
$carpetaDestino = Split-Path -Parent $Destino
if ($carpetaDestino -and -not (Test-Path $carpetaDestino)) { New-Item -ItemType Directory -Path $carpetaDestino | Out-Null }

if ($Encuadre) {
  $rutaEncuadre = (Resolve-Path -LiteralPath $Encuadre).Path
  $hallado = [RecorteGif]::Buscar($rutaOrigen, $rutaEncuadre)
  $X = $hallado[0]; $Y = $hallado[1]; $Ancho = $hallado[2]; $Alto = $hallado[3]
  Write-Output ('encuadre hallado en x {0}, y {1} ({2}x{3}), mejor contra el cuadro {4}, diferencia media {5:0.00} por canal' -f $X, $Y, $Ancho, $Alto, $hallado[4], ($hallado[5] / 300.0))
}
if ($X -lt 0 -or $Y -lt 0 -or $Ancho -le 0 -or $Alto -le 0) { throw 'Falta el recorte: -Encuadre o -X -Y -Ancho -Alto' }

Write-Output ([RecorteGif]::Recortar($rutaOrigen, $Destino, $X, $Y, $Ancho, $Alto))
Write-Output ([RecorteGif]::Verificar($rutaOrigen, $Destino, $X, $Y))
Write-Output ('{0}: {1} KB' -f (Split-Path -Leaf $Destino), [int]((Get-Item $Destino).Length / 1024))
