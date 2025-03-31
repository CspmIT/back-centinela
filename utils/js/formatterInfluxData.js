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
const fomratInfluxDataArray = (influxData) => {
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
const formatter = new Intl.DateTimeFormat('es-AR', {
    year: '2-digit',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
})

const formatInfluxSeriesArray = (influxSeries) => {
    if (influxSeries.length === 0) {
        return []
    }
    const series = new Array(influxSeries.length - 1)
    for (let i = 0; i < influxSeries.length - 1; i++) {
        const element = influxSeries[i]
        series[i] = {
            field: element._field,
            value: element._value,
            time: formatter.format(new Date(element._time)), // Reemplazo de format()
            topic: element.topic,
        }
    }

    return series
}

module.exports = {
    fomratInfluxData,
    fomratInfluxDataArray,
    formatInfluxSeriesArray,
}
