import { Model, DataTypes, BuildOptions } from "sequelize";
import { sequelize } from "./index";

import { IMidForecastData } from "../../interface";

interface IMidForecast extends Model {
	city?: string;
	t3h?: number;
	max_temp?: number;
	min_temp?: number;
	sky?: number;
	pty?: number;
	pop?: number;
	humidity?: number;
	hour?: string;
	weather_date?: string;
}

type IMidForecastStatic = typeof Model & {
	new (values?: object, options?: BuildOptions): IMidForecast;
};

export const MidForecast = <IMidForecastStatic>sequelize.define(
	"midForecast",
	{
		city: {
			type: DataTypes.STRING(20),
			allowNull: false,
		},
		t3h: {
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
	},
	{ updatedAt: false },
);

const fillMidForecastEmptyColumn = async (response: IMidForecastData): Promise<IMidForecastData> => {
	const midForecast = await MidForecast.findOne({
		where: {
			city: response.city,
		},
		order: [["weather_date", "DESC"]],
		attributes: ["pop", "pty", "humidity", "sky", "t3h"],
	});

	Object.keys(response).forEach((key) => {
		const weatherData = Number(response[key]);

		if (weatherData < -900 || weatherData > 900) {
			response[key] = midForecast[key];
		}
	});

	return response;
};

export const updateOrCreateMidForecast = async (response: IMidForecastData, weatherDate: string): Promise<void> => {
	const midForecast = await MidForecast.findOne({
		where: {
			city: response.city,
			weather_date: weatherDate,
		},
	});

	const { pop, pty, humidity, sky, t3h } = response;

	const validated = [pop, pty, humidity, sky, t3h].every((el) => Number(el) < 900 && Number(el) > -900);

	if (!validated) {
		response = await fillMidForecastEmptyColumn(response);
	}

	if (midForecast) {
		await midForecast.update(response);
	} else {
		await MidForecast.create(response);
	}
};
