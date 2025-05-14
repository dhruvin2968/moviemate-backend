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
