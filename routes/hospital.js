var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var Hospital = require('../models/hospital');

// ================================
// Consultar hospitales
// ================================

app.get('/', (req, res, next) => {
    Hospital.find({})
        .exec(
            (err, hospitales) => {

                if (err) {
                    return res.status(500).json({
                        ok: true,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    hospitales: hospitales
                });
            });
});

// ================================
// Crear un hospital
// ================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: body.usuario
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: true,
                mensaje: 'Error creando el hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            hospitalToken: req.usuario
        });

    });
});


// ================================
// Actualizar un hospital
// ================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'Error buscando hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: true,
                mensaje: `El hospital con el id ${id} no existe`,
                errors: { message: 'No existe un hospital con el id enviado' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.img = body.img;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Error actualizando el hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    });

});


// ================================
// Eliminar un hospital
// ================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'Error eliminando hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: true,
                mensaje: 'No existe un hospital con el id enviado',
                errors: { message: 'No existe un hospital con el id enviado' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });

});

module.exports = app;