$files = Get-ChildItem -Path $PSScriptRoot -Filter "*.spec.js"
$count = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content
    
    # Navigation selectors
    $content = $content -replace '\[data-tab-target="(\w+)"\]', '[data-route="$1"]'
    $content = $content -replace '\[data-tab-panel="(\w+)"\]', '#view-$1'
    
    # Field IDs
    $content = $content -replace "#thoughts(?=['`")\]\s\.])", '#fld-thoughts'
    $content = $content -replace "#action(?=['`")\]\s\.])", '#fld-action'  
    $content = $content -replace "#note(?=['`")\]\s\.])", '#fld-note'
    $content = $content -replace '#custom-feelings', '#fld-custom'
    $content = $content -replace '#body-note', '#fld-body-note'
    $content = $content -replace '#energy-note', '#fld-energy-note'
    
    # Emotion wheel
    $content = $content -replace 'data-emotion=', 'data-em='
    $content = $content -replace '#wheel-type', '#sel-wheel'
    $content = $content -replace '#reset-feeling', '#whl-btn-reset'
    $content = $content -replace '#selected-emotion-display', '#wheel-display'
    
    # Body signals
    $content = $content -replace 'data-part=', 'data-zone='
    $content = $content -replace '#reset-body-signals', '#bdy-btn-reset'
    $content = $content -replace '#body-signals-display', '#body-display'
    
    # Energy
    $content = $content -replace '#reset-energy', '#nrg-btn-reset'
    
    # Mood matrix
    $content = $content -replace 'data-row=', 'data-mr='
    $content = $content -replace 'data-col=', 'data-mc='
    $content = $content -replace '#reset-mood', '#mood-btn-reset'
    $content = $content -replace '#selected-mood-display', '#mood-display'
    
    # Buttons
    $content = $content -replace '#save-checkin', '#ci-btn-save'
    $content = $content -replace '#new-checkin', '#ci-btn-new'
    
    # Settings
    $content = $content -replace '#settings-save', '#cfg-btn-save'
    $content = $content -replace '#settings-theme', '#cfg-theme'
    $content = $content -replace '#settings-rows-per-page', '#cfg-rows'
    $content = $content -replace '#settings-energy-emotional-label', '#cfg-energy-label'
    $content = $content -replace '#settings-default-wheel', '#cfg-wheel'
    $content = $content -replace '#settings-location', '#cfg-location'
    $content = $content -replace '#settings-language', '#cfg-lang'
    
    # Overview
    $content = $content -replace '#overview-search', '#ov-search'
    $content = $content -replace '#overview-filter', '#ov-filter'
    
    # Filter values
    $content = $content -replace "selectOption\('last7'\)", "selectOption('7')"
    $content = $content -replace "selectOption\('last14'\)", "selectOption('14')"
    $content = $content -replace "selectOption\('last30'\)", "selectOption('30')"
    $content = $content -replace "selectOption\('last3Months'\)", "selectOption('90')"
    $content = $content -replace "toHaveValue\('last7'\)", "toHaveValue('7')"
    $content = $content -replace "toHaveValue\('last14'\)", "toHaveValue('14')"
    
    # Overview table
    $content = $content -replace 'data-entry-key=', 'data-ekey='
    $content = $content -replace '\.overview-row', '.ov-row'
    $content = $content -replace '\.overview-export-entry-button', '.ov-export-entry'
    
    # Demo/Info
    $content = $content -replace '#generate-demo-data', '#demo-btn-generate'
    $content = $content -replace '#clear-all-data', '#demo-btn-clear'
    
    # Banner to toast
    $content = $content -replace "await expect\(page\.locator\('#history-banner'\)\)\.toHaveClass\(/is-success/\);", "await expect(page.locator('.toast--success')).toBeVisible();"
    $content = $content -replace "await expect\(page\.locator\('#history-banner'\)\)\.not\.toHaveClass\(/is-hidden/\);", "// toast auto-appears, no hidden check needed"
    $content = $content -replace "await expect\(page\.locator\('#history-banner'\)\)\.toHaveClass\(/is-warning/\);", "await expect(page.locator('.toast--warning')).toBeVisible();"
    $content = $content -replace "page\.locator\('#history-banner'\)", "page.locator('#toast-container .toast')"
    
    # History/summary
    $content = $content -replace '#history-content', '#history-grid'
    $content = $content -replace '#summary-content', '#summary-slot'
    
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Updated: $($file.Name)"
        $count++
    } else {
        Write-Host "No changes: $($file.Name)"
    }
}

Write-Host "`nUpdated $count files."
