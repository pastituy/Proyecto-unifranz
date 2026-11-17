@echo off
echo ================================================
echo   Iniciando Expo con Modo Tunel
echo ================================================
echo.
echo IMPORTANTE:
echo - Asegurate de tener Expo Go instalado en tu telefono
echo - Escanea el codigo QR que aparecera
echo - El modo tunel es mas lento pero mas confiable
echo.
echo Presiona Ctrl+C para detener
echo.
pause

cd "%~dp0"
npx expo start --tunnel

pause
