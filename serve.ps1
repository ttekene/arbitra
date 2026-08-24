# ═══════════════════════════════════════════════════════════
#  Локальний перегляд сайту без Node.js та Python
#  Запуск:  powershell -ExecutionPolicy Bypass -File serve.ps1
#  Потім відкрийте:  http://127.0.0.1:8080/
#  Зупинка: Ctrl+C
# ═══════════════════════════════════════════════════════════
param(
  [int]$Port = 8080,
  [string]$Root = $PSScriptRoot
)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path $Root).Path

$mime = @{
  '.html'='text/html; charset=utf-8'; '.htm'='text/html; charset=utf-8'
  '.css'='text/css; charset=utf-8';   '.js'='application/javascript; charset=utf-8'
  '.json'='application/json; charset=utf-8'; '.svg'='image/svg+xml'
  '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.gif'='image/gif'
  '.webp'='image/webp'; '.ico'='image/x-icon'; '.woff'='font/woff'; '.woff2'='font/woff2'
  '.txt'='text/plain; charset=utf-8'; '.md'='text/markdown; charset=utf-8'
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()
Write-Host "  Сайт працює:  http://127.0.0.1:$Port/" -ForegroundColor Green
Write-Host "  Тека:         $Root"
Write-Host "  Зупинити:     Ctrl+C`n"

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    $client.NoDelay = $true
    $client.LingerState = [System.Net.Sockets.LingerOption]::new($true, 2)
    try {
      $stream = $client.GetStream()
      $stream.ReadTimeout = 5000

      # ── читаємо рядок запиту ──
      $sb = [System.Text.StringBuilder]::new()
      $buf = [byte[]]::new(1)
      while ($stream.Read($buf, 0, 1) -gt 0) {
        $ch = [char]$buf[0]
        if ($ch -eq "`n") { break }
        if ($ch -ne "`r") { [void]$sb.Append($ch) }
      }
      $requestLine = $sb.ToString()
      if (-not $requestLine) { $client.Close(); continue }

      $parts = $requestLine -split ' '
      $rawPath = if ($parts.Count -ge 2) { $parts[1] } else { '/' }
      $path = [System.Uri]::UnescapeDataString(($rawPath -split '\?')[0])
      if ($path -eq '/') { $path = '/index.html' }
      if ($path.EndsWith('/')) { $path += 'index.html' }

      # ── шлях до файлу (без виходу за межі теки) ──
      $rel = $path.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
      $full = [System.IO.Path]::GetFullPath((Join-Path $Root $rel))

      $status = '200 OK'; $body = $null; $type = 'text/plain; charset=utf-8'

      if (-not $full.StartsWith($Root, [StringComparison]::OrdinalIgnoreCase)) {
        $status = '403 Forbidden'; $body = [Text.Encoding]::UTF8.GetBytes('403')
      }
      elseif ((Test-Path $full -PathType Container) -and (Test-Path (Join-Path $full 'index.html'))) {
        $full = Join-Path $full 'index.html'
      }

      if ($null -eq $body) {
        if (Test-Path $full -PathType Leaf) {
          $body = [System.IO.File]::ReadAllBytes($full)
          $ext = [System.IO.Path]::GetExtension($full).ToLower()
          if ($mime.ContainsKey($ext)) { $type = $mime[$ext] } else { $type = 'application/octet-stream' }
        } else {
          $status = '404 Not Found'
          $type = 'text/html; charset=utf-8'
          $body = [Text.Encoding]::UTF8.GetBytes('<meta charset="utf-8"><h1>404</h1><p>Не знайдено: ' + $path + '</p>')
        }
      }

      $head = "HTTP/1.1 $status`r`nContent-Type: $type`r`nContent-Length: $($body.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
      $headBytes = [Text.Encoding]::ASCII.GetBytes($head)
      $stream.Write($headBytes, 0, $headBytes.Length)
      $stream.Write($body, 0, $body.Length)
      $stream.Flush()
      Write-Host ("  {0}  {1}" -f $status.Substring(0,3), $path)
    } catch {
      Write-Host "  ! $($_.Exception.Message)" -ForegroundColor DarkYellow
    } finally {
      try { $client.Client.Shutdown([System.Net.Sockets.SocketShutdown]::Send) } catch {}
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
