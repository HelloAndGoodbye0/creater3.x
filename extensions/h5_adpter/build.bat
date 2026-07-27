@echo off
call pkg obfuscatedFile.js  --target win
call pkg obfuscatedFile.js  --target macos  -o obfuscatedFile
echo "success===="
pause