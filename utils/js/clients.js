// clients.js
const listClients = [
    // 'capyclo', 
    // 'cespal', 
    // 'coopmorteros', 
    // 'san_genaro',
    // 'adeco',
    // 'lactear',
    'desarrollo'
  ]
  
  // Mapeo hardcodeado de cada cliente a su influx_name correspondiente
  const influxByClient = {
    // capyclo: 'Sensors_ExternosPublic',
    // cespal: 'Sensors_ExternosPublic',
    // coopmorteros: 'Sensors_Morteros',
    // san_genaro: 'Sensors_ExternosPublic',
    // adeco: 'Sensors_Morteros',
    // lactear: 'Sensors_Morteros',
    desarrollo: 'Sensors_ExternosPublic',
  }
  
  module.exports = {
    listClients,
    influxByClient,
  }
  