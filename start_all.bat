@echo off
echo Starting Illuma Health Management System...

:: Start the Backend in a new window
start cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

:: Start the Frontend in a new window
start cmd /k "cd hms-frontend && npm run dev"

echo.
echo Both servers are starting up!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Wait a few seconds for the servers to warm up, then open your browser.
pause
