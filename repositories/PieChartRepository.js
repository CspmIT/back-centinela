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

    getData() {
        return this.chart.categories
    }
}

module.exports = {
    PieChart,
    PieChartRepository,
}
