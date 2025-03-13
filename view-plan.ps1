function View-Plan {
    if (Test-Path "./docs/planning/implementation-plan.md") {
        Get-Content "./docs/planning/implementation-plan.md" | Out-Host
    } else {
        Write-Host "Implementation plan not found. Run save-implementation-plan script first."
    }
}

# Add to your PowerShell profile for permanent access:
# Add-Content $PROFILE "function View-Plan { ... }" 