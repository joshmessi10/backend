const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CelularSchema = new Schema({
    id_billetera: { 
        type: Schema.Types.ObjectId, 
        ref: 'Billetera', 
        required: true 
    },
    id_usuario: { 
        type: Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    nombre_dispositivo: { 
        type: String, 
        required: true 
    }, 
    direccion_mac: { 
        type: String, 
        required: true, 
        unique: true 
    }, 
    sistema_operativo: { 
        type: String, 
        required: true 
    },
    ultima_fecha_acceso: { 
        type: Date, 
        default: Date.now 
    },
    nivel_bateria: { 
        type: Number, 
        required: true
    },
    notificaciones_activas:{
        type: Boolean,
        default: false
    }
});

CelularSchema.index({ 
    _id: 1, 
    id_usuario: 1, 
    id_billetera: 1 
}, { unique: true });

module.exports = mongoose.model('Celular', CelularSchema);