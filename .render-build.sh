#!/usr/bin/env bash

echo "Downloading Stockfish....."
curl -L -o stockfish-ubuntu-x86-64-avx2.tar "https://github.com/official-stockfish/Stockfish/releases/latest/download/stockfish-ubuntu-x86-64-avx2.tar"
ls -al
echo "Now going to use tar"
tar -xf stockfish-ubuntu-x86-64-avx2.tar
mv stockfish/stockfish-ubuntu-x86-64-avx2 .
ls -al
chmod +x stockfish-ubuntu-x86-64-avx2
