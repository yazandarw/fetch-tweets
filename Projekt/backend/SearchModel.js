
const mongoose = require("mongoose");

const search = new mongoose.Schema({
  search: String,
  userEmail: String,
});

module.exports = mongoose.model("search", search);
