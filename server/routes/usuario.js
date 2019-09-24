const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
const Usuario = require('../models/usuario');
const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const app = express();

//Consultar registro
app.get('/usuario', verificaToken, (req, res) => {

    let i = Number(req.query.i) || 0;
    let li = Number(req.query.li) || 5;
    let filter = { status: true }

    Usuario.find(filter).skip(i).limit(li).exec((err, usuarios) => {
        if (err) {
            res.status(400).json({
                ok: false,
                err
            });
        }
        Usuario.count(filter, (err, conteo) => {

            res.json({
                ok: true,
                usuarios,
                cantidad: conteo
            })
        });
    });
});

// Crear
app.post('/usuario', [verificaToken , verificaAdminRole], (req, res) => {
    let body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {

        if (err) {
            res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

//Actualizar
app.put('/usuario/:id', [verificaToken , verificaAdminRole], (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'status']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });


});




app.delete('/usuario/:id', [verificaToken , verificaAdminRole], (req, res) => {
    let id = req.params.id;

    Usuario.findByIdAndUpdate(id, { status: false }, { new: true }, (err, usuarioDB) => {

        if (err) {
            res.status(400).json({
                ok: false,
                err
            });
        }
        if (!usuarioDB) {
            res.status(400).json({
                ok: false,
                err: { message: 'Usuario no encontrado' }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});


/* app.delete('/usuario/:id', (req, res) => {
    let id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioDelete) => {
        if (err) {
            res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioDelete) {
            res.status(400).json({
                ok: false,
                err: { message: 'Usuario no encontrado' }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDelete,
            mess: 'El usuario fue eliminado'
        });
    });
}); */

module.exports = app;