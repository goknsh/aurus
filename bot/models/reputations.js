module.exports = (sequelize, DataTypes) => {
	return sequelize.define("reputations", {
		id: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
			primaryKey: true,
		},
		upvotes: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		downvotes: {
			type: DataTypes.INTEGER,
			allowNull: false,
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
