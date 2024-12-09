const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConexionSchema = new Schema({
    id_billetera: { 
        type: Schema.Types.ObjectId, 
        ref: 'Billetera', 
        required: true 
    },
    tipo_conexion: { 
        type: Boolean, //Conexión 1 / Desconexión 0
        required: true
    },
    fecha_hora: { 
        type: Date, 
        default: Date.now, 
    },
    nivel_bateria: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Conexion', ConexionSchema);