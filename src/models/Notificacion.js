const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificacionSchema = new Schema({
  id_usuario: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  id_evento: {
    type: Schema.Types.ObjectId,
    ref: "Evento",
    required: true,
  },
  tipo_notificacion: {
    type: String,
    required: true,
  },
  mensaje: {
    type: String,
    required: true,
  },
  fecha_envio: {
    type: Date,
    default: Date.now,
  },
  estado_notificacion: {
    type: String,
    enum: ["enviada", "leída", "ignorada"],
    default: "enviada",
  },
});

module.exports = mongoose.model("Notificacion", NotificacionSchema);
