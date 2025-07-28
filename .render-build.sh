#!/usr/bin/env bash
echo "Installing Node dependencies..."
npm install
if [ ! -f stockfish-ubuntu-x86-64-avx2 ]; then
  echo "Downloading Stockfish....."
  curl -L -o stockfish-ubuntu-x86-64-avx2.tar "https://github.com/official-stockfish/Stockfish/releases/latest/download/stockfish-ubuntu-x86-64-avx2.tar"
  ls -al
  echo "Now going to use tar"
  tar -xf stockfish-ubuntu-x86-64-avx2.tar
  mv stockfish/stockfish-ubuntu-x86-64-avx2 .
  ls -al
  chmod +x stockfish-ubuntu-x86-64-avx2
else
  echo "Stockfish binary already present, skipping download."
fi

echo "Build script complete"
