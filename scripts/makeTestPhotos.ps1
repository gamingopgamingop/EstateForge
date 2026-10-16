Add-Type -AssemblyName System.Drawing

function New-TestJpeg {
  param([string]$Path, [int]$Width, [int]$Height, [string]$Label, [int]$Red, [int]$Green, [int]$Blue)

  $bmp = New-Object System.Drawing.Bitmap($Width, $Height)
  $gfx = [System.Drawing.Graphics]::FromImage($bmp)
  $gfx.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($Red, $Green, $Blue))), 0, 0, $Width, $Height)

  # Random detail so the JPEG is realistically sized (flat colors compress to nothing)
  $rand = New-Object System.Random(42)
  for ($i = 0; $i -lt 400; $i++) {
    $c = [System.Drawing.Color]::FromArgb($rand.Next(30, 230), $rand.Next(30, 230), $rand.Next(30, 230))
    $brush = New-Object System.Drawing.SolidBrush($c)
    $gfx.FillRectangle($brush, $rand.Next(0, $Width), $rand.Next(0, $Height), $rand.Next(4, [int]($Width * 0.12)), $rand.Next(4, [int]($Height * 0.12)))
    $brush.Dispose()
  }

  # "furniture" blocks + window to make the two photos visually distinct
  $dark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb([Math]::Max(0, $Red - 70), [Math]::Max(0, $Green - 70), [Math]::Max(0, $Blue - 70)))
  $gfx.FillRectangle($dark, [int]($Width * 0.08), [int]($Height * 0.55), [int]($Width * 0.4), [int]($Height * 0.32))
  $gfx.FillRectangle($dark, [int]($Width * 0.55), [int]($Height * 0.3), [int]($Width * 0.3), [int]($Height * 0.5))
  $light = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 245, 225))
  $gfx.FillRectangle($light, [int]($Width * 0.6), [int]($Height * 0.06), [int]($Width * 0.28), [int]($Height * 0.18))
  $dark.Dispose(); $light.Dispose()

  $font = New-Object System.Drawing.Font("Arial", [Math]::Max(14, [int]($Height * 0.07)))
  $gfx.DrawString($Label, $font, [System.Drawing.Brushes]::White, 20, 20)
  $font.Dispose(); $gfx.Dispose()

  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $bmp.Dispose()
  "$Path  $Width x $Height  $([math]::Round((Get-Item $Path).Length / 1KB, 1)) KB"
}

$dir = Join-Path $PSScriptRoot "test-photos"
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }

New-TestJpeg -Path (Join-Path $dir "bedroom-large.jpg") -Width 3000 -Height 2000 -Label "PHOTO A bedroom" -Red 60 -Green 90 -Blue 160
New-TestJpeg -Path (Join-Path $dir "kitchen.jpg") -Width 1600 -Height 1200 -Label "PHOTO B kitchen" -Red 170 -Green 70 -Blue 60
Set-Content -Path (Join-Path $dir "notes.txt") -Value "this is not a photo" -Encoding ascii
"notes.txt created (must be rejected by validation)"
