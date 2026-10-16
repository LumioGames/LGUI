param(
    [ValidateSet('prepare','generate','build','editor','player')][string]$Action = 'prepare',
    [int]$Count = 30,
    [string]$EvidenceName = '',
    # Let the Editor finish first-use Search.index initialization before playing.
    [switch]$ManualPlay = $true
)
$ErrorActionPreference='Stop'
$migrationRoot=Split-Path -Path $PSScriptRoot -Parent
$projectPath=Join-Path $migrationRoot 'InventoryUnity'
$editorExe=Join-Path $env:LOCALAPPDATA 'Programs\Unity\6000.6.6f1\Editor\Unity.exe'
$stamp=[DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss')
if ([string]::IsNullOrWhiteSpace($EvidenceName)) { $EvidenceName=$Action + '-' + $Count }
if ($EvidenceName -notmatch '^[a-zA-Z0-9_-]+$') { throw 'EvidenceName must be a simple folder name' }
$evidencePath=Join-Path $migrationRoot ('evidence\' + $EvidenceName)
New-Item -ItemType Directory -Path $evidencePath -Force | Out-Null
$logFile=Join-Path $evidencePath ($Action + '-' + $stamp + '.log')
if ($Action -eq 'player') {
    $executable=Join-Path $migrationRoot 'build\windows-il2cpp\InventoryValidation.exe'
    $arguments=@('-force-d3d11','-screen-fullscreen','0','-screen-width','1100','-screen-height','800','-verificationDir',('"'+$evidencePath+'"'),'-inventoryCount',"$Count",'-logFile',('"'+$logFile+'"'))
} else {
    $executable=$editorExe
    $arguments=@('-projectPath',('"'+$projectPath+'"'),'-force-d3d11','-logFile',('"'+$logFile+'"'))
    if ($Action -eq 'editor') { if (!$ManualPlay) { $arguments+=@('-executeMethod','MigrationBuild.LaunchEditor') }; $arguments+=@('-verificationDir',('"'+$evidencePath+'"'),'-inventoryCount',"$Count") }
    else { $method=@{prepare='MigrationBuild.Prepare';generate='MigrationBuild.GeneratePuerTS';build='MigrationBuild.BuildWindows'}[$Action]; $arguments+=@('-batchmode','-quit','-executeMethod',$method) }
}
$record=[ordered]@{Action=$Action;Executable=$executable;Arguments=$arguments;EvidencePath=$evidencePath;LogFile=$logFile;StartedUtc=[DateTime]::UtcNow.ToString('o')}
if ($Action -eq 'editor' -or $Action -eq 'player') { $process=Start-Process -FilePath $executable -ArgumentList $arguments -WindowStyle Normal -PassThru }
else { $process=Start-Process -FilePath $executable -ArgumentList $arguments -WindowStyle Hidden -PassThru }
$record.ProcessId=$process.Id
$record | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $evidencePath ('launch-'+$stamp+'.json')) -Encoding utf8
if ($Action -ne 'editor' -and $Action -ne 'player') { $process.WaitForExit(); $record.ExitCode=$process.ExitCode; $record.EndedUtc=[DateTime]::UtcNow.ToString('o'); $record | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $evidencePath ('result-'+$stamp+'.json')) -Encoding utf8 }
$record | ConvertTo-Json -Depth 5
if ($record.Contains('ExitCode') -and $record.ExitCode -ne 0) { throw ('Unity ' + $Action + ' failed: ' + $record.ExitCode + '; inspect ' + $logFile) }
