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
const { mapBitsToBombs } = require('../utils/js/binaryDecompressor');
const { db } = require('../models')

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
        const simpleConfig = Object.values(influxVar.varsInflux).shift();
        const query = await generateQuery(simpleConfig);
        const dataInflux = await ConsultaInflux(query, influx_name);

        if (!Array.isArray(dataInflux) || dataInflux.length === 0) {
            return { value: null };
        }

        const row = dataInflux[0];
        // Si es binario comprimido, descomprimimos
        if (influxVar.binary_compressed === true) {
            const bitRows = await db.VarsBinaryCompressedData.findAll({
                where: { id_var: influxVar.id }
            });

            const decoded = mapBitsToBombs(row?._value ?? 0, bitRows, 8);
            return { bits: decoded };
        }

        // Si no es comprimida → flujo tradicional
        const formattedData = await fomratInfluxData(dataInflux);
        return formattedData;
    }
}

// SE USA PARA OBTENER MULTIPLES VALORES EN UNA SOLA CONSULTA (PARA GRAFICOS LINEALES)
async function getMultipleHistoricalInfluxData(queryObject, user) {
    if (!user?.influx_name)
        throw new Error('Tenes que estar logeado para hacer esta consulta')

    const influxName = user.influx_name

    const topics = [...new Set(queryObject.map(q => q.topic))]
    const fields = [...new Set(queryObject.map(q => q.field))]

    // 🔹 Armar batchQuery (una sola llamada a Influx)
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
            _time: row._time,
            _value: row._value,
            topic: row.topic,
            _field: row._field,
        })
    }

    const { Parser } = require('expr-eval')
    const parser = new Parser()
    const formattedData = {}

    for (const influxVar of queryObject) {
        const key = `${influxVar.topic}::${influxVar.field}`
        const serie = grouped[key] || []

        // Si no es calculada
        if (!influxVar.calc) {
            formattedData[influxVar.varId] = formatInfluxSeriesArray(serie)
            continue
        }

        // Si es calculada
        const calcSerie = serie.map(point => {
            let expression = influxVar.equation
                .map(part => {
                    const match = part.match(/^{{(.+?)}}$/)
                    return match ? point._value ?? 0 : part
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
                _field: influxVar.field,
                _value: value,
                _time: point._time,
                topic: point.topic,
            }
        })

        formattedData[influxVar.varId] = formatInfluxSeriesArray(calcSerie)
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
            let finalValue = 0;

            // SI ES BINARIO COMPRIMIDO Y VIENEN BITS
            if (valueInflux?.bits) {
                finalValue = valueInflux.bits;
            }
            // SI VIENE VALUE CALCULADA
            else if (typeof valueInflux?.value !== 'undefined') {
                finalValue = valueInflux.value;
            }
            // SI VIENE OBJETO SIMPLE INTERNO { id: { value:X } }
            else if (valueInflux && typeof valueInflux === 'object' && Object.keys(valueInflux).length) {
                const first = Object.values(valueInflux)[0];
                finalValue = first?.value ?? 0;
            }

            results[influxVar.id] = finalValue;
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
