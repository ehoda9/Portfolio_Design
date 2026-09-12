#Requires -Version 5.1
<#
.SYNOPSIS
  Tests the admin login + create-post flow against the running API.

.EXAMPLE
  .\scripts\test-admin-flow.ps1 -StartDocker

.EXAMPLE
  .\scripts\test-admin-flow.ps1 -Email you@example.com -Password "your-password" -Slug "second-post"
#>

param(
    [string]$ApiBase = "http://localhost:3000",
    [string]$Email,
    [string]$Password,
    [switch]$StartDocker,
    [string]$Slug = "hello-world",
    [string]$Title = "Hello, World",
    [string]$Excerpt = "My first post",
    [string]$Content = "# Hi there`n`nThis is **Markdown**, rendered and sanitized on the frontend.",
    [string]$Status = "published"
)

$ErrorActionPreference = "Stop"

function Write-Step($msg) {
    Write-Host "`n$msg" -ForegroundColor Cyan
}

function Write-Ok($msg) {
    Write-Host $msg -ForegroundColor Green
}

function Write-Fail($msg) {
    Write-Host $msg -ForegroundColor Red
}

if ($StartDocker) {
    Write-Step "Starting docker compose..."
    docker compose up -d

    if ($LASTEXITCODE -ne 0) {
        Write-Fail "docker compose up failed."
        exit 1
    }

    Write-Step "Waiting for the API to become healthy..."
    $ready = $false

    for ($i = 0; $i -lt 30; $i++) {
        try {
            Invoke-RestMethod `
                -Uri "$ApiBase/api/health" `
                -Method Get `
                -TimeoutSec 2 | Out-Null

            $ready = $true
            break
        }
        catch {
            Start-Sleep -Seconds 2
        }
    }

    if (-not $ready) {
        Write-Fail "API did not become ready within 60 seconds."
        exit 1
    }

    Write-Ok "API is up."
}

if (-not $Email) {
    $Email = Read-Host "Admin email"
}

if (-not $Password) {
    $securePassword = Read-Host "Admin password" -AsSecureString

    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR(
        $securePassword
    )

    $Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)

    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

Write-Step "Logging in as $Email..."

$loginBody = @{
    email    = $Email
    password = $Password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod `
        -Uri "$ApiBase/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody
}
catch {
    Write-Fail "Login failed: $($_.Exception.Message)"

    if ($_.ErrorDetails.Message) {
        Write-Fail $_.ErrorDetails.Message
    }

    exit 1
}

$token = $loginResponse.token

if (-not $token) {
    Write-Fail "Login succeeded but no token was returned by the API."
    Write-Fail "Response received:"
    $loginResponse | Format-List
    exit 1
}

$previewLength = [Math]::Min(30, $token.Length)
$preview = $token.Substring(0, $previewLength)

Write-Ok "Got token: $preview..."

Write-Step "Creating post '$Slug'..."

$postBody = @{
    slug    = $Slug
    title   = $Title
    excerpt = $Excerpt
    content = $Content
    status  = $Status
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod `
        -Uri "$ApiBase/api/posts" `
        -Method Post `
        -ContentType "application/json" `
        -Headers @{
            Authorization = "Bearer $token"
        } `
        -Body $postBody

    Write-Ok "Post created:"

    $createResponse.post | Format-List
}
catch {
    Write-Fail "Create post failed: $($_.Exception.Message)"

    if ($_.ErrorDetails.Message) {
        Write-Fail $_.ErrorDetails.Message
    }

    Write-Host "(A 409 here just means this slug already exists - pass -Slug to use a different one.)" -ForegroundColor Yellow

    exit 1
}

Write-Step "Confirming it shows up in the public list..."

$listResponse = Invoke-RestMethod `
    -Uri "$ApiBase/api/posts" `
    -Method Get

$listResponse.posts |
    Format-Table slug, title, publishedAt -AutoSize

Write-Ok "`nDone. View it at: http://localhost:8080/blog-post.html?slug=$Slug"