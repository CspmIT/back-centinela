const { consultaprueba, ConsultaInflux } = require('../services/InfluxServices')
const {
    fomratInfluxData,
    fomratInfluxDataArray,
} = require('../utils/js/formatterInfluxData')
const { generateQuery } = require('../utils/js/queryBuilder')
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

async function InfluxChart(req, res) {
    try {
        const influxVar = req.body
        console.log(Object.values(influxVar))
        const query = await generateQuery(Object.values(influxVar).shift())

        const { user = false } = req
        if (!user) {
            throw new Error('Tenes que estar logeado para hacer esta consulta')
        }
        const { influx_name = false } = user
        if (!influx_name) {
            throw new Error('Tenes que estar logeado para hacer esta consulta')
        }

        const dataInflux = await ConsultaInflux(query, influx_name)
        const formattedData = await fomratInfluxData(dataInflux)
        return res.status(200).json(formattedData)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}
module.exports = {
    InfluxConection,
    InfluxChart,
}
