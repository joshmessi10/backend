const mongoose = require('mongoose');


const HistorialBateriaSchema = new mongoose.Schema({
  id_bateria: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  id_billetera: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Billetera',
    required: true
  },
  nivel_bateria: {
    type: Number,
    required: true
  },
  fecha_hora: {
    type: Date,
    default: Date.now
  },
  estado_cargando: {
    type: Boolean,
    required: true
  }
});

const HistorialBateria = mongoose.model('HistorialBateria', HistorialBateriaSchema);

module.exports = HistorialBateria;