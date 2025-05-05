'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('DiagramImages', {
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
			name: { type: Sequelize.STRING },
			src: { type: Sequelize.STRING },
			left: { type: Sequelize.INTEGER },
			top: { type: Sequelize.INTEGER },
			angle: { type: Sequelize.DECIMAL(5, 2) },
			width: { type: Sequelize.DECIMAL(5, 2) },
			height: { type: Sequelize.DECIMAL(5, 2) },
			status: { type: Sequelize.BOOLEAN },
			statusText: { type: Sequelize.BOOLEAN },
			text: { type: Sequelize.STRING },
			sizeText: { type: Sequelize.INTEGER },
			colorText: { type: Sequelize.STRING },
			backgroundText: { type: Sequelize.STRING },
			textPosition: { type: Sequelize.STRING },
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
		await queryInterface.dropTable('DiagramImages')
	},
}
