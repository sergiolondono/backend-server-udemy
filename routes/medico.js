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

var Medico = require('../models/medico');


// ================================
// Consultar medicos
// ================================

app.get('/', (req, res, next) => {
    Medico.find({})
        .exec(
            (err, medicos) => {

                if (err) {
                    return res.status(500).json({
                        ok: true,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    medicos: medicos
                });
            });
});


// ================================
// Crear un medico
// ================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: body.usuario,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: true,
                mensaje: 'Error creando el medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            medicoToken: req.usuario
        });

    });
});


// ================================
// Actualizar un medico
// ================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'Error buscando medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: true,
                mensaje: `El medico con el id ${id} no existe`,
                errors: { message: 'No existe un medico con el id enviado' }
            });
        }

        medico.nombre = body.nombre;
        medico.img = body.img;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Error actualizando el medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });

});


// ================================
// Eliminar un médico
// ================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'Error eliminando medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: true,
                mensaje: 'No existe un medico con el id enviado',
                errors: { message: 'No existe un medico con el id enviado' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });

});

module.exports = app;