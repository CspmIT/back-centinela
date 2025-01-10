'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('DiagramImageData', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			id_image: {
				type: Sequelize.INTEGER,
				references: {
					model: 'DiagramImages',
					key: 'id',
				},
				allowNull: false,
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE',
			},
			id_influxvars: {
				type: Sequelize.INTEGER,
				references: {
					model: 'InfluxVars',
					key: 'id',
				},
				allowNull: false,
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE',
			},
			name_var: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			show_var: {
				allowNull: false,
				type: Sequelize.BOOLEAN,
				defaultValue: 1,
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
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
		await queryInterface.dropTable('DiagramImageData')
	},
}
