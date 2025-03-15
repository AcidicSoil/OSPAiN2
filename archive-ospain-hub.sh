#!/bin/bash
echo "Creating archive directory..."
mkdir -p archive/OSPAiN2-hub-archived

echo "Copying essential files..."
cp -r OSPAiN2-hub/src archive/OSPAiN2-hub-archived/
cp -r OSPAiN2-hub/public archive/OSPAiN2-hub-archived/
cp OSPAiN2-hub/*.json archive/OSPAiN2-hub-archived/
cp OSPAiN2-hub/*.md archive/OSPAiN2-hub-archived/
cp OSPAiN2-hub/*.js archive/OSPAiN2-hub-archived/
cp OSPAiN2-hub/.env* archive/OSPAiN2-hub-archived/ 2>/dev/null || true

echo "Archive created at archive/OSPAiN2-hub-archived/"
echo "You can now safely move or rename the original OSPAiN2-hub directory" 