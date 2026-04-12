$testDir = "d:\UserData\Sven\Repos\Prive\mindful-check-in\tests"
$files = Get-ChildItem -Path $testDir -Filter "*.spec.js"
$count = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content

    # Second wave: selectors missed by first script
    $content = $content -replace '#overview-body', '#ov-tbody'
    $content = $content -replace '#checkin-context-pill', '#ci-pill'
    $content = $content -replace "#weather-temp", '.weather-temp'
    
    # Delete button selectors
    $content = $content -replace '\.delete-entry-btn', '.ov-del'
    $content = $content -replace '#delete-entry-btn', '.ov-del'
    $content = $content -replace 'data-delete-key=', 'data-dk='
    
    # Quick actions
    $content = $content -replace '#quick-actions-list', '#qa-list'
    $content = $content -replace '#add-quick-action', '#qa-input'
    $content = $content -replace '#quick-action-input', '#qa-input'
    $content = $content -replace '\.quick-action-delete', '.qa-del'
    $content = $content -replace '\.quick-action-item', '.qa-item'
    
    # Summary
    $content = $content -replace '#summary-feeling', '#sum-feeling'
    $content = $content -replace '#summary-mood', '#sum-mood'
    $content = $content -replace '#summary-energy', '#sum-energy'
    $content = $content -replace '#summary-body', '#sum-body'
    $content = $content -replace '#summary-thoughts', '#sum-thoughts'
    $content = $content -replace '#summary-actions', '#sum-actions'
    $content = $content -replace '#summary-note', '#sum-note'
    
    # Export/Import
    $content = $content -replace '#export-all', '#io-btn-export'
    $content = $content -replace '#import-file', '#io-btn-import'
    $content = $content -replace '#export-json', '#io-btn-export-json'
    
    # Theme
    $content = $content -replace '\[data-theme="(.*?)"\]', '[data-theme-pick="$1"]'

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Updated: $($file.Name)"
        $count++
    } else {
        Write-Host "No changes: $($file.Name)"
    }
}

Write-Host "`nUpdated $count files."
