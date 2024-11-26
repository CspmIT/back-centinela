'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('User_Columns', 'id_user', {
			type: Sequelize.INTEGER,
			references: {
				model: 'Users',
				key: 'id',
			},
			allowNull: false,
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		})
		await queryInterface.addColumn('User_Columns', 'id_columnsTable', {
			type: Sequelize.INTEGER,
			references: {
				model: 'ColumnsTables',
				key: 'id',
			},
			allowNull: false,
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		})
		await queryInterface.addColumn('ColumnsTables', 'id_table', {
			type: Sequelize.INTEGER,
			references: {
				model: 'Tables',
				key: 'id',
			},
			allowNull: false,
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('User_Columns', 'id_user')
		await queryInterface.removeColumn('User_Columns', 'id_columnsTable')
		await queryInterface.removeColumn('ColumnsTables', 'id_table')
	},
}
