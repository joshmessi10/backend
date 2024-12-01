const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConexionSchema = new Schema({
    tipo_conexion: { 
        type: Boolean, //Conexión 1 / Desconexión 0
        required: true
    },
    id_billetera: { 
        type: Schema.Types.ObjectId, 
        ref: 'Billetera', 
        required: true 
    },
    fecha_hora: { 
        type: Date, 
        default: Date.now, 
        required: true 
    },
    nivel_bateria: { 
        type: Number, 
        required: true 
    },
    distancia_estimada: { 
        type: Number 
    }
});

module.exports = mongoose.model('Conexion', ConexionSchema);