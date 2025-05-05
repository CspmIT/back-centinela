'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('InfluxVars', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			name: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			unit: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			type: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			calc: {
				allowNull: false,
				comment: '1: Tiene calculo, 0: No tiene calculo',
				type: Sequelize.BOOLEAN,
			},
			varsInflux: {
				allowNull: false,
				type: Sequelize.JSON,
			},
			equation: {
				allowNull: true,
				type: Sequelize.JSON,
			},
			status: {
				allowNull: false,
				type: Sequelize.BOOLEAN,
				defaultValue: 1,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		})
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('InfluxVars')
	},
}
