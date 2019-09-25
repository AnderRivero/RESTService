// Port
process.env.PORT = process.env.PORT || 3000;

//Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//Base de datos
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

console.log('AQUI AMIGO', process.env.NODE_ENV);
console.log('AQUI AMIGO', urlDB);
process.env.URLDB = urlDB;

//Vencimiento del token

process.env.EXP_TOKEN = 60 * 60 * 24 * 30;
//Seed de autenticación

process.env.SEED = process.env.SEED || 'secret';

//google client
 process.env.CLIENT_ID = process.env.CLIENT_ID || '23374131045-t73br17r33acn7c5msfm7dmn933sfpv5.apps.googleusercontent.com';