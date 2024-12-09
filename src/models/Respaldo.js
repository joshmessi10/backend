const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RespaldoSchema = new Schema({
  id_usuario: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: false,
  },
  id_billetera: {
    type: Schema.Types.ObjectId,
    ref: "Billetera",
    required: false,
  },
  fecha_respaldo: {
    type: Date,
    required: true,
    default: Date.now,
  },
  tamano_respaldo: {
    type: Number,
    required: true,
  },
  estado_respaldo: {
    type: Boolean, //Estado Completado/Fallido
    required: true,
  },
  version_datos: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Respaldo", RespaldoSchema);
