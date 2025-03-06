const { db } = require('../models')
class MapService {
    static async searchById(id) {
        try {
            const mapa = await db.Maps.findAll({
                where: { id: id },
                include: [
                    {
                        association: 'MarkersMaps',
                        include: [
                            {
                                association: 'PopUpsMarkers',
                                include: [{ association: 'InfluxVar' }],
                            },
                        ],
                    },
                ],
            })
            return mapa
        } catch (error) {
            throw new Error('Ocurrio un error al obtener el mapa')
        }
    }

    static async createMap(map) {
        const t = await db.sequelize.transaction()
        const { viewState, markers } = map

        try {
            const newMap = await db.Maps.create(viewState, { transaction: t })

            // Guardar los markers y popups en paralelo
            const markersData = await Promise.all(
                markers.map(async (marker) => {
                    const { popupInfo, ...markerData } = marker // Extraer popupInfo
                    const saveMarker = { ...markerData, idMap: newMap.id }

                    // Guardar el marker
                    const newMarker = await db.MarkersMaps.create(saveMarker, {
                        transaction: t,
                    })
                    console.log('guardo marker', saveMarker)

                    // Guardar el popupInfo asociado al marker
                    const savePopup = { ...popupInfo, idMarker: newMarker.id }
                    const newPopup = await db.PopUpsMarkers.create(savePopup, {
                        transaction: t,
                    })
                    console.log('guardo popup', savePopup)

                    return { newMarker, newPopup }
                })
            )

            await t.commit()
            return { newMap, markersData }
        } catch (e) {
            t.rollback()
            throw new Error(e)
        }
    }
}

module.exports = MapService
