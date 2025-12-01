const { where } = require('sequelize')
const { db } = require('../models')

/**
 * Guarda la informacion pertenecientes a un diagrama.
 *
 * @param {Object} diagram - Un objeto que representa el diagrama.
 * @param {string} diagram.id - El identificador único del diagrama.
 * @param {Object} transaction - La transacción de la base de datos a usar.
 * @returns {Promise<Object>} Un objeto que representa la imagen guardada o actualizada.
 * @throws {Error} Lanza un error si ocurre un problema durante la transacción.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const saveVariableInflux = async (data) => {
    const transaction = await db.sequelize.transaction()
    try {
        const [InfluxVar, created] = await db.InfluxVar.findOrCreate({
            where: { id: data?.id || 0 },
            defaults: { ...data },
            transaction,
        })
        if (!created) {
            await InfluxVar.update(data, { transaction })
        }
        await transaction.commit()
        return InfluxVar
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

/**
 * Guarda la informacion pertenecientes a un diagrama.
 *
 * @param {Object} diagram - Un objeto que representa el diagrama.
 * @param {string} diagram.id - El identificador único del diagrama.
 * @param {Object} transaction - La transacción de la base de datos a usar.
 * @returns {Promise<Object>} Un objeto que representa la imagen guardada o actualizada.
 * @throws {Error} Lanza un error si ocurre un problema durante la transacción.
 * @author Jose Romani <jose.romani@hotmail.com>
 */
const getVariables = async () => {
    try {
        const list = await db.InfluxVar.findAll({ where: { status: 1 }, include: [{ model: db.VarsBinaryCompressedData, as: 'bits', required: false }] })
        return list
    } catch (error) {
        throw error
    }
}

const getVarById = async (id) => {
    const varSaved = await db.InfluxVar.findOne({
        where: { id },
        include: [{ model: db.VarsBinaryCompressedData, as: 'bits', required: false }]
    });
    return varSaved;
};

const handleStatusInfluxVar = async (id) => {
    try {
        const [influxVar] = await db.InfluxVar.findAll({ where: { id: id } })
        const currentStatus = influxVar.status
        const result = await influxVar.update({
            status: influxVar.status === false ? 1 : 0,
        })

        return currentStatus !== result.status
    } catch (error) {
        throw error
    }
}

/**
 * Guarda/actualiza/elimina los bits de una variable binaria comprimida.
 * @param {number} variableId - id de la InfluxVar (id_var)
 * @param {Array} bits - array de bits con forma [{ id?, name, bit }]
 * @param {Object} options - { transaction }
 */
async function saveBitsData(variableId, bits, options = {}) {
    const { transaction = null } = options;

    if (!Array.isArray(bits) || bits.length === 0) {
        throw new Error('No se ingresaron bits para la variable comprimida');
    }

    // 1) Leer bits existentes
    const existingBits = await db.VarsBinaryCompressedData.findAll({
        where: { id_var: variableId },
        transaction,
    });

    const mapById = new Map();
    const mapByBit = new Map();
    for (const ex of existingBits) {
        mapById.set(Number(ex.id), ex);
        mapByBit.set(Number(ex.bit), ex);
    }

    const keepIds = new Set();

    // 2) Iterar incoming bits
    for (const b of bits) {
        if (typeof b.bit === 'undefined' || b.bit === null) {
            throw new Error('Cada bit debe incluir propiedad "bit" con la posición (0..7).');
        }

        // update por id si viene
        if (b.id && mapById.has(Number(b.id))) {
            const ex = mapById.get(Number(b.id));
            await ex.update({ name: b.name, bit: Number(b.bit) }, { transaction });
            keepIds.add(Number(b.id));
            continue;
        }

        // update por posición bit si coincide y no fue ya usado
        if (mapByBit.has(Number(b.bit))) {
            const ex = mapByBit.get(Number(b.bit));
            if (!keepIds.has(Number(ex.id))) {
                await ex.update({ name: b.name, bit: Number(b.bit) }, { transaction });
                keepIds.add(Number(ex.id));
                continue;
            }
        }

        // crear nuevo
        const created = await db.VarsBinaryCompressedData.create({
            id_var: variableId,
            name: b.name,
            bit: Number(b.bit),
        }, { transaction });

        keepIds.add(Number(created.id));
    }

    // 3) Borrar los que no están en keepIds
    const idsToDelete = existingBits.map(x => Number(x.id)).filter(id => !keepIds.has(id));
    if (idsToDelete.length > 0) {
        await db.VarsBinaryCompressedData.destroy({
            where: { id: idsToDelete },
            transaction,
        });
    }

    // Opcional: devolver el listado final desde DB
    const finalBits = await db.VarsBinaryCompressedData.findAll({
        where: { id_var: variableId },
        transaction,
    });

    return finalBits;
}

module.exports = {
    saveVariableInflux,
    getVariables,
    getVarById,
    handleStatusInfluxVar,
    saveBitsData
}
