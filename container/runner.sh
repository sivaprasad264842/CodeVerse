#!/bin/bash

CMD=$1

ulimit -t 2
ulimit -v 262144

if ! [ -x "$(command -v unshare)" ]; then 
    bash -c "$CMD < input.txt" 
else
    unshare -n bash -c "$CMD < input.txt"
fi
