const { db } = require('../models')

class PLCService {
    static async search() {
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

    static async save(PLCProfile) {
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
