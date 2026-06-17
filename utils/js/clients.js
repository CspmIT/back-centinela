// clients.js
const listClients = [
    'bancosangre', 
    'television', 
    'telecomunicaciones', 
  ]
  
  // Mapeo hardcodeado de cada cliente a su influx_name correspondiente
  const influxByClient = {
    bancosangre: 'Sensors_Morteros',
    television: 'Sensors_Morteros',
    telecomunicaciones: 'Sensors_Morteros',
  }
  
  module.exports = {
    listClients,
    influxByClient,
  }
  