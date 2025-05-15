const {
    DoughnutChartschema,
} = require('../schemas/pieCharts/DoughnutChartSchema')
const createPieChart = async (req, res) => {
    try {
        const baseChart = req.body
        const { type = false } = baseChart
        if (!type) {
            throw new Error('Type is required')
        }
        const validChart = DoughnutChartschema.safeParse(baseChart)

        if (!validChart.success) {
            return res.status(400).json(validChart.error.errors)
        }

        return res.status(201).json({ validChart })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

module.exports = {
    createPieChart,
}
