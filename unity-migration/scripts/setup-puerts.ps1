[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$migrationRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$rootPrefix = $migrationRoot.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
function Assert-InMigrationRoot([string]$target) {
    $resolved = [IO.Path]::GetFullPath($target)
    if (-not $resolved.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Target is outside this isolated migration directory: $resolved"
    }
    return $resolved
}

$downloadRoot = Assert-InMigrationRoot (Join-Path $migrationRoot 'downloads')
$packagesRoot = Assert-InMigrationRoot (Join-Path $migrationRoot 'packages')
$evidenceFile = Assert-InMigrationRoot (Join-Path $migrationRoot 'evidence/puerts-install.json')
New-Item -ItemType Directory -Force -Path $downloadRoot, $packagesRoot, (Split-Path $evidenceFile -Parent) | Out-Null
$releaseApi = 'https://api.github.com/repos/Tencent/puerts/releases/tags/Unity_v3.0.3'
$headers = @{ Accept = 'application/vnd.github+json'; 'User-Agent' = 'Lumio-isolated-PuerTS-verification' }
$release = Invoke-RestMethod -Uri $releaseApi -Headers $headers -TimeoutSec 30
if ($release.draft -or $release.prerelease -or $release.tag_name -ne 'Unity_v3.0.3') { throw 'Unexpected release channel.' }
$commit = (Invoke-RestMethod -Uri 'https://api.github.com/repos/Tencent/puerts/commits/Unity_v3.0.3' -Headers $headers -TimeoutSec 30).sha
$assets = @(
    @{ name = 'PuerTS_Core_3.0.3.tar.gz'; folder = 'puerts-core'; package = 'com.tencent.puerts.core'; sha256 = 'feafc11bf2f9dbdb7e5fd2546124a771ea69b0f7c1a194740d47cfffb721cea0' },
    @{ name = 'PuerTS_V8_3.0.3.tar.gz'; folder = 'puerts-v8'; package = 'com.tencent.puerts.v8'; sha256 = '649b2de6dc74b24a17e1c624e5c6e98f381f05b1975b68b055ee8d5c47ea6e27' }
)
$report = [ordered]@{
    status = 'running'; started_at_utc = [DateTime]::UtcNow.ToString('o')
    release_api = $releaseApi; release_url = $release.html_url; tag = $release.tag_name
    published_at = $release.published_at; source_commit = $commit
    installed_scope = 'Isolated local UPM package folders only; no Unity project manifest, software installation, login, environment or system setting changes.'
    execution = 'Downloaded official archives and extracted data/source/native libraries. No package scripts or downloaded executables run.'
    packages = @()
}
if (Test-Path -LiteralPath $evidenceFile) {
    $previousAttempt = Get-Content -LiteralPath $evidenceFile -Raw | ConvertFrom-Json
    $report.previous_attempt = @{ status = $previousAttempt.status; error = $previousAttempt.error; finished_at_utc = $previousAttempt.finished_at_utc }
}
try {
    foreach ($assetSpec in $assets) {
        $matches = @($release.assets | Where-Object name -eq $assetSpec.name)
        if ($matches.Count -ne 1) { throw "Expected exactly one official asset: $($assetSpec.name)" }
        $asset = $matches[0]
        $expectedDigest = 'sha256:' + $assetSpec.sha256
        if ($asset.digest -ne $expectedDigest) { throw "GitHub API digest differs from pinned release digest: $($assetSpec.name)" }
        if (-not $asset.browser_download_url.StartsWith('https://github.com/Tencent/puerts/releases/download/Unity_v3.0.3/')) { throw 'Unexpected download origin.' }
        $archivePath = Assert-InMigrationRoot (Join-Path $downloadRoot $assetSpec.name)
        if (-not (Test-Path -LiteralPath $archivePath)) {
            Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $archivePath -TimeoutSec 300 -Headers @{ 'User-Agent' = 'Lumio-isolated-PuerTS-verification' }
        }
        $actualSize = (Get-Item -LiteralPath $archivePath).Length
        $actualHash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($actualSize -ne $asset.size -or $actualHash -ne $assetSpec.sha256) { throw "Archive size/SHA256 verification failed: $($assetSpec.name)" }
        $destination = Assert-InMigrationRoot (Join-Path $packagesRoot $assetSpec.folder)
        # Windows' bundled tar mis-encodes Chinese absolute path arguments on this host.
        # Keep all native-tool arguments ASCII and use the Unicode working directory.
        Push-Location -LiteralPath $downloadRoot
        try { $entries = @(& tar -tzf $assetSpec.name) } finally { Pop-Location }
        if ($LASTEXITCODE -ne 0 -or $entries.Count -eq 0) { throw 'Cannot inspect archive.' }
        foreach ($entry in $entries) {
            if ($entry -match '^[\\/]|^[A-Za-z]:|(^|[\\/])\.\.([\\/]|$)') { throw "Unsafe archive path: $entry" }
        }
        $topLevels = @($entries | ForEach-Object { ($_ -replace '^\./', '').Split('/')[0] } | Select-Object -Unique)
        if ($topLevels.Count -ne 1 -or $topLevels[0] -notin @('package', 'core', 'v8')) { throw "Unexpected archive root: $($topLevels -join ',')" }
        if (Test-Path -LiteralPath $destination) {
            if (@(Get-ChildItem -LiteralPath $destination -Force).Count -gt 0) {
                throw "Refusing to overwrite an existing nonempty package folder: $destination"
            }
        } else { New-Item -ItemType Directory -Path $destination | Out-Null }
        Push-Location -LiteralPath $downloadRoot
        try { & tar -xzf $assetSpec.name -C "../packages/$($assetSpec.folder)" --strip-components=1 } finally { Pop-Location }
        if ($LASTEXITCODE -ne 0) { throw "Package extraction failed: $destination" }
        $packageJson = Get-Content -LiteralPath (Join-Path $destination 'package.json') -Raw | ConvertFrom-Json
        if ($packageJson.name -ne $assetSpec.package -or $packageJson.version -ne '3.0.3') { throw 'Extracted package identity/version mismatch.' }
        $licenseFiles = @(Get-ChildItem -LiteralPath $destination -Recurse -File | Where-Object { $_.Name -match '(?i)license|notice|copying' } | ForEach-Object {
            [ordered]@{ path = $_.FullName.Substring($destination.Length + 1); bytes = $_.Length; sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant() }
        })
        $windowsNative = @(Get-ChildItem -LiteralPath $destination -Recurse -File -Filter '*.dll' | Where-Object { $_.FullName -match 'Plugins|Native' } | ForEach-Object {
            [ordered]@{ path = $_.FullName.Substring($destination.Length + 1); bytes = $_.Length; sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant() }
        })
        $report.packages += [ordered]@{
            name = $packageJson.name; version = $packageJson.version; manifest_dependencies = $packageJson.dependencies
            archive = $archivePath; source_url = $asset.browser_download_url; github_asset_id = $asset.id
            bytes = $actualSize; github_digest = $asset.digest; computed_sha256 = $actualHash; digest_verified = $true
            extracted_path = $destination; extracted_files = @(Get-ChildItem -LiteralPath $destination -Recurse -File).Count
            archive_entries = $entries.Count; license_files = $licenseFiles; native_dlls = $windowsNative
        }
        Write-Output "$($packageJson.name)@$($packageJson.version): SHA256 verified; extracted $destination"
    }
    $report.status = 'packages_extracted_verified'
} catch {
    $report.status = 'failed'; $report.error = $_.Exception.Message
    throw
} finally {
    $report.finished_at_utc = [DateTime]::UtcNow.ToString('o')
    $report | ConvertTo-Json -Depth 9 | Set-Content -LiteralPath $evidenceFile -Encoding utf8
}
