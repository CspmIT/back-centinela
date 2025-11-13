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
    const { influx_name = false } = user
    if (!influx_name) throw new Error('Tenes que estar logeado para hacer esta consulta')
        
    // Si la variable es calculada
    if (influxVar?.calc) {
        // Consultar cada subvariable definida en varsInflux
        const results = await Promise.all(
            Object.entries(influxVar.varsInflux).map(async ([varName, varConfig]) => {
                const query = await generateQuery(varConfig)
                const data = await ConsultaInflux(query, influx_name)
                // Buscar el valor según calc_field
                const valueRow = Array.isArray(data)
                    ? data.find((row) => row._field === varConfig.calc_field)
                    : null

                return { varName, value: valueRow ? valueRow._value : 0 }
            })
        )

        // Crear un diccionario { varName: value }
        const valuesMap = results.reduce((acc, { varName, value }) => {
            acc[varName] = value
            return acc
        }, {})
        // Reemplazar las variables en la ecuación
        let evaluableExpression = influxVar.equation
            .map((part) => {
                const match = part.match(/^{{(.+?)}}$/)
                return match ? valuesMap[match[1]] ?? 0 : part
            })
            .join(' ')

        // Evitar números pegados sin operador
        evaluableExpression = evaluableExpression.replace(/(\d)\s+(\d)/g, '$1$2')
        // Evaluar la ecuación con seguridad
        try {
            const { Parser } = require('expr-eval')
            const parser = new Parser()
            const value = parser.evaluate(evaluableExpression)
            return { value }
        } catch (err) {
            console.error('Expresion invalida en variable calculada:', err.message)
            return { value: null }
        }
    } 
    else {
        // Variable NO calculada → flujo original
        const query = await generateQuery(Object.values(influxVar.varsInflux).shift())
        const dataInflux = await ConsultaInflux(query, influx_name)
        const formattedData = await fomratInfluxData(dataInflux)
        return formattedData
    }
}

// SE USA PARA OBTENER MULTIPLES VALORES EN UNA SOLA CONSULTA (PARA GRAFICOS LINEALES)
async function getMultipleHistoricalInfluxData(queryObject, user) {
    if (!user?.influx_name) throw new Error('Tenes que estar logeado para hacer esta consulta')

    const influxName = user.influx_name

    const topics = [...new Set(queryObject.map(q => q.topic))]
    const fields = [...new Set(queryObject.map(q => q.field))]

    const batchQuery = `
        |> range(start: ${queryObject[0].dateRange}, stop: now())
        |> filter(fn: (r) => ${topics.map(t => `r.topic == "${t}"`).join(' or ')})
        |> filter(fn: (r) => ${fields.map(f => `r._field == "${f}"`).join(' or ')})
        |> aggregateWindow(every: ${queryObject[0].samplingPeriod}, fn: ${queryObject[0].typePeriod}, createEmpty: true)
        |> yield(name: "${queryObject[0].typePeriod}")
    `

    const rawData = await ConsultaInflux(batchQuery, influxName)

    const grouped = {}
    for (const row of rawData) {
        const key = `${row.topic}::${row._field}`
        if (!grouped[key]) grouped[key] = []
        grouped[key].push({
            time: row._time,
            value: row._value,
            topic: row.topic,
            field: row._field,
        })
    }

    const { Parser } = require('expr-eval')
    const parser = new Parser()
    const formattedData = {}

    for (const influxVar of queryObject) {
        const key = `${influxVar.topic}::${influxVar.field}`
        const serie = grouped[key] || []

        // Si no es calculada → devolver como viene
        if (!influxVar.calc) {
            formattedData[influxVar.varId] = serie.map(d => ({
                field: d.field,
                value: d.value,
                time: d.time,
                topic: d.topic,
            }))
            continue
        }
        // Si es calculada → aplicamos la ecuación
        const calcSeries = serie.map(point => {
            let expression = influxVar.equation
                .map(part => {
                    const match = part.match(/^{{(.+?)}}$/)
                    return match ? point.value ?? 0 : part
                })
                .join(' ')
                .replace(/(\d)\s+(\d)/g, '$1$2')

            let value
            try {
                value = parser.evaluate(expression)
            } catch {
                value = null
            }

            return {
                field: influxVar.field,
                value,
                time: new Date(point.time).toLocaleString('es-AR', { hour12: false }),
                topic: point.topic,
            }
        })

        formattedData[influxVar.varId] = calcSeries
    }

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

//funcion para consultar multiples variables y obtener un objeto con el valor de cada una
async function getMultipleSimpleValues(req, res) {
    try {
        const { user = false } = req
        if (!user?.influx_name) throw new Error('Tenes que estar logeado')

        const dataInflux = req.body
        const results = {}

        for (const item of dataInflux) {
            const influxVar = item.dataInflux
            const valueInflux = await getSimpleInfluxData(influxVar, user)

            let value;

            // variable calculada
            if (valueInflux && typeof valueInflux.value !== 'undefined') {
                value = valueInflux.value
            }
            // Caso 2: variable simple
            else if (valueInflux && typeof valueInflux === 'object') {
                // Tomamos el primer valor del objeto interno
                const first = Object.values(valueInflux)[0]
                value = first?.value ?? 0
            }
            else {
                value = 0
            }

            results[influxVar.id] = value
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
    getSimpleInfluxData,
    getHistorcalInfluxData,
    SeriesDataInflux,
    getMultipleSimpleValues,
}
