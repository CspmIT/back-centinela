const {
    PieChart,
    PieChartRepository,
} = require('../repositories/PieChartRepository')
const {
    DoughnutChartschema,
} = require('../schemas/pieCharts/DoughnutChartSchema')
const { ChartService } = require('../services/ChartService')

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

        const pieChart = new PieChart(validChart.data)
        const chartRepo = new PieChartRepository(pieChart)

        const chart = chartRepo.getChart()
        chart.status = 1
        const chartData = chartRepo.getData()

        const saveChartData = await ChartService.createPieChart(
            chart,
            chartData,
            req.db
        )

        return res.status(201).json({
            saveChartData,
        })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

module.exports = {
    createPieChart,
}
