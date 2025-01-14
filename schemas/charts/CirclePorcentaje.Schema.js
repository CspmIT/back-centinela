const { z } = require('zod')

const CirclePorcentajeSchema = z.object({
    title: z.string({ message: 'title is required' }).min(1).max(255),
    idVar: z.number({ message: 'idVar is required' }),
    maxValue: z.number({ message: 'maxValue is required' }),
    type: z.string({ message: 'type is required' }).min(1).max(255),
    color: z.string({ message: 'color is required' }).min(1).max(255),
})

module.exports = {
    CirclePorcentajeSchema,
}
