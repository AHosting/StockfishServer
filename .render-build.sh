#!/usr/bin/env bash

echo "Downloading Stockfish....."
curl -L -o stockfish.tar "https://github.com/official-stockfish/Stockfish/releases/latest/download/stockfish-ubuntu-x86-64-avx2.tar"
tar -xf stockfish-ubuntu-x86-64-avx2.tar
mv stockfish/stockfish-ubuntu-x86-64-avx2 .
chmod +x stockfish-ubuntu-x86-64-avx2
