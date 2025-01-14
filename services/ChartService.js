const { db } = require('../models')

class ChartService {
    static async getCharts() {
        try {
            const charts = await db.Chart.findAll({
                where: { status: 1 },
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
                ],
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
    static async createChart(chart, chartConfig, chartData) {
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

            t.commit()
            return newChart
        } catch (error) {
            //Hago un rolback y retorno el error
            t.rollback()
            throw Error(error)
        }
    }
}

module.exports = {
    ChartService,
}
