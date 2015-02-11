#!/usr/bin/env bash

for (( i = 1; i < 12; i++ )); do
  echo "fbptest$i.js"
  node "examples/fbptest$i.js" > /dev/null
done
