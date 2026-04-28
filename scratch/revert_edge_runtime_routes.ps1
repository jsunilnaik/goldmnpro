$files = Get-ChildItem -Path src\app -Filter route.js -Recurse
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    if ($content -match 'import.*connectDB.*from.*@/lib/mongodb') {
        if ($content -match "export const runtime = 'edge';" -or $content -match 'export const runtime = "edge";') {
            $newContent = $content -replace "export const runtime = 'edge';\s*", ""
            $newContent = $newContent -replace 'export const runtime = "edge";\s*', ""
            [System.IO.File]::WriteAllText($file.FullName, $newContent)
            Write-Host "Reverted to Node.js runtime (removed edge): $($file.FullName)"
        }
    }
}
