# Pre-publish nudge — runs daily at 08:50 (scheduled task "BeanieStudio Pre-publish Nudge").
# Pops a Windows message with the exact post shipping at 09:00 so images can
# be attached in Studio's Queue tab before it goes live.
$ErrorActionPreference = 'SilentlyContinue'
$site = 'D:\roblox game 4 research\site'
$today = Get-Date -Format 'yyyy-MM-dd'
$title = $null
Get-ChildItem "$site\content\queue\*.json" | ForEach-Object {
  try { $j = Get-Content $_.FullName -Raw | ConvertFrom-Json } catch { return }
  if ($j.scheduledFor -eq $today) { $title = $j.title }
}
if ($title) {
  $msg = "In 10 minutes the autopilot publishes:`n`n$title`n`nOpen Content Studio > Queue to attach its images now."
} else {
  $msg = "The autopilot publishes at 09:00, but nothing is scheduled for today.`nOpen Content Studio to check the queue."
}
# 64 = information icon; 120 = auto-dismiss after 2 minutes
(New-Object -ComObject WScript.Shell).Popup($msg, 120, 'Beanie Studio - pre-publish nudge', 64) | Out-Null
