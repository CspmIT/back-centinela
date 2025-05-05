const { z } = require('zod')

const GaugeSpeedSchema = z.object({
    order: z.number().optional(),
    type: z.string({ message: 'type is required' }).min(1).max(255),
    title: z
        .string({ message: 'El titulo debe ser un string' })
        .min(3, { message: 'El titulo debe tener al menos 3 caracteres' })
        .max(40, { message: 'El titulo no puede tener mas de 40 caracteres' }),
    maxValue: z.number({ message: 'El valor maximo debe ser un numero' }),
    unidad: z.string({ message: 'La unidad debe ser un string' }),
    description: z
        .string({ message: 'La descripcion proporcionada debe ser un string' })
        .optional(),
    description2: z
        .string({ message: 'La descripcion proporcionada debe ser un string' })
        .optional(),
})

module.exports = GaugeSpeedSchema
