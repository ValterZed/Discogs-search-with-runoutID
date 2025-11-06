@ECHO OFF
node "scripts\installation.js"

set /p startApp=Open app now? (Y/N):
if /I "%startApp%"=="Y" (
    node "scripts\discocksRC.js"
) else (
    ECHO You can start the app later by running Discocks-app.bat
    PAUSE
)