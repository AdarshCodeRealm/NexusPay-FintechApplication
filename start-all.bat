@echo off
echo ========================================
echo        NEXASPAY DEVELOPMENT SETUP
echo ========================================
echo.
echo Starting all applications...
echo.

REM Set color for better visibility
color 0A

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Start Server (Backend) on port 8000
echo [1/3] Starting Server (Backend) on port 8000...
cd /d "c:\Users\adars\OneDrive\Desktop\MY PROJECTS\NEXASPAY - FINTECH\Server"
start "NEXASPAY-SERVER" cmd /k "echo Starting NexasPay Server... && npm run dev"
echo Server started in new window
timeout /t 3 /nobreak >nul

REM Start Client (Frontend) on port 5173
echo [2/3] Starting Client (Frontend) on port 5173...
cd /d "c:\Users\adars\OneDrive\Desktop\MY PROJECTS\NEXASPAY - FINTECH\Client"
start "NEXASPAY-CLIENT" cmd /k "echo Starting NexasPay Client... && npm run dev"
echo Client started in new window
timeout /t 3 /nobreak >nul

REM Start Landing Page on port 5174
echo [3/3] Starting Landing Page on port 5174...
cd /d "c:\Users\adars\OneDrive\Desktop\MY PROJECTS\NEXASPAY - FINTECH\LandingPage"
start "NEXASPAY-LANDING" cmd /k "echo Starting NexasPay Landing Page... && npm run dev -- --port 5174"
echo Landing Page started in new window
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo        ALL APPLICATIONS STARTED!
echo ========================================
echo.
echo Applications are running on:
echo   Server (Backend):    http://localhost:8000
echo   Client (Frontend):   http://localhost:5173
echo   Landing Page:        http://localhost:5174
echo.
echo Each application is running in a separate command window.
echo Close those windows to stop the applications.
echo.
echo Press any key to exit this window...
pause >nul