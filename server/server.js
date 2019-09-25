require('./config/config.js');

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//Configuracion global de rutas.
app.use(require('./routes/index'));

//habilitar carpeta public
app.use(express.static(path.resolve(__dirname , '../public')));

mongoose.connect(process.env.URLDB, (err, res) => {
    if (err) throw err;

    console.log('Base de datos Online', process.env.URLDB);
});
app.listen(process.env.PORT, () => console.log('Escuchando puerto', process.env.PORT));