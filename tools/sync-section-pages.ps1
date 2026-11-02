$ErrorActionPreference = "Stop"

$siteRoot = Split-Path -Parent $PSScriptRoot
$source = Join-Path $siteRoot "index.html"
$routes = @(
  "about",
  "websites",
  "analytics",
  "experience",
  "skills",
  "education",
  "documents",
  "process",
  "contact"
)

foreach ($route in $routes) {
  $routeDirectory = Join-Path $siteRoot $route
  if (-not (Test-Path -LiteralPath $routeDirectory -PathType Container)) {
    throw "Section route directory does not exist: $routeDirectory"
  }

  Copy-Item -LiteralPath $source -Destination (Join-Path $routeDirectory "index.html") -Force
}

Write-Output "Synchronized $($routes.Count) section pages from index.html."
