$files = Get-ChildItem -Path src\app -Filter *.js -Recurse
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    if ($content -match "'use client'" -or $content -match '"use client"') {
        if ($content -match 'export const runtime = "edge";' -or $content -match "export const runtime = 'edge';") {
            $newContent = $content -replace "export const runtime = 'edge';\r?\n?", ""
            $newContent = $newContent -replace 'export const runtime = "edge";\r?\n?', ""
            [System.IO.File]::WriteAllText($file.FullName, $newContent)
            Write-Host "Cleaned Client Component: $($file.FullName)"
        }
    }
}
