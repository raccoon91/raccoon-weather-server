import { Model, DataTypes, BuildOptions } from "sequelize";
import { sequelize } from "./index";

interface IAirPollutionModel extends Model {
	city: string;
	pm10: string;
	pm25: string;
	air_date: Date;
	type: string;
}

type IAirPollutionModelStatic = typeof Model & {
	new (values?: object, options?: BuildOptions): IAirPollutionModel;
};

const AirPollutionModel = <IAirPollutionModelStatic>sequelize.define("airpollution", {
	city: {
		type: DataTypes.STRING(20),
		allowNull: false,
	},
	pm10: {
		type: DataTypes.STRING(5),
		allowNull: false,
	},
	pm25: {
		type: DataTypes.STRING(5),
		allowNull: false,
	},
	air_date: {
		type: DataTypes.DATEONLY,
		allowNull: false,
	},
	type: {
		type: DataTypes.STRING(10),
		allowNull: false,
	},
});

export default AirPollutionModel;

// module.exports = (sequelize, DataTypes) => {
// 	return sequelize.define(
// 		"airpollution",
// 		{
// 			city: {
// 				type: DataTypes.STRING(20),
// 				allowNull: false,
// 			},
// 			pm10: {
// 				type: DataTypes.STRING(5),
// 				allowNull: false,
// 			},
// 			pm25: {
// 				type: DataTypes.STRING(5),
// 				allowNull: false,
// 			},
// 			air_date: {
// 				type: DataTypes.DATEONLY,
// 				allowNull: false,
// 			},
// 			type: {
// 				type: DataTypes.STRING(10),
// 				allowNull: false,
// 			},
// 		},
// 		{
// 			createdAt: false,
// 			updatedAt: false,
// 		},
// 	);
// };
