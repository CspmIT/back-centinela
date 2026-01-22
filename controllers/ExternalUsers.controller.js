const {
    getWaterAverageTax,
    graf_dif_men_osmosis
} = require('../services/ExternalUsersService')

const waterAverageTax = async (req, res) => {
    try {
        const { influx_name, name_coop } = req.user
        const db = req.db
        const user = { influx_name, db, name_coop }
       
        const data = await getWaterAverageTax(user)
        return res.status(200).json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
}

const getGrafDifMenOsmosis = async (req, res) => {
    try {
        const { influx_name, name_coop } = req.user
        const db = req.db
        const user = { influx_name, db, name_coop }
       
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