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
    console.log(influxVar)
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

    const topics = [...new Set(queryObject.map((q) => q.topic))] // Evita duplicados
    const fields = [...new Set(queryObject.map((q) => q.field))]

    const batchQuery = `
        |> range(start: ${queryObject[0].dateRange}, stop: now())
        |> filter(fn: (r) => ${topics
            .map((t) => `r.topic == "${t}"`)
            .join(' or ')})
        |> filter(fn: (r) => ${fields
            .map((f) => `r._field == "${f}"`)
            .join(' or ')})
        |> aggregateWindow(every: ${queryObject[0].samplingPeriod}, fn: ${
        queryObject[0].typePeriod
    }, createEmpty: true)
        |> yield(name: "${queryObject[0].typePeriod}")`

    const rawData = await ConsultaInflux(batchQuery, user.influx_name)
    // Formateamos los datos agrupándolos por `varId`
    const formattedData = queryObject.reduce((acc, query) => {
        acc[query.varId] = formatInfluxSeriesArray(
            rawData.filter(
                (d) => d.topic === query.topic && d._field === query.field
            )
        )
        return acc
    }, {})

    return formattedData
}

async function SeriesDataInflux(req, res) {
    try {
        const influxVars = req.body
        const { user = false } = req
        if (!user) {
            throw new Error('Tenes que estar logeado para hacer esta consulta')
        }
        const data = await getMultipleHistoricalInfluxData(influxVars, user)

        if (data.length === 0) {
            throw new Error('No se obtuvieron datos')
        }
        return res.status(200).json(data)
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message, stack: error.stack })
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

//funcion para consultar multiples variables y obtener un dato de influx
async function getMultipleSimpleValues(req, res) {
    try {
        const { user = false } = req
        if (!user?.influx_name) throw new Error('Tenes que estar logeado')

        const influxVars = req.body
        const results = {}

        for (const item of influxVars) {
            const influxVar = item.varsInflux
            const query = await generateQuery(influxVar) // genera `|> last()`
            const data = await ConsultaInflux(query, user.influx_name)

            // Buscar el primer valor que coincida con el campo
            const valueRow = Array.isArray(data)
                ? data.find((row) => row._field === influxVar.calc_field)
                : null

            results[item.id] = valueRow ? valueRow._value : null
        }

        return res.status(200).json(results)
    } catch (error) {
        console.error('Error en getMultipleSimpleValues:', error)
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    InfluxConection,
    InfluxChart,
    SeriesDataInflux,
    getMultipleSimpleValues,
}
