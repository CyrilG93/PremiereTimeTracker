@echo off
REM ============================================================================
REM Time Tracker - Installation Script for Windows
REM ============================================================================
REM This script installs the Time Tracker extension for Adobe Premiere Pro
REM ============================================================================

echo.
echo ========================================
echo Time Tracker - Installation Windows
echo ========================================
echo.

REM Extension details
set EXTENSION_NAME=PremiereTimeTracker
set SOURCE_DIR=%~dp0
set TARGET_DIR=%APPDATA%\Adobe\CEP\extensions\%EXTENSION_NAME%

echo Source: %SOURCE_DIR%
echo Target: %TARGET_DIR%
echo.

REM Create extensions directory if it doesn't exist
if not exist "%APPDATA%\Adobe\CEP\extensions" (
    echo Creating CEP extensions directory...
    mkdir "%APPDATA%\Adobe\CEP\extensions"
)

REM Remove existing installation
if exist "%TARGET_DIR%" (
    echo Removing existing installation...
    rmdir /s /q "%TARGET_DIR%"
)

REM Copy extension files
echo Installing extension...
xcopy /E /I /Y "%SOURCE_DIR%" "%TARGET_DIR%"

REM Remove installation scripts from installed directory
del /q "%TARGET_DIR%\install_mac.sh" 2>nul
del /q "%TARGET_DIR%\install_windows.bat" 2>nul

REM Enable debug mode for CEP extensions
echo Enabling debug mode...
reg add HKEY_CURRENT_USER\Software\Adobe\CSXS.11 /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1

echo.
echo ========================================
echo Installation complete!
echo ========================================
echo.
echo Next steps:
echo   1. Restart Adobe Premiere Pro
echo   2. Go to Window ^> Extensions ^> Time Tracker
echo.
echo To uninstall:
echo   rmdir /s /q "%TARGET_DIR%"
echo.
pause
