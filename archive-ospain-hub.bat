@echo off
echo Creating archive directory...
mkdir archive\OSPAiN2-hub-archived

echo Copying essential files...
xcopy /E /I /Y OSPAiN2-hub\src archive\OSPAiN2-hub-archived\src
xcopy /E /I /Y OSPAiN2-hub\public archive\OSPAiN2-hub-archived\public
copy OSPAiN2-hub\*.json archive\OSPAiN2-hub-archived\
copy OSPAiN2-hub\*.md archive\OSPAiN2-hub-archived\
copy OSPAiN2-hub\*.js archive\OSPAiN2-hub-archived\
copy OSPAiN2-hub\.env* archive\OSPAiN2-hub-archived\

echo Archive created at archive\OSPAiN2-hub-archived\
echo You can now safely move or rename the original OSPAiN2-hub directory 