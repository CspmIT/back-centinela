class MapService {
    static async searchById(id, db) {
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

    static async getAll(db) {
        try {
            const maps = await db.Maps.findAll({})
            return maps
        } catch (error) {
            throw new Error('Error al obtener el mapa')
        }
    }

    static async createMap(map, db) {
        console.log(map)
        const t = await db.sequelize.transaction()
        const {name, viewState, markers } = map

        try {
            const newMap = await db.Maps.create({name, ...viewState}, { transaction: t })

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

    static async editMap(id, map, db) {
        const t = await db.sequelize.transaction()
        
        const {name, viewState, markers } = map
        try {
            // Buscar el mapa existente
            const existingMap = await db.Maps.findByPk(id, { transaction: t })
            if (!existingMap) {
                throw new Error('Map not found')
            }

            // Actualizar los datos del mapa
            await existingMap.update({name, ...viewState}, { transaction: t })

            // Primero eliminar los popups asociados a los markers
            await db.PopUpsMarkers.destroy({
                where: {
                    idMarker: {
                        [db.Sequelize.Op.in]: db.Sequelize.literal(
                            `(SELECT id FROM MarkersMaps WHERE idMap = ${id})`
                        ),
                    },
                },
                transaction: t,
            })

            // Luego eliminar los markers
            await db.MarkersMaps.destroy({
                where: { idMap: id },
                transaction: t,
            })

            // Guardar los nuevos markers y popups en paralelo
            const markersData = await Promise.all(
                markers.map(async (marker) => {
                    const { popupInfo, ...markerData } = marker // Extraer popupInfo
                    const saveMarker = { ...markerData, idMap: id }

                    // Guardar el nuevo marker
                    const newMarker = await db.MarkersMaps.create(saveMarker, {
                        transaction: t,
                    })
                    console.log('actualizó marker', saveMarker)

                    // Guardar el nuevo popupInfo asociado al marker
                    const savePopup = { ...popupInfo, idMarker: newMarker.id }
                    const newPopup = await db.PopUpsMarkers.create(savePopup, {
                        transaction: t,
                    })
                    console.log('actualizó popup', savePopup)

                    return { newMarker, newPopup }
                })
            )

            await t.commit()
            return { updatedMap: existingMap, markersData }
        } catch (e) {
            await t.rollback()
            throw new Error(e)
        }
    }
}

module.exports = MapService
