const jwt = require("jsonwebtoken");
const { SECRET_ACCESS_TOKEN } = require("../config/index.js");

const mongoose = require("mongoose");
const md5 = require("md5");

const Schema = mongoose.Schema;

const UsuarioSchema = new Schema({
  nombre_usuario: {
    type: String,
    required: true,
  },
  apellido_usuario: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  telefono: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: 0x01,
  },
  fecha_creacion: {
    type: Date,
    default: Date.now,
  },
  ultimo_acceso: {
    type: Date,
    default: Date.now,
  },
  doble_autenticacion: {
    type: Boolean,
    default: false,
  },
  intentos_fallidos: {
    type: Number,
    default: 0,
  },
  bloqueado: {
    type: Boolean,
    default: false,
  },
});

// Hash password before saving
UsuarioSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await md5(this.password);
  next();
});

UsuarioSchema.methods.generateAccessJWT = function () {
  let payload = {
    id: this._id,
  };
  return jwt.sign(payload, SECRET_ACCESS_TOKEN, {
    expiresIn: "20m",
  });
};

UsuarioSchema.index(
  {
    _id: 1,
    email: 1,
  },
  { unique: true }
);

module.exports = mongoose.model("Usuario", UsuarioSchema);
