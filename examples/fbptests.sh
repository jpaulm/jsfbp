#!/usr/bin/env bash

for file in ./fbptest*.js ; do
  if [ -e "$file" ] ; then
    echo "Running $file"
    node "$file" > /dev/null
  fi
done