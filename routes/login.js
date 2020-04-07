var express = require('express');
var bcrypt = require('bcryptjs');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').CLIENT_ID;

var app = express();

// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var Usuario = require('../models/usuario');

// Google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

//==================================
// Autenticación Google
//==================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
        payload: payload
    }
}

app.post('/google', async(req, res) => {

    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(err => {
            res.status(403).json({
                ok: false,
                mensaje: 'Token inválido'
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error buscando usuario',
                errors: err
            });
        }

        if (usuarioDB) {

            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar la autenticación por base de datos',
                    errors: err
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    img: usuarioDB.img
                });
            }

        } else {
            // El usuario no está creado en la base de datos
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioGuardadoDB) => {

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(201).json({
                    ok: true,
                    usuario: usuarioGuardadoDB,
                    token: token,
                    id: usuarioGuardadoDB._id
                });

            });

        }
    });

    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'Ok',
    //     googleUser: googleUser
    // });

});

//==================================
// Autenticación Base de datos
//==================================
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error buscando usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: true,
                mensaje: `Credenciales incorrectas - email`,
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: true,
                mensaje: `Credenciales incorrectas - password`,
                errors: err
            });
        }

        // Crear Token
        usuarioDB.password = ":)";
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });

});

module.exports = app;