@echo off
echo Starting Bash Terminal Simulator...
echo.

echo Installing dependencies...
call npm run install-all

echo.
echo Starting the application...
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:3000
echo.
echo Default admin credentials: admin / admin123
echo.

call npm run dev

pause
