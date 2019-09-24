const jwt = require('jsonwebtoken');

//Verificar Token
let verificaToken = (req, res, next) => {

    let token = req.get('token');
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
};


//Verificar AdminRole
let verificaAdminRole = (req, res, next) => {

    let role = req.usuario.role;
console.log('Estoy en verificaAdminRole',role);
    if (role !== 'ADMIN_ROLE') {
        console.log('retornando error');
        return  res.json({
            ok: false,
            err : {
                message : 'El usuario no es administrador'
            }
        });
    } else {
        console.log('Next');
        next();        
    }

};

module.exports = {
    verificaToken,
    verificaAdminRole
}