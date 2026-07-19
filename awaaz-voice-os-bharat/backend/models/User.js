const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name:              { type: String, required: true, trim: true },
  phone:             { type: String, required: true, unique: true, trim: true },
  aadhaar:           { type: String, trim: true },
  village:           { type: String, trim: true },
  district:          { type: String, trim: true },
  state:             { type: String, trim: true },
  pincode:           { type: String, trim: true },
  preferredLanguage: { type: String, default: "hi",
    enum: ["hi","bn","te","mr","ta","gu","ur","kn","or","pa","ml","as","mai","bho","en"] },
  gps: { lat: Number, lng: Number },
}, { timestamps: true });
module.exports = mongoose.model("User", userSchema);
