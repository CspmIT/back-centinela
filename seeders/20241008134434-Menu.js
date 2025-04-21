'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const date = new Date()
        await queryInterface.bulkInsert(
            'Menus',
            [
                {
                    name: 'Dashboard',
                    link: 'home',
                    icon: 'FaTachometerAlt',
                    level: '1',
                    group_menu: '1',
                    sub_menu: null,
                    status: '1',
                    order: 1,
                    createdAt: date,
                    updatedAt: date,
                },
                {
                    name: 'Configuración',
                    link: null,
                    icon: 'FaCogs',
                    level: '1',
                    group_menu: '2',
                    sub_menu: null,
                    status: '1',
                    order: 2,
                    createdAt: date,
                    updatedAt: date,
                },
                {
                    name: 'Accesos',
                    link: 'config/menu',
                    icon: 'BsFillMenuButtonWideFill',
                    level: '2',
                    group_menu: '2',
                    sub_menu: '2',
                    status: '1',
                    order: 3,
                    createdAt: date,
                    updatedAt: date,
                },
                {
                    name: 'Graficos',
                    link: 'config/allGraphic',
                    icon: 'FaChartLine',
                    level: '2',
                    group_menu: '2',
                    sub_menu: '2',
                    status: '1',
                    order: 4,
                    createdAt: date,
                    updatedAt: date,
                },
                {
                    name: 'Diagramas',
                    link: 'config/diagram',
                    icon: 'BsFillDiagram3Fill',
                    level: '2',
                    group_menu: '2',
                    sub_menu: '2',
                    status: '1',
                    order: 5,
                    createdAt: date,
                    updatedAt: date,
                },
                {
                    name: 'Variables',
                    link: 'config/vars',
                    icon: 'HiVariable',
                    level: '2',
                    group_menu: '2',
                    sub_menu: '2',
                    status: '1',
                    order: 6,
                    createdAt: date,
                    updatedAt: date,
                },
            ],
            {}
        )
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Menus', null, {})
    },
}
