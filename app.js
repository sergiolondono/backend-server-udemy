// Requires
var express = require('express');
var mongoose = require('mongoose');

require('dotenv').config();

// Inicializar variables
var app = express();

console.log(process.env);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

// Importar Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var loginRoutes = require('./routes/login');
var busquedaRoutes = require('./routes/busqueda');
var imagenesRoutes = require('./routes/imagenes');
var uploadRoutes = require('./routes/upload');

// Establecer conexión a la base de datos
mongoose.connection.openUri(process.env.DB_CNN, (err, res) => {
    if (err) throw err;

    console.log('Database: \x1b[32m%s\x1b[0m', 'online');
});

// Server index config
var serveIndex = require('serve-index');
app.use(express.static(__dirname + '/'));
app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(process.env.PORT, () => {
    console.log('Express server port ' + process.env.PORT + ': \x1b[32m%s\x1b[0m', 'online');
});