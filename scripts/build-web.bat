@echo off
REM ============================================
REM Script per compilare la versione ERP Web
REM ============================================

echo.
echo ========================================
echo Compilazione Versione Web (SPA)
echo ========================================
echo.

cd /d "%~dp0.."

REM Compila la versione SPA
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Build completato con successo!
    echo Output: dist\spa\
    echo ========================================
) else (
    echo.
    echo ERRORE: Build fallito!
    exit /b 1
)

pause
