const z = require('zod')

const ViewStateSchema = z.object({
    bearing: z.number({ message: 'Bearing es requerido' }),
    latitude: z.number({ message: 'Latitude es requerido' }),
    longitude: z.number({ message: 'Longitude es requerido' }),
    pitch: z.number({ message: 'Pitch es requerido' }),
    zoom: z.number({ message: 'Zoom es requerido' }),
})

module.exports = {
    ViewStateSchema,
}
