const { prefix } = require("./../start");

module.exports = (sequelize, DataTypes) => {
	return sequelize.define("guilds", {
		id: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
			primaryKey: true,
		},
		prefix: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: prefix,
		},
	}, {
		timestamps: false,
	});
};
