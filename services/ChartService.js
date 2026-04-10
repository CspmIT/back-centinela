const { Op, literal, where } = require('sequelize')

class ChartService {
    static async getSimpleCharts(db) {
        try {
            const charts = await db.Chart.findAll({
                where: {
                    status: 1,
                    [Op.and]: [
                        literal(`NOT EXISTS (
                        SELECT 1 FROM \`ChartsSeriesData\`
                        WHERE \`ChartsSeriesData\`.\`chart_id\` = \`Chart\`.\`id\`
                    )`),
                        literal(`NOT EXISTS (
                        SELECT 1 FROM \`ChartsPieData\`
                        WHERE \`ChartsPieData\`.\`chart_id\` = \`Chart\`.\`id\`
                    )`),
                    ],
                },
                include: [
                    {
                        association: 'ChartConfig',
                        attributes: ['key', 'value', 'type'],
                    },
                    {
                        association: 'ChartData',
                        attributes: ['key', 'value', 'label'],
                        include: [{ association: 'InfluxVars' }],
                    },
                    {
                        association: 'BombsData',
                        include: [{ association: 'InfluxVars' }],
                        order: [['id', 'ASC']],
                    },
                ],
                order: [['order', 'ASC']],
            })
            return charts
        } catch (error) {
            throw error
        }
    }

    static async getDashboardCharts(db) {
        try {
            const charts = await db.Chart.findAll({
                where: {
                    status: 1,
                    [Op.or]: [
                        literal(`EXISTS (
                        SELECT 1 FROM \`ChartsSeriesData\` 
                        WHERE \`ChartsSeriesData\`.\`chart_id\` = \`Chart\`.\`id\`
                    )`),
                        literal(`EXISTS (
                        SELECT 1 FROM \`ChartsPieData\` 
                        WHERE \`ChartsPieData\`.\`chart_id\` = \`Chart\`.\`id\`
                    )`),
                    ],
                },
                include: [
                    {
                        association: 'ChartConfig',
                        attributes: ['key', 'value', 'type'],
                    },
                    {
                        association: 'ChartSeriesData',
                        required: false,
                        include: [{ association: 'InfluxVars' }],
                    },
                    {
                        association: 'ChartPieData',
                        required: false,
                        include: [{ association: 'InfluxVars' }],
                    },
                    {
                        model: db.ChartProfile,
                        as: 'ChartProfiles',
                        where: { profile_id: profile },
                        attributes: [],
                        required: true
                    }
                ],
                order: [['order', 'ASC']],
            })
            return charts
        } catch (error) {
            throw error
        }
    }

    static async getChartById(id, db) {
        const chart = await db.Chart.findAll({
            where: { id: id },
            include: [
                {
                    association: 'ChartConfig',
                    attributes: ['key', 'value', 'type'],
                },
                {
                    association: 'ChartData',
                    attributes: ['key', 'value', 'label'],
                    include: [
                        {
                            association: 'InfluxVars',
                        },
                    ],
                },
                {
                    association: 'BombsData',
                    include: [{ association: 'InfluxVars' }],
                    order: [['id', 'ASC']],
                },
                {
                    association: 'ChartSeriesData',
                    include: [{ association: 'InfluxVars' }],
                },
            ],
        })
        return chart.shift()
    }

    static async getAllCharts(db) {
        try {
            const charts = await db.Chart.findAll({
                include: [
                    {
                        model: db.ChartProfile,
                        as: 'ChartProfiles',
                        attributes: ['profile_id'],
                        required: false  // LEFT JOIN: trae también charts sin perfiles asignados
                    }
                ],
                order: [['id', 'ASC']]
            })
            return charts
        } catch (error) {
            throw error
        }
    }

    static async getBoards(db) {
        try {
            const boards = await db.Chart.findAll({
                where: { type: 'BoardChart', status: 1 },
            })
            return boards
        } catch (error) {
            throw error
        }
    }

    static async getChartsByUser(userId, db) {
        try {
            // Obtener el perfil del usuario
            const user = await db.User.findByPk(userId, {
                attributes: ['profile']
            })

            if (!user) throw new Error('Usuario no encontrado')

            // Charts que el usuario ya tiene visibles (a excluir)
            const visibleLayouts = await db.UserDashboardLayout.findAll({
                where: { user_id: parseInt(userId), visible: true },
                attributes: ['chart_id'],
                raw: true
            })

            const visibleChartIds = visibleLayouts.map(l => l.chart_id)

            // Charts activos, permitidos para el perfil del usuario y que no estén ya en su dashboard
            const charts = await db.Chart.findAll({
                where: {
                    status: 1,
                    ...(visibleChartIds.length > 0 && {
                        id: { [Op.notIn]: visibleChartIds }
                    })
                },
                attributes: ['id', 'name', 'type'],
                include: [
                    {
                        model: db.ChartProfile,
                        as: 'ChartProfiles',
                        where: { profile_id: user.profile },
                        attributes: [],
                        required: true
                    }
                ]
            })

            return charts
        } catch (error) {
            throw error
        }
    }

