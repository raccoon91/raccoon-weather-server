import { Model, DataTypes, BuildOptions } from "sequelize";
import { sequelize } from "./index";

interface IWeatherModel extends Model {
	city: string;
	temp: number;
	yesterday_temp: number;
	sky: number;
	pty: number;
	pop: number;
	humidity: number;
	hour: string;
	weather_date: Date;
	type: string;
}

type IWeatherModelStatic = typeof Model & {
	new (values?: object, options?: BuildOptions): IWeatherModel;
};

const WeatherModel = <IWeatherModelStatic>sequelize.define("weather", {
	city: {
		type: DataTypes.STRING(20),
		allowNull: false,
	},
	temp: {
		type: DataTypes.FLOAT,
		allowNull: true,
	},
	yesterday_temp: {
		type: DataTypes.FLOAT,
		allowNull: true,
	},
	sky: {
		type: DataTypes.INTEGER,
		allowNull: true,
	},
	pty: {
		type: DataTypes.INTEGER,
		allowNull: true,
	},
	pop: {
		type: DataTypes.INTEGER,
		allowNull: true,
	},
	humidity: {
		type: DataTypes.FLOAT,
		allowNull: true,
	},
	hour: {
		type: DataTypes.STRING(5),
		allowNull: false,
	},
	weather_date: {
		type: DataTypes.DATE,
		allowNull: false,
		unique: false,
	},
	type: {
		type: DataTypes.STRING(10),
		allowNull: false,
	},
});

export default WeatherModel;
