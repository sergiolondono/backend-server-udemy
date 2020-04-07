var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesPermitidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un valor permitido'
};

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es requerido'] },
    email: { type: String, unique: true, required: [true, 'El correo es requerido'] },
    password: { type: String, required: [true, 'El password es requerido'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesPermitidos },
    google: { type: Boolean, default: false }
});

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });

module.exports = mongoose.model('Usuario', usuarioSchema);