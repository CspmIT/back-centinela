'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('DiagramLines', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			id_diagram: {
				type: Sequelize.INTEGER,
				references: {
					model: 'Diagrams',
					key: 'id',
				},
				allowNull: false,
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE',
			},
			points: { type: Sequelize.JSON },
			stroke: { type: Sequelize.STRING },
			strokeWidth: { type: Sequelize.INTEGER },
			dobleLine: { type: Sequelize.BOOLEAN },
			colorSecondary: { type: Sequelize.STRING },
			animation: { type: Sequelize.BOOLEAN },
			invertAnimation: { type: Sequelize.BOOLEAN },
			status: { type: Sequelize.BOOLEAN },
			showText: { type: Sequelize.BOOLEAN },
			text: { type: Sequelize.STRING },
			sizeText: { type: Sequelize.INTEGER },
			colorText: { type: Sequelize.STRING },
			backgroundText: { type: Sequelize.STRING },
			locationText: { type: Sequelize.STRING },
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
		await queryInterface.dropTable('DiagramLines')
	},
}
