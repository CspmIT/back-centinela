const {
    DoughnutChartschema,
} = require('../schemas/pieCharts/DoughnutChartSchema')

class PieChart {
    /**
     * @param {object} data - Datos sin validar
     */
    constructor(data) {
        const result = DoughnutChartschema.safeParse(data)

        if (!result.success) {
            // Lanzás un error personalizado con el detalle del formato de error
            const formattedErrors = result.error.format()
            throw new Error(
                'Error de validación en PieChart: ' +
                    JSON.stringify(formattedErrors, null, 2)
            )
        }

        const parsed = result.data

        this.title = parsed.title
        this.categories = parsed.categories
        this.lastValue = parsed.lastValue
        this.startDate = parsed.startDate ?? false
        this.endDate = parsed.endDate ?? false
    }
}

class PieChartRepository {
    constructor(chart) {
        if (!(chart instanceof PieChart)) {
            throw new Error('El constructor debe ser una instancia de PieChart')
        }

        this.chart = chart
    }

    getChart() {
        return {
            name: this.chart.title,
            type: 'PieChart',
        }
    }

    getConfig() {
        const config = [
            {
                key: 'lastValue',
                value: this.chart.lastValue,
                type: typeof this.chart.lastValue,
            },
        ]
        if (!this.chart.lastValue) {
            const moreConfig = [
                {
                    key: 'startDate',
                    value: this.chart.startDate,
                    type: typeof this.chart.startDate,
                },
                {
                    key: 'endDate',
                    value: this.chart.endDate,
                    type: typeof this.chart.endDate,
                },
            ]
            config.push(...moreConfig)
        }
        return config
    }

    getData() {
        return this.chart.categories
    }
}

module.exports = {
    PieChart,
    PieChartRepository,
}
