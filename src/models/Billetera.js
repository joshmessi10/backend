const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BilleteraSchema = new Schema({
  id_usuario: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  nombre_billetera: {
    type: String,
    required: true,
  },
  modelo: {
    type: String,
    required: true,
  },
  fecha_vinculacion: {
    type: Date,
    default: Date.now,
  },
  estado_billetera: {
    type: String,
    enum: ["bloqueada", "desbloqueada", "alerta"],
    default: "desbloqueada",
  },
  nivel_bateria: {
    type: Number,
    required: true,
  },
  ultima_ubicacion: {
    type: Schema.Types.ObjectId,
    ref: "Geolocalizacion",
    required: false,
  },
});

BilleteraSchema.index(
  {
    _id: 1,
    id_usuario: 1,
  },
  { unique: true }
);

module.exports = mongoose.model("Billetera", BilleteraSchema);
