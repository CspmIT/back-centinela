const {
    CirclePorcentajeSchema,
} = require('../schemas/charts/CirclePorcentaje.Schema')
const { LiquidFillSchema } = require('../schemas/charts/LiquidFill.Schema')
const { ChartService } = require('../services/ChartService')
const ChartBuilder = require('../utils/js/chartBuilder')

const findCharts = async (req, res) => {
    try {
        const charts = await ChartService.getCharts()
        res.status(200).json(charts)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const findChartById = async (req, res) => {
    try {
        const { id } = req.params
        const chart = await ChartService.getChartById(id)
        if (!chart) {
            throw new Error('No se encontro ningun grafico')
        }
        res.status(200).json(chart)
    } catch (error) {
        res.status(200).json({ message: error.message })
    }
}

const findAllCharts = async (req, res) => {
    try {
        const charts = await ChartService.getAllCharts()
        res.status(200).json(charts)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const createChart = async (req, res) => {
    try {
        const baseChart = req.body
        const { type = false } = baseChart
        if (!type) {
            throw new Error('Type is required')
        }
        const validChart = validationsTypes[type].safeParse(baseChart)

        if (!validChart.success) {
            throw new Error(validChart.error.errors[0].message)
        }
        if (validChart.data.porcentage === true) {
            //No se guarda unidad
            autorizedDataKeys[type] = autorizedDataKeys[type].filter(
                (key) => key !== 'unidad'
            )
        }

        const chartBuilder = new ChartBuilder(
            autorizedConfigKeys[type],
            autorizedDataKeys[type]
        )

        const { chart, config, data } = chartBuilder.build(baseChart)
        const newChart = await ChartService.createChart(chart, config, data)

        res.status(201).json({ newChart })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const editChart = async (req, res) => {
    try {
        const chartId = req.params.id
        const updatedChart = req.body // Nuevos datos del gráfico
        const { type = false } = updatedChart

        if (!type) {
            throw new Error('El tipo de gráfico (type) es obligatorio.')
        }

        // Validar el tipo de gráfico y la estructura de los datos
        const validChart = validationsTypes[type].safeParse(updatedChart)
        if (!validChart.success) {
            throw new Error(validChart.error.errors[0].message)
        }

        // Verificar si es un porcentaje para ajustar las claves de datos permitidas
        if (validChart.data.porcentage === true) {
            autorizedDataKeys[type] = autorizedDataKeys[type].filter(
                (key) => key !== 'unidad'
            )
        }

        // Construir las estructuras actualizadas de configuración y datos
        const chartBuilder = new ChartBuilder(
            autorizedConfigKeys[type],
            autorizedDataKeys[type]
        )
        const { chart, config, data } = chartBuilder.build(updatedChart)

        // Llamar al servicio para actualizar los datos en la base
        const updatedChartData = await ChartService.updateChart(
            chartId,
            chart,
            config,
            data
        )

        res.status(200).json({ updatedChart: updatedChartData })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const autorizedConfigKeys = {
    LiquidFillPorcentaje: ['border', 'color', 'porcentage', 'shape', 'title'],
    CirclePorcentaje: ['color', 'title'],
}
const autorizedDataKeys = {
    LiquidFillPorcentaje: ['maxValue', 'value', 'unidad'],
    CirclePorcentaje: ['maxValue', 'value'],
}

const validationsTypes = {
    LiquidFillPorcentaje: LiquidFillSchema,
    CirclePorcentaje: CirclePorcentajeSchema,
    // DoughnutChart: DoughnutChartSchema,
    // BarDataSet: BarDataSetSchema,
    // LineChart: LineChartSchema,
}

const statusChart = async (req, res) => {
    try {
        const { id, status } = req.body
        if (!id) {
            throw new Error('Debe pasar el id del grafico')
        }
        // Actualizo el estado al opuesto
        const newStatus = status ? 0 : 1

        const chartUpdated = await ChartService.changeStatus(id, newStatus)

        console.log(chartUpdated)
        res.status(200).json(chartUpdated)
    } catch (error) {
        res.status(400).json(error.message)
    }
}

module.exports = {
    createChart,
    findCharts,
    findAllCharts,
    statusChart,
    findChartById,
    editChart,
}
