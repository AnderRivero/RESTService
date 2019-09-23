// Port
process.env.PORT = process.env.PORT || 3000;

//Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//Base de datos
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb+srv://cafe-user:Undertaker77@cafe-ykqjg.mongodb.net/test?retryWrites=true&w=majority';
}

console.log('AQUI AMIGO', process.env.NODE_ENV);
console.log('AQUI AMIGO', urlDB);
process.env.URLDB = urlDB;