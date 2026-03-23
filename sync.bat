@echo off
title Los Galactique Protect - Sync GitHub Auto
color 0A

echo ========================================
echo   Los Galactique Protect - Sync GitHub
echo ========================================
echo.
echo Synchronisation automatique toutes les 30s
echo Appuyez sur CTRL+C pour arreter.
echo ========================================
echo.

cd /d "%USERPROFILE%\OneDrive - Conseil régional Grand Est - Numérique Educatif\Bureau\applic"

:loop
echo [%time%] Verification des modifications...

git add .

git diff --cached --quiet
if %errorlevel% equ 0 (
    echo [%time%] Aucun changement detecte.
) else (
    git commit -m "Auto-sync %date% %time%"
    git push origin main
    echo [%time%] Modifications envoyees sur GitHub !
)

echo.
timeout /t 30 /nobreak >nul
goto loop
