$phaseRoot = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$editorRoot = (Resolve-Path -LiteralPath (Join-Path $phaseRoot '../repos/editor-online')).Path
$connectionPath = Join-Path $phaseRoot 'agent-connection.local.json'
if (Test-Path -LiteralPath $connectionPath) {
    $connection = Get-Content -LiteralPath $connectionPath -Raw | ConvertFrom-Json
    $editorProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $($connection.pid)"
    if ($editorProcess) {
        if ($editorProcess.Name -ne 'node.exe' -or $editorProcess.CommandLine -notmatch 'vite.*--port 5199' -or $editorProcess.CommandLine -notmatch [regex]::Escape($editorRoot)) { throw '5199进程与本轮编辑器不匹配，未停止。' }
        Stop-Process -Id $editorProcess.ProcessId
        Write-Output '已停止本轮网页编辑器与Agent桥。'
    }
}
$listeners = @(Get-NetTCPConnection -LocalPort 4181 -State Listen -ErrorAction SilentlyContinue)
foreach ($listener in $listeners) {
    $gameProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)"
    if ($gameProcess.Name -ne 'node.exe' -or $gameProcess.CommandLine -notmatch '闭环验证[\\/]serve-roundtrip\.mjs') { throw '4181进程与本轮游戏预览不匹配，未停止。' }
    Stop-Process -Id $gameProcess.ProcessId
    Write-Output '已停止本轮DOM游戏预览。'
}