    /**
     * Create a new chart
     * @param {object} chart - Chart object
     * @param {object[]} chartConfig - ChartConfig object
     * @param {object[]} chartData - ChartData object
     * @returns {Promise<object>} - Created chart
     */
    static async createChart(chart, chartConfig, chartData, db) {
        const t = await db.sequelize.transaction()
        try {
            const newChart = await db.Chart.create(chart, { transaction: t })

            const newChartConfig = chartConfig.map((config) => {
                return { ...config, chart_id: newChart.id }
            })
            await db.ChartConfig.bulkCreate(newChartConfig, { transaction: t })

            const newChartData = chartData.map((data) => {
                return { ...data, chart_id: newChart.id }
            })
            await db.ChartData.bulkCreate(newChartData, { transaction: t })

            const allProfiles = await db.Profile.findAll({ attributes: ['id'], raw: true })
            await db.ChartProfile.bulkCreate(
                allProfiles.map(p => ({ chart_id: newChart.id, profile_id: p.id })),
                { transaction: t }
            )

            t.commit()
            return newChart
        } catch (error) {
            //Hago un rolback y retorno el error
            t.rollback()
            throw Error(error)
        }
    }

    static async updateChart(chartId, chart, chartConfig, chartData, db) {
        const t = await db.sequelize.transaction()
        try {
            // Actualizar el gráfico principal
            await db.Chart.update(chart, {
                where: { id: chartId },
                transaction: t,
            })

            // Actualizar configuraciones
            await db.ChartConfig.destroy({
                where: { chart_id: chartId },
                transaction: t,
            })
            const updatedChartConfig = chartConfig.map((config) => ({
                ...config,
                chart_id: chartId,
            }))
            await db.ChartConfig.bulkCreate(updatedChartConfig, {
                transaction: t,
            })

            // Actualizar datos
            await db.ChartData.destroy({
                where: { chart_id: chartId },
                transaction: t,
            })
            const updatedChartData = chartData.map((data) => ({
                ...data,
                chart_id: chartId,
            }))
            await db.ChartData.bulkCreate(updatedChartData, { transaction: t })

            await t.commit()
            return { chart, config: updatedChartConfig, data: updatedChartData }
        } catch (error) {
            await t.rollback()
            throw Error(error)
        }
    }

    static async createSeriesChart(chart, chartConfig, chartSeriesData, db) {
        const t = await db.sequelize.transaction()
        try {
            const newChart = await db.Chart.create(chart, { transaction: t })

            const newChartConfig = chartConfig.map((config) => {
                return { ...config, chart_id: newChart.id }
            })
            await db.ChartConfig.bulkCreate(newChartConfig, { transaction: t })

            const newChartSeriesData = chartSeriesData.map((data) => {
                return { ...data, chart_id: newChart.id }
            })
            await db.ChartSeriesData.bulkCreate(newChartSeriesData, {
                transaction: t,
            })

            const allProfiles = await db.Profile.findAll({ attributes: ['id'], raw: true })
            await db.ChartProfile.bulkCreate(
                allProfiles.map(p => ({ chart_id: newChart.id, profile_id: p.id })),
                { transaction: t }
            )

            t.commit()
            return newChart
        } catch (error) {
            await t.rollback()
            throw Error(error)
        }
    }

    static async editSeriesChart(chartId, chart, chartConfig, chartSeriesData, db) {
        const t = await db.sequelize.transaction()
        try {
            // Actualizar el gráfico principal
            await db.Chart.update(chart, {
                where: { id: chartId },
                transaction: t,
            })

            // Eliminar configuraciones anteriores
            await db.ChartConfig.destroy({
                where: { chart_id: chartId },
                transaction: t,
            })

            // Crear nuevas configuraciones
            const newChartConfig = chartConfig.map((config) => {
                return { ...config, chart_id: chartId }
            })
            await db.ChartConfig.bulkCreate(newChartConfig, { transaction: t })

            // Eliminar datos de series anteriores
            await db.ChartSeriesData.destroy({
                where: { chart_id: chartId },
                transaction: t,
            })

            // Crear nuevos datos de series
            const newChartSeriesData = chartSeriesData.map((data) => {
                return { ...data, chart_id: chartId }
            })
            await db.ChartSeriesData.bulkCreate(newChartSeriesData, {
                transaction: t,
            })

            await t.commit()
            return await db.Chart.findByPk(chartId)
        } catch (error) {
            await t.rollback()
            throw Error(error)
        }
    }

    static async createPieChart(chart, chartPieData, db) {
        const t = await db.sequelize.transaction()
        try {
            const newChart = await db.Chart.create(chart, { transaction: t })

            const newChartPieData = chartPieData.map((data) => {
                return { ...data, chart_id: newChart.id }
            })
            await db.ChartPieData.bulkCreate(newChartPieData, {
                transaction: t,
            })

            t.commit()
            return newChart
        } catch (error) {
            await t.rollback()
            throw Error(error)
        }
    }

    static async createBombs(chart, chartConfig, bombsData, db) {
        const t = await db.sequelize.transaction()
        try {
            const newChart = await db.Chart.create(chart, { transaction: t })

            const newChartConfig = chartConfig.map((config) => {
                return { ...config, chart_id: newChart.id }
            })
            await db.ChartConfig.bulkCreate(newChartConfig, { transaction: t })

            const newBombsData = bombsData.map((data) => {
                return { ...data, chartId: newChart.id }
            })
            await db.BombsData.bulkCreate(newBombsData, { transaction: t })

            const allProfiles = await db.Profile.findAll({ attributes: ['id'], raw: true })
            await db.ChartProfile.bulkCreate(
                allProfiles.map(p => ({ chart_id: newChart.id, profile_id: p.id })),
                { transaction: t }
            )

            t.commit()
            return newChart
        } catch (error) {
            //Hago un rolback y retorno el error
            t.rollback()
            throw Error(error)
        }
    }

    static async changeStatus(id, status, db) {
        try {
            const chartUpdated = await db.Chart.update(
                { status },
                { where: { id } }
            )
            return chartUpdated
        } catch (error) {
            throw Error(error)
        }
    }
}

module.exports = {
    ChartService,
}
