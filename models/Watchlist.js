// const mongoose = require('mongoose');

// const WatchlistSchema = new mongoose.Schema({
//   userId: { type: String, required: true },
//   movie: {
//     id: { type: Number, required: true },
//     original_title: { type: String, required: true },
//     overview: { type: String },
//     poster_path: { type: String },
//   },
// });

// const Watchlist = mongoose.model('Watchlist', WatchlistSchema);
// module.exports = Watchlist;

const mongoose = require("mongoose");

const WatchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  movie: {
    id: { type: Number, required: true, index: true },
    title: String,
    overview: String,
    poster_path: String
  }
});

// Compound index for faster "already in watchlist" checks
WatchlistSchema.index({ userId: 1, "movie.id": 1 }, { unique: true });

module.exports = mongoose.model("Watchlist", WatchlistSchema);
