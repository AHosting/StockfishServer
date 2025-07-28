#!/usr/bin/env bash

echo "Downloading Stockfish..."'
curl -L -o stockfish.tar "https://github.com/official-stockfish/Stockfish/releases/latest/download/stockfish-ubuntu-x86-64-avx2.tar"
tar -xf stockfish.tar
mv stockfish* stockfish
chmod +x stockfish
