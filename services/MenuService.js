const { Op, where } = require('sequelize')

/**
 * Obtiene todos los menús activos de la base de datos.
 *
 * @returns {Promise<Array<Object>>} Un arreglo de objetos que representan todos los menús activos encontrados.
 * @throws {Error} Si no se encuentran menús activos en la base de datos.
 * @author  [Jose Romani] <jose.romani@hotmail.com>
 *
 */
const getMenus = async (db) => {
    try {
        const Variables = await db.Menu.findAll({
            where: { status: 1 },
            order: [['order']],
        })
        if (!Variables) throw new Error('No existe ningun reconectador')
        return Variables.map((variable) => variable.get({ plain: true }))
    } catch (error) {
        throw error
    }
}

/**
 * Guarda un menú en la base de datos. Si el menú ya existe, se actualiza.
 *
 * @param {Object} dataMenu - Datos del menú a guardar o actualizar.
 * @param {Object} transaction - Transacción utilizada para ejecutar la operación de guardado/actualización.
 * @returns {Promise<Object>} El menú guardado o actualizado.
 * @throws {Error} Si ocurre algún problema durante el proceso de guardado o actualización.
 * @author  [Jose Romani] <jose.romani@hotmail.com>
 *
 */
const saveMenu = async (dataMenu, transaction, db) => {
    try {
 
        let menu
        
        // Crea nuevo menú
        if (!dataMenu.id || dataMenu.id === 0) {
 
            const lastOrder = await db.Menu.max('order', { transaction })
            const order = lastOrder ? lastOrder + 1 : 1
 
            const groupMenu = dataMenu.group_menu ?? 0
 
            menu = await db.Menu.create(
                {
                    ...dataMenu,
                    order,
                    group_menu: groupMenu
                },
                { transaction }
            )
 
            if (!dataMenu.sub_menu) {
                await menu.update(
                    { group_menu: menu.id },
                    { transaction }
                )
            }
 
        }else {
 
            menu = await db.Menu.findByPk(dataMenu.id, { transaction })
 
            if (!menu) {
                throw new Error('Menú no encontrado')
            }
 
            await menu.update(dataMenu, { transaction })
 
        }
 
        return menu
 
    } catch (error) {
        throw error
    }
}

/**
 * Guarda un menú en la base de datos. Si el menú ya existe, se actualiza.
 *
 * @param {Object} dataMenu - Datos del menú a guardar o actualizar.
 * @param {Object} transaction - Transacción utilizada para ejecutar la operación de guardado/actualización.
 * @returns {Promise<Object>} El menú guardado o actualizado.
 * @throws {Error} Si ocurre algún problema durante el proceso de guardado o actualización.
 * @author  [Jose Romani] <jose.romani@hotmail.com>
 *
 */
const listPermissionUser = async (data, db) => {
    try {
        const filters =
            data.type == 'id_user'
                ? {
                      [Op.or]: [
                          { [`${data.type}`]: data.id },
                          { id_profile: data.profile },
                      ],
                  }
                : { [`${data.type}`]: data.profile }
        const Menus = await db.Menu_selected.findAll({ where: filters })
        if (!Menus) throw new Error('No existe ningun reconectador')
        return Menus.map((menu) => menu.get({ plain: true }))
    } catch (error) {
        throw error
    }
}

/**
 * Guarda un menú en la base de datos. Si el menú ya existe, se actualiza.
 *
 * @param {Object} dataMenu - Datos del menú a guardar o actualizar.
 * @param {Object} transaction - Transacción utilizada para ejecutar la operación de guardado/actualización.
 * @returns {Promise<Object>} El menú guardado o actualizado.
 * @throws {Error} Si ocurre algún problema durante el proceso de guardado o actualización.
 * @author  [Jose Romani] <jose.romani@hotmail.com>
 *
 */
const saveMenu_Selected = async (dataMenu, transaction, db) => {
    try {
        const [Menu_selected, created] = await db.Menu_selected.findOrCreate({
            where: { id: dataMenu.id },
            defaults: { ...dataMenu },
            transaction,
        })
        if (!created) {
            await Menu_selected.update(dataMenu, { transaction })
        }
        return Menu_selected
    } catch (error) {
        throw error
    }
}

/**
 * Obtiene los perfiles con permiso para un menú específico.
 *
 * @param {number} id_menu - ID del menú.
 * @param {Object} db - Instancia de la base de datos (models).
 * @returns {Promise<Array<number>>} Array de id_profile.
 * @throws {Error} Si ocurre algún problema durante la consulta.
 * @author
 */

const getPermissionByMenuService = async (id_menu, db) => {
    try {
        const permissions = await db.Menu_selected.findAll({
            where: {
                id_menu,
                status: 1,
            },
            attributes: ['id_profile'],
        })

        if (!permissions) throw new Error('No existen permisos para este menú')

        return permissions.map((p) => p.id_profile)
    } catch (error) {
        throw error
    }
}

const postPermissionByMenuService = async (data, transaction, db) => {
    try {
        const { id_menu, profiles } = data

        // 1) Obtener permisos existentes del menú
        const existing = await db.Menu_selected.findAll({
            where: { id_menu },
            transaction,
        })

        const existingMap = new Map()
        existing.forEach((row) => {
            existingMap.set(row.id_profile, row)
        })

        const profilesSet = new Set(profiles)

        const operations = []

        // 2) Actualizar existentes
        for (const row of existing) {
            if (profilesSet.has(row.id_profile)) {
                // debe estar activo
                if (row.status !== true) {
                    operations.push(
                        row.update(
                            { status: true },
                            { transaction }
                        )
                    )
                }
            } else {
                // debe estar inactivo
                if (row.status !== false) {
                    operations.push(
                        row.update(
                            { status: false },
                            { transaction }
                        )
                    )
                }
            }
        }

        // 3) Crear los que no existen
        for (const id_profile of profiles) {
            if (!existingMap.has(id_profile)) {
                operations.push(
                    db.Menu_selected.create(
                        {
                            id_menu,
                            id_profile,
                            status: true,
                        },
                        { transaction }
                    )
                )
            }
        }

        await Promise.all(operations)

        return {
            id_menu,
            active_profiles: profiles,
            total_existing: existing.length,
            created: profiles.filter(p => !existingMap.has(p)).length,
            updated: operations.length,
        }
    } catch (error) {
        throw error
    }
}

module.exports = {
    getMenus,
    saveMenu,
    listPermissionUser,
    saveMenu_Selected,
    getPermissionByMenuService,
    postPermissionByMenuService
}
