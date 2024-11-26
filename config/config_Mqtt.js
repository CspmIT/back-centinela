require('dotenv').config() // Para cargar las variables de entorno desde un archivo .env

module.exports = {
	masagua_desarrollo: {
		host: '200.63.120.50',
		port: '52883',
		username: 'energia',
		password: 'NojaPower2022',
		protocol: 'mqtt',
		clientId: 'MQTT_COOP',
		clean: 'true',
	},
}
