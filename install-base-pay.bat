@echo off
echo Installing Base Pay packages...
echo.

echo Step 1: Installing @base-org/account...
npm install @base-org/account

echo.
echo Step 2: Installing @base-org/account-ui...
npm install @base-org/account-ui

echo.
echo Step 3: Verifying installation...
npm list @base-org/account @base-org/account-ui

echo.
echo Base Pay packages installed successfully!
echo.
echo Next steps:
echo 1. Copy .env.example to .env.local
echo 2. Update recipient address in .env.local
echo 3. Set VITE_BASE_PAY_TESTNET=false for mainnet
echo.
pause
