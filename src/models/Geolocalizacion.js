const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GeolocalizacionSchema = new Schema({
    id_billetera: { 
        type: Schema.Types.ObjectId, 
        ref: 'Billetera', 
        required: true 
    },
    latitud: { 
        type: Number, 
        required: true 
    },
    longitud: { 
        type: Number, 
        required: true 
    },
    fecha_registro: { 
        type: Date, 
        default: Date.now , 
        required: true
    }
});

module.exports = mongoose.model('Geolocalizacion', GeolocalizacionSchema);
