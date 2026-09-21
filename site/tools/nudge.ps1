# Pre-publish nudge — runs daily at 21:50 (scheduled task "BeanieStudio Pre-publish Nudge").
# Pops a Windows message with the exact post shipping at 22:00 so images can
# be attached in Studio's Queue tab before it goes live.
$ErrorActionPreference = 'SilentlyContinue'
$site = 'D:\roblox game 4 research\site'
$today = Get-Date -Format 'yyyy-MM-dd'
# Skip entirely if today's post already went out (e.g. a wake-up catch-up beat the clock)
$log = "$site\content\autopilot-log.jsonl"
if (Test-Path $log) {
  $hit = Get-Content $log | ForEach-Object { try { $_ | ConvertFrom-Json } catch { $null } } |
    Where-Object { $_.op -eq 'publish-ok' -and $_.date -eq $today } | Select-Object -First 1
  if ($hit) { exit }
}
$title = $null
Get-ChildItem "$site\content\queue\*.json" | ForEach-Object {
  try { $j = Get-Content $_.FullName -Raw | ConvertFrom-Json } catch { return }
  if ($j.scheduledFor -eq $today) { $title = $j.title }
}
if ($title) {
  $msg = "In 10 minutes the autopilot publishes:`n`n$title`n`nOpen Content Studio > Queue to attach its images now."
} else {
  $msg = "The autopilot publishes at 22:00, but nothing is scheduled for today.`nOpen Content Studio to check the queue."
}
# 64 = information icon; 120 = auto-dismiss after 2 minutes
(New-Object -ComObject WScript.Shell).Popup($msg, 120, 'Beanie Studio - pre-publish nudge', 64) | Out-Null
