// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");

// const UserSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   email:    { type: String, required: true, unique: true },
//   passwordHash: { type: String, required: true },
//   servicioActivo: { type: Boolean, default: false },
//   estadoCuenta: { 
//     type: String, 
//     enum: ["REGISTRADO", "ACTIVO"],
//     default: "REGISTRADO"
//   },
//   claveActivacionUsada: { type: String, default: null },
//   createdAt: { type: Date, default: Date.now },
//   twoFactorSecret: { type: String, default: null }
// });

// // Método para validar contraseñas
// UserSchema.methods.comparePassword = function(password) {
//   return bcrypt.compare(password, this.passwordHash);
// };

// module.exports = mongoose.model("User", UserSchema);







const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  servicioActivo: { type: Boolean, default: false },
  estadoCuenta: { 
    type: String, 
    enum: ["REGISTRADO", "ACTIVO"],
    default: "REGISTRADO"
  },
  claveActivacionUsada: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  twoFactorSecret: { type: String, default: null }
});

// Método para validar contraseñas
UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model("User", UserSchema);
