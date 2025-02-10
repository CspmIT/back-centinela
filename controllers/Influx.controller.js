const { consultaprueba, ConsultaInflux } = require('../services/InfluxServices')
const {
    fomratInfluxData,
    fomratInfluxDataArray,
    formatInfluxSeriesArray,
} = require('../utils/js/formatterInfluxData')
const {
    generateQuery,
    generateQueryHistorical,
} = require('../utils/js/queryBuilder')

async function InfluxConection(req, res) {
    try {
        const influx = await consultaprueba()
        return res.status(200).json(influx)
    } catch (error) {
        if (error.errors) {
            res.status(500).json(error.errors)
        } else {
            res.status(400).json(error.message)
        }
    }
}
async function getSimpleInfluxData(influxVar, user) {
    if (influxVar?.type) {
        influxVar = influxVar.varsInflux
    }
    const query = await generateQuery(Object.values(influxVar).shift())
    const { influx_name = false } = user
    if (!influx_name) {
        throw new Error('Tenes que estar logeado para hacer esta consulta')
    }
    const dataInflux = await ConsultaInflux(query, influx_name)
    const formattedData = await fomratInfluxData(dataInflux)
    return formattedData
}
async function getMultipleHistoricalInfluxData(queryObject, user) {
    if (!user?.influx_name) {
        throw new Error('Tenes que estar logeado para hacer esta consulta')
    }
    const queries = queryObject.map((query) => {
        return {
            varId: query.varId,
            name: query?.name,
            unit: query?.unit,
            type: query.type,
            query: `|> range(start: ${query.dateRange}, stop: now())
            |> filter(fn: (r) => r.topic == "${query.topic}")
            |> filter(fn: (r) => r._field == "${query.field}")
            |> aggregateWindow(every: ${query.samplingPeriod}, fn: ${query.typePeriod}, createEmpty: true)
            |> yield(name: "${query.typePeriod}")`,
        }
    })

    // Ejecutar todas las consultas en una sola petición
    const dataInflux = await ConsultaInfluxMultiple(queries, user.influx_name)

    // Formatear los datos en un objeto { varId: datos }
    const formattedData = queries.reduce((acc, query) => {
        acc[query.varId] = formatInfluxSeriesArray(
            dataInflux[query.varId] || []
        )
        return acc
    }, {})

    return formattedData
}

async function ConsultaInfluxMultiple(queries, influx_name) {
    try {
        const results = await Promise.all(
            queries.map(async (queryObj) => {
                const result = await ConsultaInflux(queryObj.query, influx_name)
                return { varId: queryObj.varId, data: result }
            })
        )

        // Convertimos el array en un objeto { varId: data }
        return results.reduce((acc, { varId, data }) => {
            acc[varId] = data
            return acc
        }, {})
    } catch (error) {
        console.error('Error en ConsultaInfluxMultiple:', error)
        throw new Error('Error consultando InfluxDB')
    }
}

async function SeriesDataInflux(req, res) {
    try {
        const influxVars = req.body
        const { user = false } = req
        if (!user) {
            throw new Error('Tenes que estar logeado para hacer esta consulta')
        }
        const data = await getMultipleHistoricalInfluxData(influxVars, user)
        if (data.length > 0) {
            throw new Error('No se obtuvieron datos')
        }
        return res.status(200).json(data)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

async function getHistorcalInfluxData(influxVar, user) {
    const query = await generateQueryHistorical(influxVar)
    const { influx_name = false } = user
    if (!influx_name) {
        throw new Error('Tenes que estar logeado para hacer esta consulta')
    }

    const dataInflux = await ConsultaInflux(query, influx_name)
    const formattedData = fomratInfluxDataArray(dataInflux)
    return formattedData
}

async function InfluxChart(req, res) {
    try {
        const influxVar = req.body
        const { user = false } = req
        if (!user) {
            throw new Error('Tenes que estar logeado para hacer esta consulta')
        }

        if (influxVar?.type === 'history') {
            const historyData = await getHistorcalInfluxData(influxVar, user)
            return res.status(200).json(historyData)
        }

        const simpleData = await getSimpleInfluxData(influxVar, user)

        return res.status(200).json(simpleData)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}
module.exports = {
    InfluxConection,
    InfluxChart,
    SeriesDataInflux,
}
