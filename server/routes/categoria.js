const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
const Categoria = require('../models/categoria');
const express = require('express');
const _ = require('underscore');
const app = express();

//Consultar todos los registros de categoria
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                res.status(400).json({
                    ok: false,
                    err
                });
            }
            Categoria.count((err, conteo) => {
                res.json({
                    ok: true,
                    categorias,
                    cantidad: conteo
                })
            });
        });
});

//Consultar categoria por id 
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'La categoria no existe'
                }
            });
        }
        Categoria.count((err, conteo) => {

            res.json({
                ok: true,
                categoria: categoriaDB,
                cantidad: conteo
            })
        });
    });
});

// Crear
app.post('/categoria', verificaToken, (req, res) => {

    let categoria = new Categoria({
        descripcion: req.body.descripcion,
        usuario: req.usuario._id
    });
    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }


        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

//Actualizar
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['descripcion', 'usuario']);

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: { message: 'Categoria no encontrada' }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

//Borrar una categoria 
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDelete) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDelete) {
            return res.status(400).json({
                ok: false,
                err: { message: 'Categoria no encontrada' }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDelete,
            message: 'Categoria eliminada'
        });
    });
});


module.exports = app