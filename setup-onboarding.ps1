# Onboarding Setup Script for Windows PowerShell

Write-Host "🚀 Setting up Onboarding Flow..." -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path ".\packages\db\prisma\schema.prisma")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Step 1: Generating Prisma Client..." -ForegroundColor Cyan
Set-Location ".\packages\db"
pnpm prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    Set-Location "..\..\"
    exit 1
}

Write-Host "✅ Prisma client generated successfully" -ForegroundColor Green
Write-Host ""

Write-Host "🗄️  Step 2: Creating database migration..." -ForegroundColor Cyan
pnpm prisma migrate dev --name add_onboarding_and_social_fields

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create migration" -ForegroundColor Red
    Set-Location "..\..\"
    exit 1
}

Write-Host "✅ Migration created and applied successfully" -ForegroundColor Green
Write-Host ""

Set-Location "..\..\"

Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start the auth service: cd apps\auth && pnpm dev" -ForegroundColor White
Write-Host "2. Start the frontend: cd apps\frontend && pnpm dev" -ForegroundColor White
Write-Host "3. Visit http://localhost:3000/login to test the onboarding flow" -ForegroundColor White
Write-Host ""
Write-Host "📖 For more details, see ONBOARDING_SETUP.md" -ForegroundColor Cyan
