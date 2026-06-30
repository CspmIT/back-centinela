const { z } = require('zod')
const mqtt = require('mqtt')
const SmartOutletSchema = require('../schemas/smartoutlets/SmartOutlet.Schema')
const { ChartService } = require('../services/ChartService')
const { ConsultaInflux } = require('../services/InfluxServices')
const outletMqttConfig = require('../config/mqtt_outlet')

const CANT_TOMAS = 5
const ACCIONES = ['ON', 'OFF', 'RST']

/**
 * Crea una zapatilla inteligente como un gráfico de tipo SmartOutlet.
 * El nombre, la ubicación y el tópico se guardan en ChartConfig.
 * Se asigna a todos los perfiles (igual que el resto de los gráficos);
 * la restricción por perfil se administra luego desde el ABM de gráficos.
 */
const create = async (req, res) => {
    try {
        const baseOutlet = req.body
        baseOutlet.type = 'SmartOutlet'

        const valid = SmartOutletSchema.parse(baseOutlet)

        const chart = {
            name: valid.title,
            type: valid.type,
            status: 1,
        }

        const chartConfig = [
            { chart_id: null, key: 'title', value: valid.title, type: 'string' },
            { chart_id: null, key: 'location', value: valid.location, type: 'string' },
            { chart_id: null, key: 'topic', value: valid.topic, type: 'string' },
        ]

        // Equipo conectado por toma (TOMA_1..5) -> channel1..channel5
        for (let i = 1; i <= CANT_TOMAS; i++) {
            chartConfig.push({
                chart_id: null,
                key: `channel${i}`,
                value: valid.channels[i - 1] || '',
                type: 'string',
            })
        }

        const newChart = await ChartService.createChart(chart, chartConfig, [], req.db)

        res.status(201).json(newChart)
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json(error.errors)
        } else {
            res.status(500).json({ message: error.message })
        }
    }
}

/**
 * Edita una zapatilla existente: actualiza el nombre y la configuración
 * (ubicación, tópico y equipos conectados). No modifica los perfiles
 * asignados ni el estado activo/inactivo.
 */
const edit = async (req, res) => {
    try {
        const chartId = req.params.id
        const baseOutlet = req.body
        baseOutlet.type = 'SmartOutlet'

        const valid = SmartOutletSchema.parse(baseOutlet)

        const chart = {
            name: valid.title,
            type: valid.type,
        }

        const chartConfig = [
            { chart_id: null, key: 'title', value: valid.title, type: 'string' },
            { chart_id: null, key: 'location', value: valid.location, type: 'string' },
            { chart_id: null, key: 'topic', value: valid.topic, type: 'string' },
        ]

        for (let i = 1; i <= CANT_TOMAS; i++) {
            chartConfig.push({
                chart_id: null,
                key: `channel${i}`,
                value: valid.channels[i - 1] || '',
                type: 'string',
            })
        }

        const updated = await ChartService.updateChart(chartId, chart, chartConfig, [], req.db)

        res.status(200).json(updated)
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json(error.errors)
        } else {
            res.status(500).json({ message: error.message })
        }
    }
}

/**
 * Devuelve el estado actual de cada toma de una zapatilla leyendo Influx.
 * Cada toma es un `_field` distinto (TOMA_1..5) bajo el mismo `topic`,
 * y el `_value` es el estado (ON/OFF). Si no hay datos en los últimos
 * 10 minutos, la zapatilla se considera offline (array vacío).
 */
const status = async (req, res) => {
    try {
        const { topic } = req.body
        if (!topic) {
            throw new Error('Debe enviar el tópico de la zapatilla')
        }

        const query = ` |> range(start: -10m) |> filter(fn: (r) => r["topic"] == "${topic}") |> last()`
        const rows = await ConsultaInflux(query, req.user.influx_name)

        const tomas = rows
            .filter((r) => String(r._field || '').startsWith('TOMA_'))
            .map((r) => ({
                toma: String(r._field).replace('TOMA_', ''),
                field: r._field,
                status: r._value,
                time: r._time,
            }))

        res.status(200).json({ topic, online: tomas.length > 0, tomas })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

/**
 * Envía un comando a una toma por MQTT (Encender/Apagar/Reiniciar).
 * Replica la lógica del módulo original:
 *   - topic destino = base del tópico (hasta el último "/") + "action"
 *   - payload = "Rele_<n>_<ACCION>"  (n = 1..5, ACCION = ON|OFF|RST)
 *   - QoS 0
 * El broker es propio del módulo (config/mqtt_outlet.js).
 */
const action = async (req, res) => {
    try {
        const { topic, plug, action: cmd } = req.body

        if (!topic) throw new Error('Debe enviar el tópico de la zapatilla')
        const plugNum = parseInt(plug, 10)
        if (!plugNum || plugNum < 1 || plugNum > CANT_TOMAS) {
            throw new Error('Toma inválida')
        }
        if (!ACCIONES.includes(cmd)) {
            throw new Error('Acción inválida')
        }

        // base del tópico + "action"  ->  coop/.../0001/neighbor => coop/.../0001/action
        const base = topic.slice(0, topic.lastIndexOf('/') + 1) || topic
        const destino = `${base}action`
        const payload = `Rele_${plugNum}_${cmd}`

        // Broker propio de las zapatillas (no el de Reconectadores)
        const client = mqtt.connect(outletMqttConfig)

        let answered = false
        const done = (status, body) => {
            if (answered) return
            answered = true
            res.status(status).json(body)
        }

        client.on('connect', () => {
            client.publish(destino, payload, { qos: 0 }, (err) => {
                client.end()
                if (err) return done(403, { message: err.message })
                done(200, { message: 'Acción enviada', topic: destino, payload })
            })
        })
        client.on('error', (err) => {
            client.end()
            done(401, { message: err.message })
        })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

module.exports = { create, edit, status, action, CANT_TOMAS }
