@echo off
REM ============================================
REM Script per compilare la versione RELEASE Android
REM ============================================

echo.
echo ========================================
echo Compilazione Android RELEASE
echo ========================================
echo.

cd /d "%~dp0.."

echo.
echo [1/1] Build Quasar + Capacitor Android (Release)...
call npx quasar build -m capacitor -T android

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Build RELEASE completato!
    echo Output: android\app\build\outputs\
    echo.
    echo Nota: Per distribuzione store serve signing
    echo ========================================
) else (
    echo.
    echo ERRORE: Build Android fallito!
    exit /b 1
)

pause
