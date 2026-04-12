$f = "d:\UserData\Sven\Repos\Prive\mindful-check-in\tests\branch-coverage.spec.js"
$content = [System.IO.File]::ReadAllText($f)

# App.xxx → MCI.xxx
$content = $content -replace 'App\.hasLightBackground', 'MCI.hasLightBackground'
$content = $content -replace 'App\.t\(', 'MCI.t('

# Settings selectors
$content = $content -replace '#settings-weather-location', '#cfg-location'
$content = $content -replace '#settings-reset', '#cfg-btn-reset'
$content = $content -replace '#settings-export', '#cfg-btn-export'
$content = $content -replace '#settings-import', '#cfg-inp-import'
$content = $content -replace '#clear-local-storage', '#demo-btn-clear'

# Language button
$content = $content -replace 'data-language=', 'data-lang-pick='

# Overview pagination
$content = $content -replace '#overview-last', '#ov-last'
$content = $content -replace '#overview-first', '#ov-first'
$content = $content -replace '#overview-page-info', '#ov-page-info'
$content = $content -replace '#overview-next', '#ov-next'

# Weather
$content = $content -replace "#weather-desc", '#weather-slot .weather-desc'
$content = $content -replace "#weather-widget", '#weather-slot'

# App.formatEntryTime → skip (doesn't exist in MCI)
# App.extractDateKey → inline
# App.getWeatherIcon → skip

[System.IO.File]::WriteAllText($f, $content)
Write-Host "Done: branch-coverage.spec.js"
