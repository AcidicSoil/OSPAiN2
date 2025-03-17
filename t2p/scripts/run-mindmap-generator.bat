@echo off
cd /d "C:\Users\comfy\OSPAiN2\t2p"
echo Running Architecture Mindmap Generator at %DATE% %TIME% >> mindmap-log.txt
call npx ts-node scripts/generate-mindmap.ts >> mindmap-log.txt 2>&1