const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    descripcion: {
        type: String,
        required: [true, 'El nombre de la categoria es necesario']
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }
});


module.exports = mongoose.model('Categoria', categoriaSchema);