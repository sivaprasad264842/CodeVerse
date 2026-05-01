#!/bin/bash

CMD=$1

ulimit -t 2

if command -v unshare >/dev/null 2>&1 && unshare -n true >/dev/null 2>&1; then
    unshare -n bash -c "$CMD < input.txt"
else
    bash -c "$CMD < input.txt"
fi
