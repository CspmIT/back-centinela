require('dotenv').config() // Para cargar las variables de entorno desde un archivo .env

module.exports = {
	masagua: {
		username: 'desarrollo',
		password: process.env.DB_PASS,
		database: 'masagua_desarrollo',
		host: process.env.DB_HOST,
		port: process.env.DB_PORT || 3306,
		dialect: 'mysql',
	},
}
