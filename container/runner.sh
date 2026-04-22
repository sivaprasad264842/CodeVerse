#!/bin/bash

RUN_CMD=$1

ulimit -t 2
ulimit -v 262144

if ! command -v unshare &> /dev/null; then 
    bash -c "$RUN_CMD < input.txt > output.txt 2> error.txt" 
else
    unshare -n bash -c "$RUN_CMD < input.txt > output.txt 2> error.txt"
fi

echo "===OUTPUT==="
cat output.txt 2>/dev/null 

echo "===ERROR==="
cat error.txt 2>/dev/null 