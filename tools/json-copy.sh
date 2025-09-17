#!/bin/bash
jq -c . ./serviceAccountKey.json | pbcopy
echo "Copied compact JSON from $1 to clipboard"
