Add-Type -AssemblyName System.Drawing

function New-TestJpeg {
  param([string]$Path, [int]$Width, [int]$Height, [string]$Label, [int]$R, [int]$G, [int]$B)

  $bmp = New-Object System.Drawing.Bitmap($Width, $Height)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $bg = [System.Drawing.Color]::FromArgb($R, $G, $B)
  $g.FillRectangle((New-Object System.Drawing.SolidBrush($bg)), 0, 0, $Width, $Height)

  # fake "room" shapes so thumbnails are distinguishable
  $dark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb([Math]::Max(0,$R-70), [Math]::Max(0,$G-70), [Math]::Max(0,$B-70)))
  $g.FillRectangle($dark, [int]($Width*0.08), [int]($Height*0.55), [int]($Width*0.4), [int]($Height*0.32))
  $g.FillRectangle($dark, [int]($Width*0.55), [int]($Height*0.3), [int]($Width*0.3), [int]($Height*0.5))
  $light = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240,240,220))
  $g.FillRectangle($light, [int]($Width*0.6), [int]($Height*0.08), [int]($Width*0.25), [int]($Height*0.16))

  $font = New-Object System.Drawing.Font("Arial", [Math]::Max(12, [int]($Height*0.06)))
  $g.DrawString($Label, $font, [System.Drawing.Brushes]::White, 20, 20)
  $g.Dispose()

  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $bmp.Dispose()
  $size = (Get-Item $Path).Length
  "$Path  $Width x $Height  $([math]::Round($size/1KB,1)) KB"
}

$dir = Join-Path $PSScriptRoot "test-photos"
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }

New-TestJpeg -Path (Join-Path $dir "bedroom-large.jpg") -Width 3000 -Height 2000 -Label "PHOTO A - bedroom" -R 60 -G 90 -B 160
New-TestJpeg -Path (Join-Path $dir "kitchen.jpg") -Width 1600 -Height 1200 -Label "PHOTO B - kitchen" -R 170 -G 70 -B 60
New-TestJpeg -Path (Join-Path $dir "not-an-image.txt") -Width 10 -Height 10 -Label "x" -R 0 -G 0 -B 0 | Out-Null
Set-Content -Path (Join-Path $dir "notes.txt") -Value "this is not a photo" -Encoding ascii
"notes.txt created (should be rejected by validation)"
