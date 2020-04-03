var express = require('express');
var mongoose = require('mongoose');

var fileUpload = require('express-fileupload');
var fs = require('fs');

// Inicializar variables
var app = express();

// Models
var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de colección
    var tiposValidos = ['usuarios', 'hospitales', 'medicos'];

    if (tiposValidos.indexOf(tipo) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo inválido',
            errors: { message: `Los tipos válidas son ${tiposValidos.join(', ')}` }
        });

    }

    if (!req.files) {

        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        });

    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var extensionArchivo = archivo.name.split('.').pop();
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión inválida',
            errors: { message: `Las extensiones válidas son ${extensionesValidas.join(', ')}` }
        });

    }

    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirImagenxTipo(tipo, id, nombreArchivo, res);

    });

});

function subirImagenxTipo(tipo, id, nombreArchivo, res) {

    switch (tipo) {
        case 'usuarios':

            Usuario.findById(id, (err, usuario) => {

                if (!usuario) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Usuario inexistente',
                        errors: { message: 'Usuario no existe' }
                    });
                }

                var pathOld = './uploads/usuarios/' + usuario.img;

                if (fs.existsSync(pathOld)) {
                    fs.unlink(pathOld, (err) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                erorr: err
                            });
                        }
                    });
                }

                usuario.img = nombreArchivo;

                usuario.save((err, usuarioActualizado) => {

                    usuarioActualizado.password = ':)';
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizado',
                        usuario: usuarioActualizado
                    });

                });

            });

            break;
        case 'hospitales':

            Hospital.findById(id, (err, hospital) => {

                if (!hospital) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Hospital inexistente',
                        errors: { message: 'Hospital no existe' }
                    });
                }

                var pathOld = './uploads/hospitales/' + hospital.img;

                if (fs.existsSync(pathOld)) {
                    fs.unlink(pathOld, (err) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                erorr: err
                            });
                        }
                    });
                }

                hospital.img = nombreArchivo;

                hospital.save((err, hospitalActualizado) => {

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizado',
                        hospital: hospitalActualizado
                    });

                });

            });

            break;

        case 'medicos':

            Medico.findById(id, (err, medico) => {

                if (!medico) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Medico inexistente',
                        errors: { message: 'Medico no existe' }
                    });
                }

                var pathOld = './uploads/medicos/' + medico.img;

                if (fs.existsSync(pathOld)) {
                    fs.unlink(pathOld, (err) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                erorr: err
                            });
                        }
                    });
                }

                medico.img = nombreArchivo;

                medico.save((err, medicoActualizado) => {

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico actualizado',
                        usuario: medicoActualizado
                    });

                });

            });

            break;

    }

}

module.exports = app;