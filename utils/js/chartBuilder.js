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


        if (type === 'MultipleBooleanChart') {
            const config = []
            const data = []

            if (!Array.isArray(inputData.chartData)) {
                throw new Error('chartData debe ser un array')
            }

            inputData.chartData.forEach((led, index) => {
                const key = led.key || `led_${index}`

                config.push(
                    { key: `${key}.title`, value: led.title ?? '', type: 'string' },
                    { key: `${key}.textOn`, value: led.textOn, type: 'string' },
                    { key: `${key}.textOff`, value: led.textOff, type: 'string' },
                    { key: `${key}.colorOn`, value: led.colorOn, type: 'string' },
                    { key: `${key}.colorOff`, value: led.colorOff, type: 'string' }
                )

                data.push({
                    key,
                    value: null,
                    source_id: led.idVar,
                    label: led.title,
                })
            })

            const chartObj = this.validateChart(chart)
            const configObj = this.validateConfig(config, chart.type)
            const dataObj = this.validateData(data, chart.type)
            console.log('Chart:', chartObj)
            console.log('Config:', configObj)
            console.log('Data:', dataObj)

            return { chart: chartObj, config: configObj, data: dataObj }
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

                    if (key === 'value' || key === 'secondary') {
                        return {
                            key,
                            value: null,
                            source_id: chartItem?.idVar ?? null,
                            label: chartItem?.label ?? key,
                        }
                    }

                    if (key === 'bottom1' || key === 'bottom2') {
                        if (!chartItem) return null

                        return {
                            key,
                            value: null,
                            source_id: chartItem.idVar ?? null,
                            label: chartItem.label ?? key,
                        }
                    }

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
                }

                return {
                    key,
                    value: inputData[key],
                    source_id: null,
                }
            })
        }

        const chartObj = this.validateChart(chart)
        const configObj = this.validateConfig(config, chart.type)
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

        return config.map((val) => {
            // 🟢 MultipleBooleanChart → claves dinámicas permitidas
            if (chartType !== 'MultipleBooleanChart') {
                if (!allowedConfigKeys.includes(val.key)) {
                    throw new Error(
                        `La clave '${val.keyConfig}' no está permitida para la configuración del gráfico de tipo '${chartType}'.`
                    )
                }
            }

            return {
                key: val.key,
                value: val.value,
                type: typeof val.value,
            }
        })
    }


    /**
     * Valida el objeto ChartData.
     * @param {Object[]} data - Lista de datos para el gráfico.
     * @returns {Object[]} - Lista de datos válidos.
     */
    validateData(data, chartType) {
        const allowedDataKeys = this.allowedDataKeys

        return data.map((item) => {
            const { key, value, source_id, label } = item

            if (!key) {
                throw new Error("Cada objeto de 'data' debe contener 'key'.")
            }

            // 🟢 MultipleBooleanChart → key libre (led_x)
            if (chartType !== 'MultipleBooleanChart') {
                if (!allowedDataKeys.includes(key)) {
                    throw new Error(
                        `La clave '${key}' no está permitida para los datos.`
                    )
                }
            }

            /* ===============================
               LÓGICA ESPECIAL – LiquidFill
            ================================ */
            if (chartType === 'LiquidFillPorcentaje') {
                return {
                    key,
                    value: value ?? null,
                    source_id: source_id ?? null,
                    label: label ?? key,
                }
            }

            /* ===============================
               LÓGICA GENERAL
            ================================ */
            if (value && source_id) {
                throw new Error(
                    "Cada objeto de 'data' solo puede contener 'value' o 'source_id'."
                )
            }

            return {
                key,
                value: value ?? null,
                source_id: source_id ?? null,
                label: label ?? key,
            }
        })
    }
}

module.exports = ChartBuilder
