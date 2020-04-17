import { Model, DataTypes, BuildOptions } from "sequelize";
import { sequelize } from "./index";
import date from "../../utils/date";

import { IWeatherData } from "../../interface/weather";

interface IWeatherModel extends Model {
	city?: string;
	temp?: number;
	yesterday_temp?: number;
	max_temp?: number;
	min_tamp?: number;
	sky?: number;
	pty?: number;
	pop?: number;
	rn1?: number;
	humidity?: number;
	lgt?: number;
	hour?: string;
	weather_date?: string;
	type?: string;
}

type IWeatherModelStatic = typeof Model & {
	new (values?: object, options?: BuildOptions): IWeatherModel;
};

export const WeatherModel = <IWeatherModelStatic>sequelize.define(
	"weather",
	{
		city: {
			type: DataTypes.STRING(20),
			allowNull: false,
		},
		temp: {
			type: DataTypes.FLOAT,
			allowNull: true,
		},
		max_temp: {
			type: DataTypes.FLOAT,
			allowNull: true,
		},
		min_temp: {
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
		rn1: {
			type: DataTypes.FLOAT,
			allowNull: true,
		},
		humidity: {
			type: DataTypes.FLOAT,
			allowNull: true,
		},
		lgt: {
			type: DataTypes.INTEGER,
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
	},
	{ updatedAt: false },
);

const fillCurrentWeatherColumn = async (
	response: IWeatherData,
	currentDate: string,
	currentTime: string,
	currentMinute: string,
): Promise<IWeatherData> => {
	const weather = response;

	const shortForecast = await WeatherModel.findOne({
		where: {
			city: weather.city,
		},
		order: [["weather_date", "ASC"]],
		attributes: ["sky", "pty", "lgt"],
	});

	const midForecast = await WeatherModel.findOne({
		where: {
			city: weather.city,
		},
		order: [["weather_date", "ASC"]],
		attributes: ["max_temp", "min_temp", "pop"],
	});

	const yesterdayWeather = await WeatherModel.findOne({
		where: {
			city: weather.city,
			weather_date: date.yesterdayDateQuery(currentDate, currentTime, currentMinute),
		},
		attributes: ["temp"],
	});

	if (shortForecast) {
		weather.sky = shortForecast.sky;
		weather.pty = shortForecast.pty;
		weather.lgt = shortForecast.lgt;
	}

	if (midForecast) {
		weather["max_temp"] = midForecast["max_temp"];
		weather["min_temp"] = midForecast["min_temp"];
		weather.pop = midForecast.pop;
	}

	if (yesterdayWeather) {
		weather.yesterday_temp = yesterdayWeather.temp;
	}

	return weather;
};

export const updateOrCreateCurrentWeather = async (
	response: IWeatherData,
	currentDate: string,
	currentTime: string,
	currentMinute: string,
): Promise<void> => {
	const weather = await WeatherModel.findOne({
		where: {
			city: response.city,
			weather_date: response.weather_date,
		},
	});

	if (!weather) {
		const result = await fillCurrentWeatherColumn(response, currentDate, currentTime, currentMinute);

		await WeatherModel.create(result);
	}
};
