@echo off
setlocal enabledelayedexpansion

echo Building images.json...

set "first=1"
echo {> images.json

for /D %%D in (products\*) do (
    set "folder=%%~nxD"
    set "imgFirst=1"
    set "hasImages=0"

    for %%F in ("%%D\*.jpg" "%%D\*.jpeg" "%%D\*.png" "%%D\*.gif" "%%D\*.webp" "%%D\*.avif") do (
        set "hasImages=1"
    )

    if !hasImages!==1 (
        if !first!==0 echo ,>> images.json
        set "first=0"

        set /p ="  "!folder!": ["< nul >> images.json

        for %%F in ("%%D\*.jpg" "%%D\*.jpeg" "%%D\*.png" "%%D\*.gif" "%%D\*.webp" "%%D\*.avif") do (
            if !imgFirst!==1 (
                set "imgFirst=0"
                set /p ="""%%~nxF"""< nul >> images.json
            ) else (
                set /p =", "%%~nxF""< nul >> images.json
            )
        )

        echo ]>> images.json
    )
)

echo }>> images.json

echo Done! images.json updated.
pause
