
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("./models/User");
const WatchlistModel = require("./models/Watchlist");

const compression = require("compression");
const NodeCache = require("node-cache");
require("dotenv").config();

setInterval(async () => {
  try {
    const fetch = (await import("node-fetch")).default;
    await fetch("https://moviemate-backend-tpz4.onrender.com");
    console.log("Pinged backend");
  } catch (err) {
    console.error("Ping failed", err);
  }
}, 13 * 60 * 1000);



const app = express();
app.use(express.json());
app.use(compression()); // compress responses

app.use(cors({
  origin: ["http://localhost:3000", "https://moviematebydhruvin.netlify.app"],
  credentials: true
}));

mongoose.connect(process.env.MONGO_URI);

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

// Register
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await new UserModel({ username, email, password: hashedPassword }).save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error registering user" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email doesn't exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "10m" });

    res.json({ success: true, token, userId: user._id, username: user.username });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Watchlist routes
app.post("/watchlist", verifyToken, async (req, res) => {
  const { movie } = req.body;
  const userId = req.userId;

  try {
    const exists = await WatchlistModel.findOne({ userId, "movie.id": movie.id });
    if (exists) return res.status(400).json({ message: "Already in watchlist" });

    await new WatchlistModel({ userId, movie }).save();
    res.status(201).json({ message: "Movie added to watchlist" });
  } catch (err) {
    res.status(500).json({ message: "Error adding to watchlist" });
  }
});

// app.get("/watchlist", verifyToken, async (req, res) => {
//   try {
//     const watchlist = await WatchlistModel.find({ userId: req.userId });
//     res.json(watchlist.map(movie => ({ ...movie.toObject(), id: movie._id })));
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching watchlist" });
//   }
// });

// Watchlist with pagination
app.get("/watchlist", verifyToken, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const watchlist = await WatchlistModel.find({ userId: req.userId })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(watchlist);
  } catch (err) {
    res.status(500).json({ message: "Error fetching watchlist" });
  }
});
app.delete("/watchlist", verifyToken, async (req, res) => {
  const { movieId } = req.body;
  try {
    const result = await WatchlistModel.findOneAndDelete({
      userId: req.userId,
      "movie.id": movieId
    });

    if (!result) return res.status(404).json({ message: "Movie not found" });
    res.json({ message: "Movie removed from watchlist" });
  } catch (err) {
    res.status(500).json({ message: "Error removing movie" });
  }
});

// TMDB Proxy
// app.get('/api/tmdb/*', async (req, res) => {
//   const endpoint = req.params[0]; // this grabs the full path like "movie/now_playing"
//   const { query = "", page = 1 } = req.query;

//   const TMDB_API_KEY = process.env.TMDB_API_KEY;
//   if (!TMDB_API_KEY) {
//     return res.status(500).json({ message: "TMDB API key not set" });
//   }

//   try {
//     const fetch = (await import("node-fetch")).default;
//     const tmdbUrl = `https://api.themoviedb.org/3/${endpoint}?api_key=${TMDB_API_KEY}&query=${query}&page=${page}`;
//     const response = await fetch(tmdbUrl);

//     if (!response.ok) throw new Error(`TMDB error: ${response.status}`);

//     const data = await response.json();
//     res.json(data);
//   } catch (err) {
//     console.error("TMDB Fetch Error:", err.message);
//     res.status(500).json({ message: "Failed to fetch from TMDB" });
//   }
// });
const tmdbCache = new NodeCache({ stdTTL: 300 }); // cache for 5 min
app.get('/api/tmdb/*', async (req, res) => {
  const endpoint = req.params[0];
  const { query = "", page = 1 } = req.query;
  const cacheKey = `${endpoint}-${query}-${page}`;

  if (tmdbCache.has(cacheKey)) {
    return res.json(tmdbCache.get(cacheKey));
  }

  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_API_KEY) {
    return res.status(500).json({ message: "TMDB API key not set" });
  }

  try {
    console.log("Requesting TMDB:", endpoint, "Query:", query, "Page:", page);
    const fetch = (await import("node-fetch")).default;
    const tmdbUrl = `https://api.themoviedb.org/3/${endpoint}?api_key=${TMDB_API_KEY}&query=${query}&page=${page}`;
    const response = await fetch(tmdbUrl);

    if (!response.ok) throw new Error(`TMDB error: ${response.status}`);

    const data = await response.json();
    tmdbCache.set(cacheKey, data); // store in cache
    res.json(data);
  } catch (err) {
    console.error("TMDB Fetch Error:", err.message);
    res.status(500).json({ message: "Failed to fetch from TMDB" });
  }
});


app.listen(3001, () => {
  console.log("Server is running on port 3001");
}); 
