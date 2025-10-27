const {
    getWaterAverageTax,
    graf_dif_men_osmosis
} = require('../services/ExternalUsersService')
const { db } = require('../models')

const waterAverageTax = async (req, res) => {
    try {
        const { influx_name } = req.user
        const user = { influx_name, db }
       
        const data = await getWaterAverageTax(user)
        return res.status(200).json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
}

const getGrafDifMenOsmosis = async (req, res) => {
    try {
        const { influx_name } = req.user
        const user = { influx_name, db }
       
        const data = await graf_dif_men_osmosis(user)
        return res.status(200).json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
}

module.exports = { 
    waterAverageTax,
    getGrafDifMenOsmosis
}