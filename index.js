const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const UserModel = require("./models/User");
const WatchlistModel = require("./models/Watchlist");
require("dotenv").config();

const app = express();
app.use(express.json());
// app.use(cors());
app.use(cors({
    origin: ["http://localhost:3000", "https://moviematebydhruvin.netlify.app"], // Allow only these domains
    credentials: true  // Allow cookies & authentication headers
}));


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Register User
app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const newUser = new UserModel({ username, email, password });
        await newUser.save();

        res.json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error registering user" });
    }
});

app.post('/login', (req, res) => { 
    const { email, password } = req.body;

    UserModel.findOne({ email: email })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    console.log("User ID:", user._id); // Debugging

                    // Send userId in response
                    res.json({ success: true, userId: user._id });
                } else {
                    res.json({ success: false, message: "Incorrect Password" });
                }
            } else {
                res.json({ success: false, message: "Email doesn't exist" });
            }
        })
        .catch(err => {
            console.error("Login Error:", err);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        });
});


// POST endpoint to add movie to the watchlist
app.post('/watchlist', async (req, res) => {
    const { userId, movie } = req.body;
  
    try {
      // Check if the movie is already in the user's watchlist
      const existingMovie = await WatchlistModel.findOne({ userId, 'movie.id': movie.id });
      if (existingMovie) {
        return res.status(400).json({ message: 'Movie already in the watchlist' });
      }
  
      // Create a new watchlist entry
      const newWatchlistEntry = new WatchlistModel({ userId, movie });
      await newWatchlistEntry.save();
  
      res.status(201).json({ message: 'Movie added to watchlist' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error adding movie to watchlist' });
    }
  });

  app.get('/watchlist', async (req, res) => {
    const { userId } = req.query; // Correct way for GET requests

    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        const watchlist = await WatchlistModel.find({ userId });
        res.status(200).json(watchlist);
    } catch (err) {
        console.error("Error fetching watchlist:", err);
        res.status(500).json({ message: "Error fetching watchlist" });
    }
});


app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
