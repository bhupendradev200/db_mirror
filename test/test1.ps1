$ErrorActionPreference = "Stop"

$BaseUrl = if ($env:BASE_URL) { $env:BASE_URL } else { "http://localhost:3000" }

function Say([string]$msg) {
  Write-Host ""
  Write-Host ("=== {0} ===" -f $msg)
}

function GetJson([string]$path) {
  $url = "{0}{1}" -f $BaseUrl, $path
  Write-Host ("+ GET {0}" -f $url)
  (Invoke-RestMethod -Method Get -Uri $url)
}

function PostJson([string]$path, $bodyObj) {
  $url = "{0}{1}" -f $BaseUrl, $path
  $json = ($bodyObj | ConvertTo-Json -Compress)
  Write-Host ("+ POST {0}" -f $url)
  Write-Host ("  body: {0}" -f $json)
  (Invoke-RestMethod -Method Post -Uri $url -ContentType "application/json" -Body $json)
}

Say "1) Health check"
GetJson "/health" | ConvertTo-Json -Depth 10

Say "2) Write to master (insert)"
$name = "test-{0}" -f ([int][double]::Parse((Get-Date -UFormat %s)))
PostJson "/write" @{ name = $name } | ConvertTo-Json -Depth 10

Say "3) Read from each replica"
GetJson "/read/replica1" | ConvertTo-Json -Depth 10
GetJson "/read/replica2" | ConvertTo-Json -Depth 10
GetJson "/read/replica3" | ConvertTo-Json -Depth 10

Say "4) Load-balanced read (round-robin)"
GetJson "/read/load-balanced" | ConvertTo-Json -Depth 10
GetJson "/read/load-balanced" | ConvertTo-Json -Depth 10
GetJson "/read/load-balanced" | ConvertTo-Json -Depth 10

Say "5) Replication status"
GetJson "/replication-status" | ConvertTo-Json -Depth 10

Say "6) Induce lag on replica1 (pause SQL thread for 15s)"
Write-Host ("+ POST {0}/admin/induce-lag/replica1?seconds=15" -f $BaseUrl)
Invoke-RestMethod -Method Post -Uri ("{0}/admin/induce-lag/replica1?seconds=15" -f $BaseUrl) | ConvertTo-Json -Depth 10

Say "7) Write during induced lag"
$name2 = "during-lag-{0}" -f ([int][double]::Parse((Get-Date -UFormat %s)))
PostJson "/write" @{ name = $name2 } | ConvertTo-Json -Depth 10

Say "8) Immediately read from replica1 (may be stale)"
GetJson "/read/replica1" | ConvertTo-Json -Depth 10

Say "9) Check replication status again"
GetJson "/replication-status" | ConvertTo-Json -Depth 10

Say "DONE"
Write-Host "If any step fails, PowerShell will stop (ErrorActionPreference=Stop)."

