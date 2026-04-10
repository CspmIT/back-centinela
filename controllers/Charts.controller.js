const { BooleanChartSchema } = require('../schemas/charts/BooleanChart.Schema')
const {
    CirclePorcentajeSchema,
} = require('../schemas/charts/CirclePorcentaje.Schema')
const GaugeSpeedSchema = require('../schemas/charts/GaugeSpeed.Schema')
const { MultipleBooleanChartSchema } = require('../schemas/charts/MultipleBooleanChart.Schema')
const { BoardChartSchema } = require('../schemas/charts/BoardChart.Schema')
const { LiquidFillSchema } = require('../schemas/charts/LiquidFill.Schema')
const { ChartService } = require('../services/ChartService')
const ChartBuilder = require('../utils/js/chartBuilder')

const findIndicatorCharts = async (req, res) => {
    try {
        const charts = await ChartService.getSimpleCharts(req.db)
        res.status(200).json(charts)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const findDashboardCharts = async (req, res) => {
    try {
        const charts = await ChartService.getDashboardCharts(req.db)
        res.status(200).json(charts)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const findChartById = async (req, res) => {
    try {
        const { id } = req.params
        const db = req.db
        const chart = await ChartService.getChartById(id, db)
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
        const charts = await ChartService.getAllCharts(req.db)
        res.status(200).json(charts)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const findChartByUser = async (req, res) => {
    try {
        const { userId } = req.params
        const charts = await ChartService.getChartsByUser(userId, req.db)
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
        const { autorizedConfigKeys, autorizedDataKeys } = getKeys(type)
        const validChart = validationsTypes[type].safeParse(baseChart)
        if (!validChart.success) {
            console.log(validChart.error.issues)
            throw new Error(validChart.error.errors[0].message)
        }
        let filteredKeys = autorizedDataKeys
        if (validChart.data.porcentage === true) {
            //No se guarda unidad
            filteredKeys = autorizedDataKeys.filter((key) => key !== 'unidad')
        }
        const chartBuilder = new ChartBuilder(autorizedConfigKeys, filteredKeys)

        const { chart, config, data } = chartBuilder.build(baseChart)
        const newChart = await ChartService.createChart(chart, config, data, req.db)

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

        const { autorizedConfigKeys, autorizedDataKeys } = getKeys(type)
        updatedChart.order = parseInt(updatedChart.order)
        // Validar el tipo de gráfico y la estructura de los datos
        const validChart = validationsTypes[type].safeParse(updatedChart)
        if (!validChart.success) {
            throw new Error(validChart.error.errors[0].message)
        }

        let filteredKeys = autorizedDataKeys
        // Verificar si es un porcentaje para ajustar las claves de datos permitidas
        if (validChart.data.porcentage === true) {
            filteredKeys = autorizedDataKeys.filter((key) => key !== 'unidad')
        }

        // Construir las estructuras actualizadas de configuración y datos
        const chartBuilder = new ChartBuilder(autorizedConfigKeys, filteredKeys)
        const { chart, config, data } = chartBuilder.build(updatedChart)

        // Llamar al servicio para actualizar los datos en la base
        const updatedChartData = await ChartService.updateChart(
            chartId,
            chart,
            config,
            data,
            req.db
        )

        res.status(200).json({ updatedChart: updatedChartData })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const findBoards = async (req, res) => {
    try {
        const boards = await ChartService.getBoards(req.db)
        res.status(200).json(boards)
    } catch (error) {   
        res.status(400).json({ message: error.message })
    }
}

const getKeys = (type) => {
    const autorizedConfigKeys = {
        LiquidFillPorcentaje: [
            'border',
            'color',
            'porcentage',
            'shape',
            'title',
        ],
        CirclePorcentaje: ['color', 'title'],
        GaugeSpeed: ['color', 'title', 'description', 'description2'],
        BooleanChart: ['title', 'textOn', 'textOff', 'colorOn', 'colorOff'],
        MultipleBooleanChart: ['title', 'textOn', 'textOff', 'colorOn', 'colorOff'],
        BoardChart: ['title'],
    }
    const autorizedDataKeys = {
        LiquidFillPorcentaje: ['maxValue', 'value', 'unidad', 'secondary', 'bottom1', 'bottom2'],
        CirclePorcentaje: ['maxValue', 'value'],
        GaugeSpeed: ['maxValue', 'value', 'unidad'],
        BooleanChart: ['value'],
        MultipleBooleanChart: ['value'],
        BoardChart: ['value'],
    }
    return {
        autorizedConfigKeys: autorizedConfigKeys[type],
        autorizedDataKeys: autorizedDataKeys[type],
    }
}

const statusChart = async (req, res) => {
    try {
        const { id, status } = req.body
        if (!id) {
            throw new Error('Debe pasar el id del grafico')
        }
        // Actualizo el estado al opuesto
        const newStatus = status ? 0 : 1

        const chartUpdated = await ChartService.changeStatus(id, newStatus, req.db)

        res.status(200).json(chartUpdated)
    } catch (error) {
        res.status(400).json(error.message)
    }
}

const getProfilesByChart = async (req, res) => {
    try {
        const { chartId } = req.params
        const assignments = await req.db.ChartProfile.findAll({
            where: { chart_id: chartId },
            attributes: ['profile_id'],
            raw: true
        })
        res.status(200).json(assignments.map(a => a.profile_id))
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const setProfilesByChart = async (req, res) => {
    const transaction = await req.db.sequelize.transaction()
    try {
        const { chartId } = req.params
        const { profileIds } = req.body 

        await req.db.ChartProfile.destroy({
            where: { chart_id: chartId },
            transaction
        })

        if (profileIds.length > 0) {
            await req.db.ChartProfile.bulkCreate(
                profileIds.map(profile_id => ({ chart_id: chartId, profile_id })),
                { transaction }
            )
        }

        await transaction.commit()
        res.status(200).json({ ok: true })
    } catch (error) {
        await transaction.rollback()
        res.status(400).json({ message: error.message })
    }
}

const validationsTypes = {
    LiquidFillPorcentaje: LiquidFillSchema,
    CirclePorcentaje: CirclePorcentajeSchema,
    GaugeSpeed: GaugeSpeedSchema,
    BooleanChart: BooleanChartSchema,
    MultipleBooleanChart: MultipleBooleanChartSchema,
    BoardChart: BoardChartSchema,
}

module.exports = {
    createChart,
    findIndicatorCharts,
    findDashboardCharts,
    findAllCharts,
    statusChart,
    findChartById,
    editChart,
    findBoards,
    findChartByUser,
    getProfilesByChart,
    setProfilesByChart
}
