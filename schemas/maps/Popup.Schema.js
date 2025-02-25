const z = require('zod')

const PopUpSchema = z.object({
    lat: z.number({ message: 'PopUp lat is required' }),
    lng: z.number({ message: 'PopUp lng is required' }),
    idVar: z.number({ message: 'PopUp idVar is required' }),
})

module.exports = {
    PopUpSchema,
}
