const z = require('zod')
const { ViewStateSchema } = require('./ViewState.Schema')
const MarkerSchema = require('./Marker.Schema')

const MapSchema = z.object({
    name: z
        .string()
        .min(1, 'El nombre del mapa es obligatorio')
        .max(255, 'Nombre demasiado largo'),

    viewState: ViewStateSchema,
    markers: z.array(MarkerSchema),
})

module.exports = MapSchema
