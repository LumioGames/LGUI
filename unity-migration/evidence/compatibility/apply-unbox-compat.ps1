[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$migrationRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$relativeTarget = 'packages/puerts-core/Editor/Resources/puerts/xil2cpp/Puerts_il2cpp.cpp.txt'
$target = [IO.Path]::GetFullPath((Join-Path $migrationRoot $relativeTarget))
$expectedPrefix = $migrationRoot.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
if (-not $target.StartsWith($expectedPrefix, [StringComparison]::OrdinalIgnoreCase)) { throw 'Target escaped the isolated migration directory.' }
$originalSha = '318425f7f5eb857b5fc1f664e77b68ff569a99a62641c02ae4819261b0f03aaf'
$patchedSha = '3e3b479159fdd56c94ed08f4a7e756dbbfa36b9b4c714e99a40e5fc8f6ec9b83'
$currentSha = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLowerInvariant()
if ($currentSha -eq $patchedSha) { Write-Output 'The four-call compatibility patch is already applied.'; return }
if ($currentSha -ne $originalSha) { throw 'Unexpected template SHA256; refusing to patch a different upstream source.' }
$backup = Join-Path $PSScriptRoot 'Puerts_il2cpp.cpp.original.txt'
if (Test-Path -LiteralPath $backup) {
    if ((Get-FileHash -LiteralPath $backup -Algorithm SHA256).Hash.ToLowerInvariant() -ne $originalSha) { throw 'Existing original backup differs.' }
} else { Copy-Item -LiteralPath $target -Destination $backup }
$utf8 = [Text.UTF8Encoding]::new($false, $true)
$source = $utf8.GetString([IO.File]::ReadAllBytes($target))
$sites = [regex]::Matches($source, '(?:il2cpp::vm::)?Object::Unbox\(')
if ($sites.Count -ne 4) { throw "Expected exactly four original unbox call sites; found $($sites.Count)." }
$patched = $source.Replace('il2cpp::vm::Object::Unbox(', 'il2cpp_object_unbox(').Replace('Object::Unbox(', 'il2cpp_object_unbox(')
[IO.File]::WriteAllBytes($target, $utf8.GetBytes($patched))
$actual = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actual -ne $patchedSha) { throw 'Patched SHA256 mismatch.' }
[ordered]@{
    appliedAtUtc = [DateTime]::UtcNow.ToString('o')
    unity = '6000.6.6f1 (d20c9ac777da)'
    puerts = 'Unity_v3.0.3 / d8871238a3774fd10600995a5325e4b2ab4e39fb'
    target = $relativeTarget
    originalBackup = 'Puerts_il2cpp.cpp.original.txt'
    originalSha256 = $originalSha
    patchedSha256 = $actual
    changedLines = @(102, 757, 1063, 1078)
    replacement = 'Object::Unbox(...) -> il2cpp_object_unbox(...) (including the fully qualified first call)'
    redBuild = '../il2cpp-build-first/build-20261016-085952.log'
    scope = 'Exactly four function-call replacements; no host, scene, TS, UI, package metadata, Unity installation or cache changes.'
} | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'unbox-patch.json') -Encoding utf8
Write-Output 'Patched exactly four calls; original and resulting SHA256 verified.'
