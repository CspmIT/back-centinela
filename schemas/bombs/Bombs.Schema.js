const { z } = require('zod')

/**
 * Schema base para un item de bomba/estado.
 * Solo se conservan los campos que persiste el modelo BombsData
 * (varId, name, type); el resto de las claves del frontend
 * (id, value, unit) se descartan automáticamente.
 */
const BombItemSchema = z.object({
    varId: z
        .number({ message: 'El varId es requerido' })
        .int({ message: 'El varId debe ser un entero' }),

    name: z
        .string({ message: 'El nombre es requerido' })
        .min(1, { message: 'El nombre es requerido' })
        .trim(),

    type: z.enum(['pump', 'status'], {
        message: 'El tipo no es válido',
    }),
})

/**
 * Schema principal del control de bombas (PumpControl).
 */
const BaseBomb = z.object({
    title: z
        .string({ message: 'Debe pasar un string como título' })
        .min(1, { message: 'El título es requerido' })
        .trim(),

    type: z.literal('PumpControl'),

    pumps: z
        .array(BombItemSchema)
        .min(1, { message: 'Debe definir al menos una bomba' }),

    states: z.array(BombItemSchema),
})

module.exports = BaseBomb
