const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;
const STOCKFISH_PATH = "./stockfish-ubuntu-x86-64-avx2"; // stockfish binary should be in project root

// Run Stockfish and get best move
function runStockfish(fen, depth = 15) {
  return new Promise((resolve, reject) => {
    const stockfish = spawn(STOCKFISH_PATH);
    let output = "";

    stockfish.stdout.on("data", (data) => {
      const text = data.toString();
      output += text;

      if (text.includes("bestmove")) {
        const bestMoveMatch = text.match(/bestmove\s+(\S+)/);
        const bestMove = bestMoveMatch ? bestMoveMatch[1] : null;
        resolve({ bestMove, raw: output });
        stockfish.kill();
      }
    });

    stockfish.stderr.on("data", (data) => {
      console.error("Stockfish error:", data.toString());
    });

    stockfish.on("error", (err) => {
      reject(err);
    });

    // Send UCI commands to Stockfish
    stockfish.stdin.write("uci\n");
    stockfish.stdin.write(`position fen ${fen}\n`);
    stockfish.stdin.write(`go depth ${depth}\n`);
  });
}

// Define API route
app.get("/best-move", async (req, res) => {
  const fen = req.query.fen;
  const depth = parseInt(req.query.depth || "15");

  if (!fen) {
    return res.status(400).json({ error: "Missing FEN parameter" });
  }

  try {
    const result = await runStockfish(fen, depth);
    res.json(result);
  } catch (error) {
    console.error("Error running Stockfish:", error);
    res.status(500).json({ error: "Failed to evaluate position" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`♟️ Stockfish API running on port ${PORT}`);
});
