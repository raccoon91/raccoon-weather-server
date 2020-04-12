import { Model, DataTypes, BuildOptions, Op } from "sequelize";
import { sequelize } from "./index";
import date from "../../utils/date";

import { IWeatherData } from "../../interface/weather";

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

export const WeatherModel = <IWeatherModelStatic>sequelize.define("weather", {
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

const fillCurrentWeatherColumn = async (response: IWeatherData, yesterday, currentTime): Promise<IWeatherData> => {
	let weather = await WeatherModel.findOne({
		where: {
			city: response.city,
			type: "short",
		},
		order: [["weather_date", "ASC"]],
		attributes: ["sky", "pty", "pop"],
	});

	if (!weather) {
		weather = await WeatherModel.findOne({
			where: {
				city: response.city,
				type: "mid",
			},
			order: [["weather_date", "ASC"]],
			attributes: ["sky", "pty", "pop"],
		});
	}

	const yesterdayWeather = await WeatherModel.findOne({
		where: {
			city: response.city,
			weather_date: date.dateQuery(yesterday, currentTime),
		},
	});

	if (weather) {
		const weatherData = weather;

		response.sky = weatherData.sky;
		response.pty = weatherData.pty;
		response.pop = weatherData.pop;
	}

	if (yesterdayWeather) {
		const yesterdayData = yesterdayWeather;

		response.yesterday_temp = yesterdayData.temp;

		await yesterdayWeather.update({ type: "delete" });
	}

	return response;
};

export const changePastWeatherType = async (weatherDate: string) => {
	const pastWeather = await WeatherModel.findAll({
		where: {
			weather_date: {
				[Op.lt]: weatherDate,
			},
			type: "current",
		},
	});

	if (pastWeather && pastWeather.length) {
		for (let i = 0; i < pastWeather.length; i++) {
			if (pastWeather[i] && pastWeather[i].type !== "delete") {
				pastWeather[i].update({ type: "past" });
			}
		}
	}
};

export const updateOrCreateCurrentWeather = async (response: IWeatherData, yesterday: string, currentTime: string) => {
	const weather = await WeatherModel.findOne({
		where: {
			city: response.city,
			weather_date: response.weather_date,
		},
	});

	// fillCurrentWeatherColumn(response, yesterday, currentTime);

	if (weather) {
		let result = response;

		if (!weather.yesterday_temp) {
			result = await fillCurrentWeatherColumn(response, yesterday, currentTime);
		}

		weather.update(result);
	} else {
		const result = await fillCurrentWeatherColumn(response, yesterday, currentTime);

		WeatherModel.create(result);
	}
};

const fillShortForecastColumn = async (response: IWeatherData, weatherDate: string): Promise<IWeatherData> => {
	const weather = await WeatherModel.findOne({
		where: {
			city: response.city,
			type: "short",
		},
		order: [["weather_date", "ASC"]],
		attributes: ["pop"],
	});

	const yesterdayWeather = await WeatherModel.findOne({
		where: {
			city: response.city,
			weather_date: date.yesterday(weatherDate),
		},
	});

	if (weather) {
		const weatherData = weather;

		response.pop = weatherData.pop;
	}

	if (yesterdayWeather) {
		const yesterdayData = yesterdayWeather;

		response.yesterday_temp = yesterdayData.temp;
	}

	return response;
};

export const updateOrCreateShortForecast = async (response: IWeatherData, weatherDate: string) => {
	const weather = await WeatherModel.findOne({
		where: {
			city: response.city,
			weather_date: weatherDate,
		},
	});

	if (weather) {
		let result = response;

		if (!weather.yesterday_temp) {
			result = await fillShortForecastColumn(response, weatherDate);
		}

		weather.update(result);
	} else {
		const result = await fillShortForecastColumn(response, weatherDate);

		WeatherModel.create(result);
	}
};

const fillMidForecastColumn = async (response: IWeatherData, weatherDate: string): Promise<IWeatherData> => {
	const yesterdayWeather = await WeatherModel.findOne({
		where: {
			city: response.city,
			weather_date: date.yesterday(weatherDate),
		},
	});

	if (yesterdayWeather) {
		const yesterdayData = yesterdayWeather;

		response.yesterday_temp = yesterdayData.temp;
	}

	return response;
};

export const updateOrCreateMidForecast = async (response: IWeatherData, weatherDate: string) => {
	const weather = await WeatherModel.findOne({
		where: {
			city: response.city,
			weather_date: weatherDate,
		},
	});

	if (weather) {
		let result = response;

		if (!weather.yesterday_temp) {
			result = await fillMidForecastColumn(response, weatherDate);
		}

		weather.update(result);
	} else {
		const result = await fillMidForecastColumn(response, weatherDate);

		WeatherModel.create(result);
	}
};
