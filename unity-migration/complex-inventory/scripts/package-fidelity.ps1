param([Parameter(Mandatory=$true)][string]$BuildReport)
$ErrorActionPreference='Stop'
$complexRoot=Split-Path -Path $PSScriptRoot -Parent
$migrationRoot=Split-Path -Path $complexRoot -Parent
$buildRoot=[IO.Path]::GetFullPath((Join-Path $migrationRoot 'build\fidelity-windows-il2cpp'))
$reportPath=[IO.Path]::GetFullPath($BuildReport)
if(!$reportPath.StartsWith(([IO.Path]::GetFullPath((Join-Path $complexRoot 'fidelity\evidence'))+'\'),[StringComparison]::OrdinalIgnoreCase)){throw 'The build report must be in the fidelity evidence directory.'}
$build=Get-Content -LiteralPath $reportPath -Raw | ConvertFrom-Json
if($build.result -ne 'Succeeded' -or $build.scriptingBackend -ne 'IL2CPP' -or $build.errors -ne 0){throw 'Only a successful Windows IL2CPP build can be distributed.'}
foreach($required in @('FidelityInventory.exe','UnityPlayer.dll','GameAssembly.dll','FidelityInventory_Data')){if(!(Test-Path -LiteralPath (Join-Path $buildRoot $required))){throw ('Missing runtime output: '+$required)}}
$stamp=[DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss')
$distributionRoot=[IO.Path]::GetFullPath((Join-Path $migrationRoot 'distribution'))
$name='TravelerInventory-Windows-x64-'+$stamp
$stage=[IO.Path]::GetFullPath((Join-Path $distributionRoot $name))
$zip=[IO.Path]::GetFullPath((Join-Path $distributionRoot ($name+'.zip')))
if((Split-Path $stage -Parent) -ne $distributionRoot -or (Split-Path $zip -Parent) -ne $distributionRoot){throw 'Distribution target escaped the validation directory.'}
if((Test-Path -LiteralPath $stage) -or (Test-Path -LiteralPath $zip)){throw 'A distribution with this timestamp already exists; never overwrite an earlier package.'}
New-Item -ItemType Directory -Path $stage -Force | Out-Null
# Keep the build and its debugging backup intact. Only copy distributable outputs.
foreach($entry in Get-ChildItem -LiteralPath $buildRoot){
    if($entry.Name -like '*BackUpThisFolder_ButDontShipItWithYourGame*'){continue}
    Copy-Item -LiteralPath $entry.FullName -Destination (Join-Path $stage $entry.Name) -Recurse
}
$instructions=@'
# 旅者背包 · Windows 试玩

解压整个文件夹后，双击 FidelityInventory.exe。
请保持 exe、DLL 和 FidelityInventory_Data 文件夹在一起。

- 点击道具查看详情。
- 装备可装备、卸下；药水可使用；出售会先弹出确认。
- 顶部可搜索、切换分类；右下角可排序。
- 右下角菜单提供保存、恢复和旅途奖励。
- 可拖动窗口边缘，查看不同窗口形状下的布局。
- 窗口标题栏的关闭按钮退出程序；游戏内的叉号关闭背包。

默认窗口为 1280×800。存档保存在当前 Windows 用户的 Unity 本地数据目录中。
这是 Unity 6000.6.6f1、PuerTS 3.0.3、FairyGUI 原生渲染的 Windows x64 IL2CPP 验证版本。
游戏规则与网页复用同一份 TS 业务；没有使用 WebView 或网页容器。
本次美术为验证过程中生成的素材。
'@
[IO.File]::WriteAllText((Join-Path $stage '使用说明.md'),$instructions,(New-Object Text.UTF8Encoding($false)))
$files=@(Get-ChildItem -LiteralPath $stage -File -Recurse | ForEach-Object {[ordered]@{path=$_.FullName.Substring($stage.Length+1).Replace('\','/');bytes=$_.Length;sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()}})
$setup=Get-Content -LiteralPath (Join-Path $complexRoot 'fidelity\evidence\setup-unity.json') -Raw | ConvertFrom-Json
$manifest=[ordered]@{createdAt=[DateTime]::UtcNow.ToString('o');name=$name;platform='Windows x64';engine=$build.unity;backend=$build.scriptingBackend;developmentBuild=$build.developmentBuild;buildReport=$reportPath;sharedBundleSha256=$setup.sharedBundleSha256;sharedLayoutSha256=$setup.sharedLayoutSha256;fileManifestExcludesItself=$true;files=$files}
$manifest | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $stage 'package-manifest.json') -Encoding utf8
Compress-Archive -LiteralPath $stage -DestinationPath $zip -CompressionLevel Fastest
$result=[ordered]@{status='packaged';createdAt=[DateTime]::UtcNow.ToString('o');directory=$stage;executable=(Join-Path $stage 'FidelityInventory.exe');zip=$zip;zipBytes=(Get-Item -LiteralPath $zip).Length;zipSha256=(Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLowerInvariant();fileCount=$files.Count;sourceBuild=$buildRoot;debugBackupIncluded=$false;notes='The exact package still requires an ordinary uninstrumented startup check before final delivery.'}
$result | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $complexRoot ('fidelity\evidence\distribution-'+$stamp+'.json')) -Encoding utf8
$result | ConvertTo-Json -Depth 6
