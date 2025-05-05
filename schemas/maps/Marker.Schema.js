const z = require('zod')
const { PopUpSchema } = require('./Popup.Schema')

const MarkerSchema = z.object({
    name: z.string({ message: 'El nombre es requerido' }),
    latitude: z.number({ message: 'Latitude es requerido' }),
    longitude: z.number({ message: 'Longitude es requerido' }),
    popupInfo: PopUpSchema,
})

module.exports = MarkerSchema
