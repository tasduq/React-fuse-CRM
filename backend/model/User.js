const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Staff", "Admin","gust"], default: "Staff" },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
