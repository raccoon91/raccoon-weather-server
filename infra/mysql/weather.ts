import { Model, DataTypes, BuildOptions, Op } from "sequelize";
import { sequelize, ShortForecast, MidForecast } from "./index";

import { IWeatherData } from "../../interface";
import date from "../../utils/date";

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

const buildCurrentWeatherColumn = async (
	response: IWeatherData,
	currentDate: string,
	currentTime: string,
	currentMinute: string,
): Promise<IWeatherData> => {
	const weather = response;
	const [forecastDate, forecastTime] = weather.weather_date.split(" ");
	const forecastHour = forecastTime.split(":")[0];

	const shortForecast = await ShortForecast.findOne({
		where: {
			city: weather.city,
			weather_date: date.format(`${currentDate} ${currentTime}`, "YYYY-MM-DD HH:00:00"),
		},
		attributes: ["sky", "lgt"],
	});

	const midForecast = await MidForecast.findOne({
		where: {
			city: weather.city,
			weather_date: { [Op.gte]: date.format(`${currentDate} ${currentTime}`, "YYYY-MM-DD HH:00:00") },
		},
		order: [["weather_date", "ASC"]],
		attributes: ["max_temp", "min_temp", "pop"],
	});

	if (forecastHour !== "15") {
		const midForecastMaxTemp = await MidForecast.findOne({
			where: {
				city: weather.city,
				weather_date: `${forecastDate} 15`,
			},
			attributes: ["max_temp"],
		});

		if (midForecastMaxTemp) {
			midForecast.max_temp = midForecastMaxTemp.max_temp;
		}
	}

	if (forecastHour !== "06") {
		const midForecastMinTemp = await MidForecast.findOne({
			where: {
				city: weather.city,
				weather_date: `${forecastDate} 06`,
			},
			attributes: ["min_temp"],
		});

		if (midForecastMinTemp) {
			midForecast.min_temp = midForecastMinTemp.min_temp;
		}
	}

	const yesterdayWeather = await WeatherModel.findOne({
		where: {
			city: weather.city,
			weather_date: date.format(
				date.yesterday(`${currentDate} ${currentTime.slice(0, 2)}${currentMinute}`),
				"YYYY-MM-DD HH:mm:00",
			),
		},
		attributes: ["temp"],
	});

	if (shortForecast) {
		weather.sky = shortForecast.sky;
		weather.lgt = shortForecast.lgt;
	}

	if (midForecast) {
		weather.pop = midForecast.pop;
		weather.max_temp = midForecast.max_temp;
		weather.min_temp = midForecast.min_temp;
	}

	if (yesterdayWeather) {
		weather.yesterday_temp = yesterdayWeather.temp;
	}

	return weather;
};

const fillCurrentWeatherEmptyColumn = async (response: IWeatherData): Promise<IWeatherData> => {
	const weather = await WeatherModel.findOne({
		where: {
			city: response.city,
		},
		order: [["weather_date", "DESC"]],
		attributes: ["temp", "pty", "humidity", "rn1"],
	});

	Object.keys(response).forEach((key) => {
		const weatherData = Number(response[key]);

		if (weatherData < -900 || weatherData > 900) {
			response[key] = weather[key];
		}
	});

	return response;
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
		const { temp, pty, rn1, humidity } = response;

		const validated = [temp, pty, rn1, humidity].every((el) => Number(el) < 900 && Number(el) > -900);

		if (!validated) {
			response = await fillCurrentWeatherEmptyColumn(response);
		}

		response = await buildCurrentWeatherColumn(response, currentDate, currentTime, currentMinute);

		await WeatherModel.create(response);
	}
};
