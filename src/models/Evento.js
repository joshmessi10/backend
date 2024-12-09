const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EventoSchema = new Schema({
  id_billetera: {
    type: Schema.Types.ObjectId,
    ref: "Billetera",
    required: true,
  },
  id_sensor: {
    type: Schema.Types.ObjectId,
    ref: "Sensor",
    required: true,
  },
  tipo_evento: {
    type: String,
    enum: ["acceso_no_autorizado", "caida_detectada", "desconexion", "null"],
    default: "null",
    required: true,
  },
  fecha_hora: {
    type: Date,
    default: Date.now,
  },
  nivel_bateria: {
    type: Number,
    required: true,
  },
  ubicacion: {
    type: Schema.Types.ObjectId,
    ref: "Geolocalizacion",
    required: false,
  },
  prioridad: {
    type: Number,
    required: true,
  },
});

EventoSchema.index(
  {
    _id: 1,
    id_sensor: 1,
    prioridad: 1,
  },
  { unique: true }
);

module.exports = mongoose.model("Evento", EventoSchema);
