const { z } = require('zod')

const ItemSchema = z.object({
    varId: z
        .number({ message: 'El item debe estar relacionado a una variable' })
        .positive({ message: 'El valor no puede ser negativo' })
        .int({ message: 'El valor debe ser entero' }),
    type: z.enum(['pump', 'status']),
    name: z.string({ message: 'Debe pasar un nombre para el item' }),
})

const BaseBomb = z.object({
    title: z.string({ message: 'Debe pasar un titulo para el grafico' }),
    type: z.literal('PumpControl'),
    pumps: z.array(ItemSchema).optional(),
    states: z.array(ItemSchema).optional(),
})

module.exports = BaseBomb
