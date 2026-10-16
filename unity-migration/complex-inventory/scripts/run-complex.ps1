param(
    [ValidateSet('prepare','generate','build','editor','editor-auto','player')][string]$Action='prepare',
    [string]$EvidenceName=''
)
$ErrorActionPreference='Stop'
$complexRoot=Split-Path -Path $PSScriptRoot -Parent
$migrationRoot=Split-Path -Path $complexRoot -Parent
$projectPath=Join-Path $migrationRoot 'InventoryUnity'
$stamp=[DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss')
if([string]::IsNullOrWhiteSpace($EvidenceName)){$EvidenceName=$Action}
if($EvidenceName -notmatch '^[a-zA-Z0-9_-]+$'){throw 'EvidenceName must be a simple directory name.'}
$evidencePath=Join-Path $complexRoot ('evidence\'+$EvidenceName)
New-Item -ItemType Directory -Path $evidencePath -Force | Out-Null
$logFile=Join-Path $evidencePath ($Action+'-'+$stamp+'.log')
if($Action -eq 'player'){
    $executable=Join-Path $migrationRoot 'build\complex-windows-il2cpp\ComplexInventory.exe'
    $arguments=@('-force-d3d11','-screen-fullscreen','0','-screen-width','1280','-screen-height','800','-verificationDir',('"'+$evidencePath+'"'),'-logFile',('"'+$logFile+'"'))
}else{
    $executable=Join-Path $env:LOCALAPPDATA 'Programs\Unity\6000.6.6f1\Editor\Unity.exe'
    $arguments=@('-projectPath',('"'+$projectPath+'"'),'-force-d3d11','-logFile',('"'+$logFile+'"'))
    if($Action -eq 'editor' -or $Action -eq 'editor-auto'){
        # Open the scene and let Search finish startup; Play is an explicit GUI action.
        $arguments+=@('-scenePath','Assets/ComplexInventoryValidation.unity','-verificationDir',('"'+$evidencePath+'"'))
        if($Action -eq 'editor-auto'){$arguments+=@('-executeMethod','ComplexEditorVerification.SchedulePlay')}
    }else{
        $method=@{prepare='ComplexMigrationBuild.Prepare';generate='ComplexMigrationBuild.GeneratePuerTS';build='ComplexMigrationBuild.BuildWindows'}[$Action]
        $arguments+=@('-batchmode','-quit','-executeMethod',$method)
    }
}
$record=[ordered]@{Action=$Action;Executable=$executable;Arguments=$arguments;EvidencePath=$evidencePath;LogFile=$logFile;StartedUtc=[DateTime]::UtcNow.ToString('o')}
if($Action -eq 'editor' -or $Action -eq 'editor-auto' -or $Action -eq 'player'){$process=Start-Process -FilePath $executable -ArgumentList $arguments -WindowStyle Normal -PassThru}
else{$process=Start-Process -FilePath $executable -ArgumentList $arguments -WindowStyle Hidden -PassThru}
$record.ProcessId=$process.Id
$record | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $evidencePath ('launch-'+$stamp+'.json')) -Encoding utf8
if($Action -ne 'editor' -and $Action -ne 'editor-auto' -and $Action -ne 'player'){$process.WaitForExit();$record.ExitCode=$process.ExitCode;$record.EndedUtc=[DateTime]::UtcNow.ToString('o');$record | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $evidencePath ('result-'+$stamp+'.json')) -Encoding utf8}
$record | ConvertTo-Json -Depth 5
if($record.Contains('ExitCode') -and $record.ExitCode -ne 0){throw ('Complex Unity '+$Action+' failed: '+$record.ExitCode+'; inspect '+$logFile)}
