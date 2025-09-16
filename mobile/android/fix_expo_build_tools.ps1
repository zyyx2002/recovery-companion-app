# Fix expo modules Build Tools version
$nodeModulesPath = "..\node_modules"

$expoModules = @(
    "expo",
    "expo-application", 
    "expo-asset",
    "expo-constants",
    "expo-crypto",
    "expo-dev-client",
    "expo-dev-launcher",
    "expo-dev-menu",
    "expo-dev-menu-interface",
    "expo-file-system",
    "expo-font",
    "expo-json-utils",
    "expo-keep-awake",
    "expo-manifests",
    "expo-modules-core",
    "expo-notifications",
    "expo-secure-store",
    "expo-splash-screen",
    "expo-system-ui",
    "expo-updates-interface",
    "expo-web-browser"
)

foreach ($module in $expoModules) {
    $buildGradlePath = Join-Path $nodeModulesPath "$module\android\build.gradle"
    
    if (Test-Path $buildGradlePath) {
        Write-Host "Processing $module..."
        
        $content = Get-Content $buildGradlePath -Raw
        
        if ($content -match 'buildToolsVersion\s+["\'][\d.]+["\']') {
            $content = $content -replace 'buildToolsVersion\s+["\'][\d.]+["\']', 'buildToolsVersion "34.0.0"'
            Write-Host "  Updated existing buildToolsVersion"
        } else {
            if ($content -match '(\s+compileSdkVersion\s+[^\r\n]+)') {
                $content = $content -replace '(\s+compileSdkVersion\s+[^\r\n]+)', "`$1`r`n    buildToolsVersion `"34.0.0`""
                Write-Host "  Added buildToolsVersion"
            } else {
                Write-Host "  Warning: Could not find compileSdkVersion"
            }
        }
        
        Set-Content $buildGradlePath $content -NoNewline
    } else {
        Write-Host "  Skipping $module (no build.gradle found)"
    }
}

Write-Host "All expo modules processed!"