require('dotenv').config() // Para cargar las variables de entorno desde un archivo .env

const telegramConf = {
	masagua_desarrollo: {
		masagua: {
			token: '7674157293:AAFoJbSWzgYPm5ARbUm_qMMqY1uREm1hWxU',
			chatIdReconecta: '-1002497012158',
		},
	},
}

module.exports = { telegramConf }
