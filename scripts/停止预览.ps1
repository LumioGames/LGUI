$previewListeners = @(Get-NetTCPConnection -LocalPort 4179 -State Listen -ErrorAction SilentlyContinue)
foreach ($listener in $previewListeners) {
    $previewProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)"
    if ($null -eq $previewProcess) { continue }
    if ($previewProcess.Name -ne 'node.exe' -or $previewProcess.CommandLine -notmatch 'scripts[\\/]serve\.mjs') {
        throw "端口 4179 的进程与本次预览不匹配，未停止：$($listener.OwningProcess)"
    }
    Stop-Process -Id $listener.OwningProcess
    Write-Output "已停止本地验证预览：$($listener.OwningProcess)"
}
