param(
    [ValidateSet('prepare','generate','build','editor','editor-auto','player')][string]$Action='prepare',
    [string]$EvidenceName='',
    [ValidateRange(320,7680)][int]$Width=1280,
    [ValidateRange(320,4320)][int]$Height=800
)
$ErrorActionPreference='Stop'
$complexRoot=Split-Path -Path $PSScriptRoot -Parent
$migrationRoot=Split-Path -Path $complexRoot -Parent
$projectPath=Join-Path $migrationRoot 'InventoryUnity'
$fidelityRoot=Join-Path $complexRoot 'fidelity'
$editorExe=Join-Path $env:LOCALAPPDATA 'Programs\Unity\6000.6.6f1\Editor\Unity.exe'
$stamp=[DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss')
if([string]::IsNullOrWhiteSpace($EvidenceName)){$EvidenceName=$Action+'-'+$stamp}
if($EvidenceName -notmatch '^[a-zA-Z0-9_-]+$'){throw 'EvidenceName must be a simple directory name.'}
$evidencePath=Join-Path $fidelityRoot ('evidence\unity-'+$EvidenceName)
New-Item -ItemType Directory -Path $evidencePath -Force | Out-Null
$logFile=Join-Path $evidencePath ($Action+'-'+$stamp+'.log')
$buildRoot=Join-Path $migrationRoot 'build\fidelity-windows-il2cpp'
$active=Get-CimInstance Win32_Process | Where-Object {$_.ExecutablePath -and [string]::Equals($_.ExecutablePath,$editorExe,[StringComparison]::OrdinalIgnoreCase)}
if($Action -ne 'player' -and $active){throw ('The validation project already has an Editor process; close it through the verification protocol first. PID '+(($active.ProcessId)-join ','))}
if($Action -eq 'build'){
    $activePlayer=Get-CimInstance Win32_Process | Where-Object {$_.ExecutablePath -and $_.ExecutablePath.StartsWith($buildRoot+'\',[StringComparison]::OrdinalIgnoreCase)}
    if($activePlayer){throw ('Fidelity Player is using the build output. Quit it through the verification protocol before rebuilding. PID '+(($activePlayer.ProcessId)-join ','))}
}
if($Action -eq 'player'){
    $executable=Join-Path $buildRoot 'FidelityInventory.exe'
    $arguments=@('-force-d3d11','-screen-fullscreen','0','-screen-width',[string]$Width,'-screen-height',[string]$Height,'-verificationDir',('"'+$evidencePath+'"'),'-logFile',('"'+$logFile+'"'))
}else{
    $executable=$editorExe
    $arguments=@('-projectPath',('"'+$projectPath+'"'),'-force-d3d11','-logFile',('"'+$logFile+'"'),'-verificationDir',('"'+$evidencePath+'"'))
    if($Action -eq 'editor' -or $Action -eq 'editor-auto'){
        $arguments+=@('-scenePath','Assets/FidelityInventoryValidation.unity')
        if($Action -eq 'editor-auto'){$arguments+=@('-executeMethod','FidelityEditorVerification.SchedulePlay')}
    }else{
        $method=@{prepare='FidelityMigrationBuild.Prepare';generate='FidelityMigrationBuild.GeneratePuerTS';build='FidelityMigrationBuild.BuildWindows'}[$Action]
        $arguments+=@('-batchmode','-quit','-executeMethod',$method)
    }
}
if(!(Test-Path -LiteralPath $executable -PathType Leaf)){throw ('Missing executable: '+$executable)}
$record=[ordered]@{Action=$Action;Executable=$executable;Arguments=$arguments;EvidencePath=$evidencePath;LogFile=$logFile;StartedUtc=[DateTime]::UtcNow.ToString('o');Purpose='Isolated native FairyGUI/PuerTS verification; explicit file instrumentation, no OS input'}
if($Action -eq 'editor' -or $Action -eq 'editor-auto' -or $Action -eq 'player'){$process=Start-Process -FilePath $executable -ArgumentList $arguments -WindowStyle Normal -PassThru}
else{$process=Start-Process -FilePath $executable -ArgumentList $arguments -WindowStyle Hidden -PassThru}
$record.ProcessId=$process.Id
$record | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $evidencePath ('launch-'+$stamp+'.json')) -Encoding utf8
if($Action -ne 'editor' -and $Action -ne 'editor-auto' -and $Action -ne 'player'){
    $process.WaitForExit();$record.ExitCode=$process.ExitCode;$record.EndedUtc=[DateTime]::UtcNow.ToString('o')
    $record | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $evidencePath ('result-'+$stamp+'.json')) -Encoding utf8
}
$record | ConvertTo-Json -Depth 5
if($record.Contains('ExitCode') -and $record.ExitCode -ne 0){throw ('Fidelity Unity '+$Action+' failed: '+$record.ExitCode+'; inspect '+$logFile)}
