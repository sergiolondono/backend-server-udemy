var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');

var app = express();

// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var Usuario = require('../models/usuario');

app.get('/', (req, res, next) => {
    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: true,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    // usuarios: usuarios
                    usuarios
                });
            });
});

// ================================
// Crear un nuevo usuario
// ================================

app.post('/', (req, res) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: true,
                mensaje: 'Error creando el usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado
        });

    });
});


// ================================
// Actualizar un nuevo usuario
// ================================

app.put('/:id', (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'Error buscando usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: true,
                mensaje: `El usuario con el id ${id} no existe`,
                errors: { message: 'No existe un usuario con el id enviado' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Error actualizando el usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });

    });

});

// ================================
// Eliminar un nuevo usuario
// ================================
app.delete('/:id', (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'Error eliminando usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: true,
                mensaje: 'No existe un usuario con el id enviado',
                errors: { message: 'No existe un usuario con el id enviado' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});

module.exports = app;