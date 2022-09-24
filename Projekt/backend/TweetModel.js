
const mongoose = require("mongoose");

const tweet = new mongoose.Schema({
  query: String,
  data: Object,
  timeStamp: Date,
});

module.exports = mongoose.model("tweet", tweet);
