const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');


//default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', (req, res) => {
    let tipo = req.params.tipo;
    let id = req.params.id;



    if (!req.files) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado ningún archivo'
                }
            });
    }

    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'Las tipos permitidos son: ' + tiposValidos.join(', ')
                }

            });
    }


    let archivo = req.files.archivo;

    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    let nombreArchivo = archivo.name.split('.');
    let extension = nombreArchivo[nombreArchivo.length - 1];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'Las extensiones permitidas son: ' + extensionesValidas.join(', ')
                }

            });
    }

    //CambiarNombre al archivo
    let nuevoNombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`

    archivo.mv(`uploads/${tipo}/${nuevoNombreArchivo}`, (err) => {

        if (err) {
            return res.status(500)
                .json({
                    ok: false,
                    err
                });

        } else {

            if (tipo === 'productos') {

                imagenProducto(id, res, nuevoNombreArchivo);

            } else {

                imagenUsuario(id, res, nuevoNombreArchivo);
            }

        }
    });
});



function imagenUsuario(id, res, nuevoNombreArchivo) {

    Usuario.findById(id, (err, usuarioBD) => {
        if (err) {
            borrarArchivo(nuevoNombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioBD) {

            borrarArchivo(nuevoNombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        borrarArchivo(usuarioBD.img, 'usuarios');

        usuarioBD.img = nuevoNombreArchivo;

        usuarioBD.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nuevoNombreArchivo
            });
        });


    })

}


function imagenProducto(id, res, nuevoNombreArchivo) {

    Producto.findById(id, (err, productoBD) => {
        if (err) {
            borrarArchivo(nuevoNombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoBD) {

            borrarArchivo(nuevoNombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        borrarArchivo(productoBD.img, 'productos');

        productoBD.img = nuevoNombreArchivo;

        productoBD.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nuevoNombreArchivo
            });
        });
    })

}

function borrarArchivo(nombreImagen, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;