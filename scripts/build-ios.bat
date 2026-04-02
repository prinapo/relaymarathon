@echo off
REM ============================================
REM Script per compilare la versione iOS
REM REQUISITO: macOS con Xcode installato
REM ============================================

echo.
echo ========================================
echo Compilazione iOS
echo ========================================
echo.

cd /d "%~dp0.."

echo.
echo [1/1] Build Quasar + Capacitor iOS...
call npx quasar build -m capacitor -T ios

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Build iOS completato!
    echo Output: ios\
    echo.
    echo Per firmare e distribuire:
    echo   1. Apri: ios\App\App.xcworkspace
    echo   2. Configura signing in Xcode
    echo   3. Build > Archive
    echo ========================================
) else (
    echo.
    echo ERRORE: Build iOS fallito!
    echo.
    echo Nota: Questo script richiede macOS con Xcode.
    echo Non puo' essere eseguito su Windows.
    exit /b 1
)

pause
