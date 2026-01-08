class ChartBuilder {
    /**
     * Constructor de la clase ChartBuilder.
     * @param {[]} allowedConfigKeys - Claves permitidas para ChartConfig.
     * @param {[]} allowedDataKeys - Claves permitidas para ChartData.
     * @returns {Object} - Objeto ChartBuilder.
     */
    constructor(allowedConfigKeys, allowedDataKeys) {
        this.allowedConfigKeys = allowedConfigKeys
        this.allowedDataKeys = allowedDataKeys
    }

    /**
     * Valida y construye los objetos para Chart, ChartConfig y ChartData.
     * @param {Object} inputData - Objeto con los datos completos del gráfico.
     * @returns {Object} - Objetos para guardar en la base de datos.
     */
    build(inputData) {
        const type = inputData.type
        const chart = {
            name: inputData.title,
            type: inputData.type,
            status: 1,
            order: inputData.order,
        }

        const config = this.allowedConfigKeys.map((key) => {
            return {
                key: Object.keys(inputData).find((k) => k === key),
                keyConfig: key,
                value: inputData[key],
                type: typeof inputData[key],
            }
        })

        let data

        if (type === 'LiquidFillPorcentaje') {

            data = this.allowedDataKeys
                .map((key) => {
                    const chartItem = Array.isArray(inputData.chartData)
                        ? inputData.chartData.find((item) => item.key === key)
                        : null

                    // value y secondary → vienen de Influx
                    if (key === 'value' || key === 'secondary') {
                        return {
                            key,
                            value: null,
                            source_id: chartItem?.idVar ?? null,
                            label: chartItem?.label ?? key,
                        }
                    }

                    // bottom1 / bottom2 → pueden tener label + influx
                    if (key === 'bottom1' || key === 'bottom2') {
                        if (!chartItem) return null

                        return {
                            key,
                            value: null,
                            source_id: chartItem.idVar ?? null,
                            label: chartItem.label ?? key,
                        }
                    }

                    // maxValue, unidad, etc
                    return {
                        key,
                        value: inputData[key] ?? null,
                        source_id: null,
                        label: key,
                    }
                })
                .filter(Boolean)
        } else {
            data = this.allowedDataKeys.map((key) => {
                if (key === 'value') {
                    return {
                        key,
                        value: null,
                        source_id: inputData['idVar'],
                    }
                } else {
                    // Si unidad llega vacia, me fijo si porcentaje en configuracion es true y no guardo ningun registro para unidad
                    return {
                        key,
                        value: inputData[key],
                        source_id: null,
                    }
                }
            })
        }


        // Validar y construir Chart
        const chartObj = this.validateChart(chart)

        // Validar y construir ChartConfig
        const configObj = this.validateConfig(config, chart.type)

        // Validar y construir ChartData
        const dataObj = this.validateData(data, chart.type)

        return { chart: chartObj, config: configObj, data: dataObj }
    }

    /**
     * Valida el objeto Chart.
     * @param {Object} chart - Objeto Chart a validar.
     * @returns {Object} - Objeto Chart validado.
     */
    validateChart(chart) {
        if (!chart.name || !chart.type) {
            throw new Error("El objeto Chart debe contener 'name' y 'type'.")
        }

        return {
            name: chart.name,
            type: chart.type,
            status: chart.status,
            order: chart.order,
        }
    }

    /**
     * Valida el objeto ChartConfig.
     * @param {Object} config - Objeto ChartConfig a validar.
     * @param {string} chartType - Tipo de gráfico para validar claves permitidas.
     * @returns {Object[]} - Lista de configuraciones válidas.
     */
    validateConfig(config, chartType) {
        const allowedConfigKeys = this.allowedConfigKeys
        const configArray = config.reduce((acc, val) => {
            if (!allowedConfigKeys.includes(val.key)) {
                throw new Error(
                    `La clave '${val.keyConfig}' no está permitida para la configuracion el gráfico de tipo '${chartType}'.`
                )
            }
            acc.push({
                key: val.key,
                value: val.value,
                type: typeof val.value,
            })
            return acc
        }, [])

        return configArray
    }

    /**
     * Valida el objeto ChartData.
     * @param {Object[]} data - Lista de datos para el gráfico.
     * @returns {Object[]} - Lista de datos válidos.
     */
    validateData(data, chartType) {
        const allowedDataKeys = this.allowedDataKeys

        const dataArray = data.reduce((acc, item) => {
            const { key, value, source_id, label } = item

            if (!key) {
                throw new Error("Cada objeto de 'data' debe contener 'key'.")
            }

            if (!allowedDataKeys.includes(key)) {
                throw new Error(
                    `La clave '${key}' no está permitida para los datos.`
                )
            }

            /* ===============================
               LÓGICA ESPECIAL – LiquidFill
            ================================ */
            if (chartType === 'LiquidFillPorcentaje') {
                acc.push({
                    key,
                    value: value ?? null,
                    source_id: source_id ?? null,
                    label: label ?? key,
                })
                return acc
            }

            /* ===============================
               LÓGICA GENERAL – resto de gráficos
            ================================ */
            if (value && source_id) {
                throw new Error(
                    "Cada objeto de 'data' solo puede contener 'value' o 'source_id'."
                )
            }

            acc.push({
                key,
                value: value ?? null,
                source_id: source_id ?? null,
                label: key,
            })

            return acc
        }, [])

        return dataArray
    }
}

module.exports = ChartBuilder
