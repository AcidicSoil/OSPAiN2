param(
    [Parameter(Mandatory=$false)]
    [string]$Command,
    
    [Parameter(Mandatory=$false)]
    [string]$PlanName
)

$BaseDir = "./docs/planning"

function List-Plans {
    Write-Host "Available Implementation Plans:" -ForegroundColor Blue
    $plans = Get-ChildItem "$BaseDir/*.md" | ForEach-Object { $_.BaseName }
    $i = 1
    foreach ($plan in $plans) {
        Write-Host "$i. $plan"
        $i++
    }
}

function View-Plan {
    param([string]$Name)
    
    $planFile = "$BaseDir/$Name.md"
    if (Test-Path $planFile) {
        Get-Content $planFile | Out-Host
    } else {
        Write-Host "Plan '$Name' not found" -ForegroundColor Red
    }
}

function List-Todo {
    Write-Host "Active Tasks:" -ForegroundColor Yellow
    $files = Get-ChildItem "$BaseDir/*.md"
    foreach ($file in $files) {
        $content = Get-Content $file
        $inProgressTasks = @()
        for ($i = 0; $i -lt $content.Length; $i++) {
            if ($content[$i] -match "🟡 In Progress") {
                $title = ($content[$i] -replace ".*- ", "")
                $inProgressTasks += "$title (from $($file.BaseName))"
            }
        }
        
        foreach ($task in $inProgressTasks) {
            Write-Host "- $task"
        }
    }
}

function Update-Plan {
    param([string]$Name)
    
    $planFile = "$BaseDir/$Name.md"
    if (Test-Path $planFile) {
        # Open in default editor
        notepad $planFile
    } else {
        Write-Host "Plan '$Name' not found" -ForegroundColor Red
    }
}

# Main command processing
if (-not $Command) {
    Write-Host "Usage: .\plan.ps1 -Command <command> [-PlanName <name>]"
    Write-Host "Commands:"
    Write-Host "  list     - List available plans"
    Write-Host "  view     - View a specific plan"
    Write-Host "  todo     - Show all active tasks"
    Write-Host "  update   - Update a plan"
    exit
}

switch ($Command) {
    "list" { List-Plans }
    "view" { 
        if (-not $PlanName) {
            Write-Host "Please specify a plan name" -ForegroundColor Red
            exit
        }
        View-Plan -Name $PlanName 
    }
    "todo" { List-Todo }
    "update" { 
        if (-not $PlanName) {
            Write-Host "Please specify a plan name" -ForegroundColor Red
            exit
        }
        Update-Plan -Name $PlanName 
    }
    default { 
        Write-Host "Unknown command: $Command" -ForegroundColor Red 
    }
} 