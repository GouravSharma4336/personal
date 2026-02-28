@echo off
cd /d "%~dp0"
where python
python --version
python main.py
echo.
echo Script finished.
pause