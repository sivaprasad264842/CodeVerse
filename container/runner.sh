#!/bin/bash

RUN_CMD=$1

ulimit -t 2        # CPU time
ulimit -v 262144   # Memory limit (256MB)

unshare -n bash -c "$RUN_CMD < input.txt > output.txt 2> error.txt"

echo "===OUTPUT==="
cat output.txt

echo "===ERROR==="
cat error.txt