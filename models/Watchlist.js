// const mongoose = require("mongoose");

// const WatchlistSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
//   movies: [
//     {
//       id: { type: Number, required: true }, // Movie ID from TMDB
//       original_title: { type: String, required: true },
//       overview: { type: String },
//       poster_path: { type: String },
//     },
//   ],
// }, { timestamps: true });

// module.exports = mongoose.model("Watchlist", WatchlistSchema);
const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  movie: {
    id: { type: Number, required: true },
    original_title: { type: String, required: true },
    overview: { type: String },
    poster_path: { type: String },
  },
});

const Watchlist = mongoose.model('Watchlist', WatchlistSchema);
module.exports = Watchlist;
