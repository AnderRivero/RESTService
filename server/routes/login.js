const { OAuth2Client } = require('google-auth-library');
const Usuario = require('../models/usuario');
const jwt = require('jsonwebtoken');
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();

const client = new OAuth2Client(process.env.CLIENT_ID);


app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            })
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            })
        }
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.EXP_TOKEN })


        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        })
    })
});
// Configuraciones de google


async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

}


app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token).catch(e => {
        return res.status(403).json({
            ok: false,
            err: e
        })
    });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (usuarioDB) {

            if (usuarioDB === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe usar su autentificacion normal'
                    }
                });
            } else {
                //el usuario si se registró por google
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.EXP_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })
            }
        } else {
            //usuario que no existe en la base de datos
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';


            usuario.save((err, usuarioDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.EXP_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })

            });
        }


    });
});



module.exports = app;