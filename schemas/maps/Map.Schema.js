const z = require('zod')
const { ViewStateSchema } = require('./ViewState.Schema')
const MarkerSchema = require('./Marker.Schema')

const MapSchema = z.object({
    viewState: ViewStateSchema,
    markers: z.array(MarkerSchema),
})

module.exports = MapSchema
