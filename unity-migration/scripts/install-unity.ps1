$ErrorActionPreference = 'Stop'
$migrationRoot = Split-Path -Path $PSScriptRoot -Parent
$unityInstallPath = Join-Path $env:LOCALAPPDATA 'Programs\Unity\6000.6.6f1'
$editorExe = Join-Path $unityInstallPath 'Editor\Unity.exe'
$results = [System.Collections.Generic.List[object]]::new()
$installers = @(
    @{Name='Editor'; File='UnitySetup64-6000.6.6f1.exe'; Size=3856567088L; MD5='An8Rc46h/ahoQ8YOZ6/N6Q=='},
    @{Name='Windows IL2CPP'; File='UnitySetup-Windows-IL2CPP-Support-for-Editor-6000.6.6f1.exe'; Size=271231328L; MD5='vaCrNvqtzixppY2DVEMzgg=='}
)
foreach ($item in $installers) {
    $file = Join-Path $migrationRoot ('downloads\' + $item.File)
    if ((Get-Item -LiteralPath $file).Length -ne $item.Size) { throw ('Incomplete installer: ' + $item.Name) }
    $expectedHash = [Convert]::ToHexString([Convert]::FromBase64String($item.MD5))
    $actualHash = (Get-FileHash -LiteralPath $file -Algorithm MD5).Hash
    if ($actualHash -ne $expectedHash) { throw ('Official integrity mismatch: ' + $item.Name) }
    $signature = Get-AuthenticodeSignature -LiteralPath $file
    if ($signature.Status -ne 'Valid' -or $signature.SignerCertificate.Subject -notmatch 'Unity Technologies') { throw ('Invalid publisher signature: ' + $item.Name) }
    $record = [ordered]@{Name=$item.Name;Installer=$file;MD5=$actualHash;Signature=$signature.Status.ToString();Publisher=$signature.SignerCertificate.Subject;Destination=$unityInstallPath;StartedUtc=[DateTime]::UtcNow.ToString('o')}
    $skip = ($item.Name -eq 'Editor' -and (Test-Path -LiteralPath $editorExe)) -or ($item.Name -eq 'Windows IL2CPP' -and (Test-Path -LiteralPath (Join-Path $unityInstallPath 'Editor\Data\PlaybackEngines\windowsstandalonesupport\Variations\win64_player_nondevelopment_il2cpp')))
    if ($skip) { $record.SkippedExisting=$true; $record.ExitCode=$null }
    else {
        $installerProcess = Start-Process -FilePath $file -ArgumentList @('/S',('/D=' + $unityInstallPath)) -WindowStyle Hidden -Wait -PassThru
        $record.SkippedExisting=$false; $record.ExitCode=$installerProcess.ExitCode
        if ($installerProcess.ExitCode -ne 0) { $record.EndedUtc=[DateTime]::UtcNow.ToString('o'); $results.Add([pscustomobject]$record); $results | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $migrationRoot 'evidence\unity-install-result.json') -Encoding utf8; throw ('Installer failed: ' + $item.Name + ' exit ' + $installerProcess.ExitCode) }
    }
    $record.EndedUtc=[DateTime]::UtcNow.ToString('o'); $results.Add([pscustomobject]$record)
    $results | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $migrationRoot 'evidence\unity-install-result.json') -Encoding utf8
    Write-Output ($item.Name + ' installation finished')
}
if (!(Test-Path -LiteralPath $editorExe)) { throw 'Unity executable missing after installation' }
$installation = [pscustomobject]@{Unity='6000.6.6f1';EditorPath=$editorExe;FileVersion=(Get-Item -LiteralPath $editorExe).VersionInfo.FileVersion;HubPath=(Join-Path $env:LOCALAPPDATA 'Programs\UnityHub\Unity Hub.exe');EditorInstalled=$true;IL2CPPDirectories=@(Get-ChildItem -LiteralPath (Join-Path $unityInstallPath 'Editor\Data\PlaybackEngines\windowsstandalonesupport\Variations') -Directory | Where-Object {$_.Name -match 'il2cpp'} | Select-Object -ExpandProperty Name)}
$installation | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $migrationRoot 'evidence\installed-environment.json') -Encoding utf8
$installation | ConvertTo-Json -Depth 5
