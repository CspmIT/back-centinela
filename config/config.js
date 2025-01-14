require('dotenv').config() // Para cargar las variables de entorno desde un archivo .env

module.exports = {
    masagua: {
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
    },
}
