const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const crypto = require('crypto'); 
require('dotenv').config();
//const PostGres_URI = 'postgresql://username:password@localhost:5432/mydatabase';
  
const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.PostGres_URI,
});

const activeSessions = new Map();

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  console.log("Login::",username,":::",password);
  try {
    const query = 'SELECT * FROM users WHERE username = $1 AND password = $2';
    const result = await pool.query(query, [username, password]);

    if (result.rows.length > 0) {
      const token = crypto.randomBytes(32).toString('hex');
      activeSessions.set(token, { username, loginTime: Date.now() });
      res.json({ success: true, token, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err  });
  }
});

app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  console.log("Signup::",username,":::",password);
  try {
    const query = 'INSERT INTO users (username,password) VALUES ($1,$2)';        
    const result = await pool.query(query, [username, password]);
    if (result.rowCount > 0) {
      const token = crypto.randomBytes(32).toString('hex');
      activeSessions.set(token, { username, loginTime: Date.now() });
      res.status(201).json({ success: true, token, message: 'User created successfully' });
    } else {
      res.status(401).json({ success: false, message: 'Failed to create user' });
    }
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err });
  }
});

function getSession(req){
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return null;
  const session = activeSessions.get(token);
  return session || null;
}

app.post('/api/postGame', async (req, res) => {
  console.log("PostGame::");  
  const session = getSession(req);
  if (!session) {
    return res.status(403).json({ success: false, message: 'Unauthorized. Please login' });
  }
  const username = session.username;
  const { gameDetails } = req.body;
  const { id, color, computer, timeWhite, timeBlack, pgn} = gameDetails;
  console.log("PostGame::",id,":::",username,":::",pgn);  
  try {
    let query = null;
    let params = [];
    if (id === -1) {
      query = 'INSERT INTO games (username, color, computer, timewhite, timeblack, pgn) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *';       
      params = [username, color, computer, timeWhite, timeBlack, pgn];
    }
    else {
      query = 'UPDATE games SET timewhite = $1, timeblack = $2, pgn = $3 WHERE id = $4 RETURNING *';
      params = [timeWhite, timeBlack, pgn, id];
    }
    const result = await pool.query(query, params);
    if (result.rowCount > 0) {
      const gameId = result.rows[0].id;
      res.status(201).json({ success: true, gameId });
    } else {
      res.status(401).json({ success: false});
    }
  } catch (err) {
    console.error('Error in postGame:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err });
  }
});

app.get('/api/getGames', async (req,res) => {
  console.log("GET Games for user::");
  const session = getSession(req);
  if (!session) {
    return res.status(403).json({ success: false, message: 'Unauthorized. Please login' });
  }
  const username = session.username;
  console.log("GET Games for user::",username);
  try {
    const result = await pool.query("SELECT * from games WHERE username = $1 ORDER BY id DESC",[username]);
    res.json({ success: true, games: result.rows });
  } catch (err) {
    console.error('Error in getting games', err);
    res.json({ getusers: false, message: 'Error in getting games', error: err });
  }
});

app.get('/test/users', async (req,res) => {
  console.log("Users::");
  try {
    const result = await pool.query("SELECT username from users");
    const usernames = result.rows.map(row => row.username);
    res.json(usernames);
  } catch (err) {
    console.error('Error in getting users', err);
    res.json({ getusers: false, message: 'Error in getting users', error: err });
  }
});

app.get('/test/games', async (req,res) => {
  console.log("GET Games::");
  try {
    const result = await pool.query("SELECT * from games");
    res.json({ success: true, games: result.rows });
  } catch (err) {
    console.error('Error in getting games', err);
    res.json({ getusers: false, message: 'Error in getting games', error: err });
  }
});

app.get('/test/basic', async (req,res) => {
  res.json({ test: true, message: 'This is the test message' });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
