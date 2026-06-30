require('dotenv').config()

/**
 * Conexión MQTT propia del módulo Smart Outlets (zapatillas inteligentes).
 *
 * Es un broker/usuario DISTINTO al de Reconectadores (que vive en la tabla
 * Parameters con el usuario "energia" en el puerto 52883). Las zapatillas
 * usan el mismo servidor pero su propio puerto y credenciales, tal como el
 * módulo original en PHP.
 *
 * Los valores se pueden sobreescribir por variables de entorno; si no están,
 * se usan los del módulo original.
 */
module.exports = {
    host: process.env.OUTLET_MQTT_HOST || '200.63.120.50',
    port: parseInt(process.env.OUTLET_MQTT_PORT || '11883', 10),
    username: process.env.OUTLET_MQTT_USER || 'iotuser',
    password: process.env.OUTLET_MQTT_PASS || 'Cspmiot',
    protocol: 'mqtt',
    clean: true,
    // clientId propio para no colisionar con la conexión de Reconectadores
    // (que usa "MQTT_COOP"); se deja único por conexión.
    clientId: `MQTT_COOP_outlet_${process.pid}`,
}
