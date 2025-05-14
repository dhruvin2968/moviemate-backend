const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./models/User");
const WatchlistModel = require("./models/Watchlist");
const bcrypt = require('bcryptjs'); 

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
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Format: "Bearer <token>"
    if (!token) return res.status(401).json({ message: "Access denied" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid Token" });
    }
};

// Register User
app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({ username, email, password: hashedPassword });
        await newUser.save();

        res.json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error registering user" });
    }
});
const jwt = require('jsonwebtoken');
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(400).json({ message: "Email doesn't exist" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1m" });

        res.json({ success: true, token, userId: user._id, username: user.username });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
// POST endpoint to add movie to the watchlist
app.post('/watchlist', verifyToken, async (req, res) => {
    const { movie } = req.body;
    const userId = req.userId;
 
    try {
        const existingMovie = await WatchlistModel.findOne({ userId, 'movie.id': movie.id });
        if (existingMovie) return res.status(400).json({ message: 'Movie already in the watchlist' });

        const newWatchlistEntry = new WatchlistModel({ userId, movie });
        await newWatchlistEntry.save();

        res.status(201).json({ message: 'Movie added to watchlist' });
    } catch (err) {
        res.status(500).json({ message: 'Error adding movie to watchlist' });
    }
});

app.get('/watchlist',  verifyToken, async (req, res) => {
    const userId = req.userId;

    try {
        const watchlist = await WatchlistModel.find({ userId });
        const formattedWatchlist = watchlist.map(movie => ({
            ...movie.toObject(),
            id: movie._id // Ensure an `id` field is included
        }));
        res.status(200).json(formattedWatchlist);
    } catch (err) {
        console.error("Error fetching watchlist:", err);
        res.status(500).json({ message: "Error fetching watchlist" });
    }
});

app.delete('/watchlist', verifyToken, async (req, res) => {
    const {movieId } = req.body; // Get userId and movieId from request body
    const userId = req.userId;
    try {
        const result = await WatchlistModel.findOneAndDelete({ userId, 'movie.id': movieId });

        if (!result) {
            return res.status(404).json({ message: 'Movie not found in watchlist' });
        }

        res.json({ message: 'Movie removed from watchlist' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error removing movie from watchlist' });
    }
});


app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
