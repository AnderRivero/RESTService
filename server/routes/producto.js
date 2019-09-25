const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
const Producto = require('../models/producto');
const express = require('express');
const _ = require('underscore');
const app = express();


//Consultar todos los registros de producto
app.get('/producto', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({ disponible: true })
        .sort('nombre')
        .skip(desde)
        .limit(5)
        .populate('categoria')
        .populate('usuario', 'nombre email')
        .exec((err, productos) => {
            if (err) {
                res.status(400).json({
                    ok: false,
                    err
                });
            }
            Producto.count((err, conteo) => {
                res.json({
                    ok: true,
                    productos,
                    cantidad: conteo
                })
            });
        });
});

//Consultar producto por id 
app.get('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Producto.findById(id)
        .populate('categoria')
        .populate('usuario', 'nombre email')
        .exec((err, productoDB) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El producto no existe'
                    }
                });
            }
            Producto.count((err, conteo) => {
                res.json({
                    ok: true,
                    productoDB,
                    cantidad: conteo
                })
            });
        });
});


//Buscar producto
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos,
            })
        });
});


// Crear un producto
app.post('/producto', verificaToken, (req, res) => {

    let producto = new Producto({
        nombre: req.body.nombre,
        precioUni: req.body.precioUni,
        descripcion: req.body.descripcion,
        disponible: req.body.disponible,
        categoria: req.body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

//Actualizar
app.put('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'categoria']);

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: { message: 'Categoria no encontrada' }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

//Borrar un producto 
app.delete('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Producto.findByIdAndUpdate(id, { disponible: false }, (err, productoDelete) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDelete) {
            return res.status(400).json({
                ok: false,
                err: { message: 'Producto no encontrada' }
            });
        }

        res.json({
            ok: true,
            producto: productoDelete,
            message: 'Producto deshabilitado'
        });
    });
});


module.exports = app