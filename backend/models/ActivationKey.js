const mongoose = require("mongoose");

const ActivationKeySchema = new mongoose.Schema({
  clave: { type: String, required: true, unique: true },
  usada: { type: Boolean, default: false }
});

module.exports = mongoose.model("ActivationKey", ActivationKeySchema);
