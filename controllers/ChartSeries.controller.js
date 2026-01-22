const { object } = require('zod')
const { LineChartSchema } = require('../schemas/chartsSeries/LineChart.Schema')
const { ChartService } = require('../services/ChartService')

const validationsTypes = {
    LineChart: LineChartSchema,
    // DoughnutChart: DoughnutChartSchema,
    // BarDataSet: BarDataSetSchema,
}

const generateSeriesChart = async (validatedChart) => {
    const chart = {
        name: validatedChart.title,
        type: validatedChart.type,
        status: 1,
        order: validatedChart.order
    }

    const configs = Object.keys(validatedChart.xAxisConfig)
    const chartConfig = configs.map((config) => ({
        key: config,
        value: validatedChart.xAxisConfig[config],
        type: typeof validatedChart.xAxisConfig[config],
    }))
    chartConfig.push({
        key: 'title',
        value: validatedChart.title,
        type: 'string',
    })

    const chartSeriesData = validatedChart.yData
    
    return {
        chart,
        chartConfig,
        chartSeriesData,
    }
}

const addSeriesChart = async (req, res) => {
    try {
        const baseChartSerie = req.body
        const validChart = LineChartSchema.safeParse(baseChartSerie)

        if (!validChart.success) {
            return res.status(400).json(validChart.error.errors)
        }
        const { chart, chartConfig, chartSeriesData } =
            await generateSeriesChart(validChart.data)

        const savedChart = await ChartService.createSeriesChart(
            chart,
            chartConfig,
            chartSeriesData,
            req.db
        )
        res.status(200).json(savedChart)
    } catch (error) {
        return res.status(400).json(error.message)
    }
}

const updateSeriesChart = async (req, res) => {
    try {
        const { id } = req.params
        const baseChartSerie = req.body
        const validChart = LineChartSchema.safeParse(baseChartSerie)

        if (!validChart.success) {
            return res.status(400).json(validChart.error.errors)
        }
        const { chart, chartConfig, chartSeriesData } =
            await generateSeriesChart(validChart.data)

        console.log(chart)
        console.log(chartConfig)
        console.log(chartSeriesData)
        const savedChart = await ChartService.editSeriesChart(
            id,
            chart,
            chartConfig,
            chartSeriesData,
            req.db
        )
        res.status(200).json(savedChart)
    } catch (error) {
        return res.status(400).json(error.message)
    }
}

module.exports = {
    addSeriesChart,
    updateSeriesChart,
}
