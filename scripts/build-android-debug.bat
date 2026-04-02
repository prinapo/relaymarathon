@echo off
REM ============================================
REM Script per compilare la versione DEBUG Android
REM Include debugging abilitato per test su device
REM ============================================

echo.
echo ========================================
echo Compilazione Android DEBUG
echo ========================================
echo.

cd /d "%~dp0.."

echo [1/1] Compilazione Quasar + Capacitor Android (Debug)...

REM Quasar build esegue internamente il build degli asset web
call npx quasar build -m capacitor -T android -debug

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Build DEBUG completato!
    echo Output: android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo Per installare su device:
    echo   adb install android\app\build\outputs\apk\debug\app-debug.apk
    echo ========================================
) else (
    echo.
    echo ERRORE: Build Android fallito!
    exit /b 1
)

pause
