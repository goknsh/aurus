module.exports = (sequelize, DataTypes) => {
	return sequelize.define("templates", {
		id: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
			primaryKey: true,
			minLength: 6,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		region: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		icon: {
			type: DataTypes.STRING,
		},
		defaultMessageNotifications: {
			type: DataTypes.STRING || DataTypes.NUMBER
		},
		verificationLevel: {
			type: DataTypes.NUMBER,
			allowNull: false,
		},
		afkTimeout: {
			type: DataTypes.NUMBER,
		},
		explicitContentFilter: {
			type: DataTypes.NUMBER,
			allowNull: false,
		},
		banner: {
			type: DataTypes.STRING,
		},
		splash: {
			type: DataTypes.STRING,
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
		uses: {
			type: DataTypes.STRING,
			defaultValue: 0,
		},
		createdAt: {
			type: DataTypes.TIME,
		},
		updatedAt: {
			type: DataTypes.TIME,
		},
	});
};
