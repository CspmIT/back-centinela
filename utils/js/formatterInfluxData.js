/**
 * Procesa los datos obtenidos desde InfluxDB para devolver un objeto simplificado.
 *
 * @param {Array} influxData - Datos crudos obtenidos desde InfluxDB.
 * @returns {Object} Un objeto con campos, valores y tiempos.
 * @author [Jose Romani] <jose.romani@hotmail.com>
 */
const fomratInfluxData = async (influxData) => {
    const dataMap = new Map()

    influxData.forEach((element) => {
        dataMap.set(element._field, {
            field: element._field,
            value: element._value,
            time: element._time,
            topic: element.topic,
        })
    })

    return Object.fromEntries(dataMap)
}

/**
 * Procesa datos de InfluxDB en formato de array agrupados por campos.
 *
 * @param {Array} influxData - Datos crudos obtenidos desde InfluxDB.
 * @returns {Object} Un objeto con arrays de datos por cada campo.
 * @author [Jose Romani] <jose.romani@hotmail.com>
 */
const fomratInfluxDataArray = async (influxData) => {
    const dataReturn = new Map()

    influxData.forEach((element) => {
        if (!dataReturn.has(element._field)) {
            dataReturn.set(element._field, [])
        }
        dataReturn.get(element._field).push({
            field: element._field,
            value: element._value,
            time: element._time,
            topic: element.topic,
        })
    })

    return Object.fromEntries(dataReturn)
}

module.exports = {
    fomratInfluxData,
    fomratInfluxDataArray,
}
