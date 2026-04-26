$files = Get-ChildItem -Path src\app -Filter page.js -Recurse
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    if ($content -notmatch 'export const runtime = "edge";' -and $content -notmatch "export const runtime = 'edge';") {
        $newContent = "export const runtime = 'edge';" + "`r`n" + $content
        [System.IO.File]::WriteAllText($file.FullName, $newContent)
        Write-Host "Updated: $($file.FullName)"
    }
}
