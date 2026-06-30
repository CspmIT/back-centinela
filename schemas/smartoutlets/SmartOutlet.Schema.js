const { z } = require('zod')

/**
 * Schema del Smart Outlet (zapatilla inteligente).
 * Un gráfico de tipo SmartOutlet representa una zapatilla con 5 tomas.
 * El estado de cada toma se lee en tiempo real desde Influx usando el `topic`.
 */
const SmartOutletSchema = z.object({
    title: z
        .string({ message: 'El nombre es requerido' })
        .min(1, { message: 'El nombre es requerido' })
        .trim(),

    type: z.literal('SmartOutlet'),

    location: z
        .string({ message: 'La ubicación es requerida' })
        .min(1, { message: 'La ubicación es requerida' })
        .trim(),

    topic: z
        .string({ message: 'El tópico es requerido' })
        .min(1, { message: 'El tópico es requerido' })
        .trim(),

    // Equipo conectado en cada toma (TOMA_1..5). Opcional.
    channels: z
        .array(z.string().trim())
        .max(5, { message: 'Solo hay 5 tomas' })
        .optional()
        .default([]),
})

module.exports = SmartOutletSchema
