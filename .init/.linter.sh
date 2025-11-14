#!/bin/bash
cd /home/kavia/workspace/code-generation/world-time-comparison-225496-225505/frontend_react_js
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

