const { z } = require('zod')
const BaseBomb = require('../schemas/bombs/Bombs.Schema')
const { ChartService } = require('../services/ChartService')

const create = async (req, res) => {
    try {
        const baseBomb = req.body
        baseBomb.type = 'PumpControl'

        const validBomb = BaseBomb.parse(baseBomb)

        const chart = {
            name: validBomb.title,
            type: validBomb.type,
            status: 1,
        }

        const chartConfig = [
            {
                chart_id: null,
                key: 'title',
                value: validBomb.title,
                type: 'string',
            },
            { chart_id: null, key: 'edit', value: false, type: 'boolean' },
        ]

        const bombsData = [...validBomb.pumps, ...validBomb.states]

        const newChart = await ChartService.createBombs(
            chart,
            chartConfig,
            bombsData
        )
        //Retorno los datos
        res.status(201).json(newChart)
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json(error.errors)
        } else {
            res.status(500).json(error.message)
        }
    }
}

module.exports = create
