const { where } = require('sequelize')

class PLCService {
    static async search(db) {
        try {
            const PLCProfile = await db.PLCProfile.findAll({
                include: [
                    {
                        association: 'PointsPLC',
                    },
                    {
                        association: 'VarsPLC',
                    },
                ],
            })
            return PLCProfile
        } catch (error) {
            throw new Error('Ocurrio un error al obtener los perfiles de PLC')
        }
    }

    static async searchByID(id, db) {
        try {
            const PLCProfile = await db.PLCProfile.findAll({
                where: { id: id },
                include: [
                    {
                        association: 'PointsPLC',
                    },
                    {
                        association: 'VarsPLC',
                    },
                ],
            })
            return PLCProfile
        } catch (error) {
            throw new Error('Ocurrio un error al obtener los perfiles de PLC')
        }
    }

    static async updateStatus(profileID, newStatus, db) {
        try {
            const plcUpdate = await db.PLCProfile.findByPk(profileID)
            if (!plcUpdate) {
                throw new Error('No se encontro el plc')
            }

            const result = await plcUpdate.update({ status: newStatus })
            return result
        } catch (error) {
            throw new Error(error)
        }
    }

    static async update(PLCProfile, db) {
        const t = await db.sequelize.transaction()
        try {
            const { id, points, vars, ...plcData } = PLCProfile

            // Actualizar el perfil existente
            const existingPLCProfile = await db.PLCProfile.findByPk(id, {
                transaction: t,
            })
            if (!existingPLCProfile) {
                throw new Error('Perfil PLC no encontrado')
            }

            await existingPLCProfile.update(plcData, { transaction: t })

            // Eliminar puntos y variables existentes
            await db.PointsPLC.destroy({
                where: { plcId: id },
                transaction: t,
            })

            await db.VarsPLC.destroy({
                where: { plcId: id },
                transaction: t,
            })

            // Crear nuevos puntos
            const pointsData = await Promise.all(
                points.map(async (point) => {
                    const newPoint = await db.PointsPLC.create(
                        { ...point, plcId: id },
                        { transaction: t }
                    )
                    return newPoint
                })
            )

            // Crear nuevas variables
            const varsData = await Promise.all(
                vars.map(async (variable) => {
                    const newVar = await db.VarsPLC.create(
                        { ...variable, plcId: id },
                        { transaction: t }
                    )
                    return newVar
                })
            )

            await t.commit()
            return {
                updatedPLCProfile: existingPLCProfile,
                pointsData,
                varsData,
            }
        } catch (error) {
            await t.rollback()
            console.error(error)
            throw new Error('Ocurrió un error al actualizar el perfil del PLC')
        }
    }

    static async save(PLCProfile, db) {
        const t = await db.sequelize.transaction()
        try {
            const { points, vars, ...plcData } = PLCProfile
            const newPLCProfile = await db.PLCProfile.create(plcData, {
                transaction: t,
            })

            const pointsData = await Promise.all(
                points.map(async (point) => {
                    const newPoint = await db.PointsPLC.create(
                        { ...point, plcId: newPLCProfile.id },
                        { transaction: t }
                    )
                    return newPoint
                })
            )

            const varsData = await Promise.all(
                vars.map(async (variable) => {
                    const newVar = await db.VarsPLC.create(
                        {
                            ...variable,
                            plcId: newPLCProfile.id,
                        },
                        { transaction: t }
                    )
                    return newVar
                })
            )

            await t.commit()
            return { newPLCProfile, pointsData, varsData }
        } catch (error) {
            t.rollback()
            console.error(error)
            throw new Error('Ocurrio un error al guardar el perfil del plc')
        }
    }
}

module.exports = {
    PLCService,
}
