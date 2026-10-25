#!/bin/bash

for dir in frontend backend authapi dbapi; do
    if [ -f "$dir/env.example" ] && [ ! -f "$dir/.env" ]; then
        cp "$dir/env.example" "$dir/.env"
        echo "Created $dir/.env"
    fi
done

echo "Fill in the API keys in frontend/.env and dbapi/.env before running."
