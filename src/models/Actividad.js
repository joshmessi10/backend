const mongoose = require("mongoose");

const RegistrosActividadSchema = new mongoose.Schema({
  id_actividad: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  id_usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  id_billetera: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DispositivosBilletera",
    required: true,
  },
  fecha_hora: {
    type: Date,
    default: Date.now,
  },
  accion: {
    type: Boolean,
    required: true,
  },
  ubicacion_estimada: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Geolocalizacion",
    required: false,
  },
});

const RegistrosActividad = mongoose.model(
  "RegistrosActividad",
  RegistrosActividadSchema
);

module.exports = RegistrosActividad;
