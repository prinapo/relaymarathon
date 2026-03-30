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

echo [1/2] Compilazione web assets...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ERRORE: Build web fallito!
    pause
    exit /b 1
)

echo.
echo [2/2] Build APK Android release...
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
