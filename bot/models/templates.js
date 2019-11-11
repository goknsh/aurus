module.exports = (sequelize, DataTypes) => {
	return sequelize.define("templates", {
		id: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
			primaryKey: true,
			minLength: 6,
		},
		guildId: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		channels: {
			type: DataTypes.JSON,
		},
		emojis: {
			type: DataTypes.JSON,
		},
		roles: {
			type: DataTypes.JSON,
		},
		createdAt: {
			type: DataTypes.TIME,
		},
		updatedAt: {
			type: DataTypes.TIME,
		},
	});
};
