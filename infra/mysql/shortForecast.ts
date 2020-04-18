import { Model, DataTypes, BuildOptions } from "sequelize";
import { sequelize } from "./index";

import { IShortForecastData } from "../../interface";

interface IShortForecast extends Model {
	city?: string;
	temp?: number;
	sky?: number;
	pty?: number;
	rn1?: number;
	lgt?: number;
	humidity?: number;
	hour?: string;
	weather_date?: string;
}

type IShortForecastStatic = typeof Model & {
	new (values?: object, options?: BuildOptions): IShortForecast;
};

export const ShortForecast = <IShortForecastStatic>sequelize.define(
	"shortForecast",
	{
		city: {
			type: DataTypes.STRING(20),
			allowNull: false,
		},
		temp: {
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
		rn1: {
			type: DataTypes.INTEGER,
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

const fillShortForecastEmptyColumn = async (response: IShortForecastData): Promise<IShortForecastData> => {
	const shortForecast = await ShortForecast.findOne({
		where: {
			city: response.city,
		},
		order: [["weather_date", "DESC"]],
		attributes: ["temp", "pty", "rn1", "humidity", "sky", "lgt"],
	});

	Object.keys(response).forEach((key) => {
		const weatherData = Number(response[key]);

		if (weatherData < -900 || weatherData > 900) {
			response[key] = shortForecast[key];
		}
	});

	return response;
};

export const updateOrCreateShortForecast = async (response: IShortForecastData, weatherDate: string): Promise<void> => {
	const shortForecast = await ShortForecast.findOne({
		where: {
			city: response.city,
			weather_date: weatherDate,
		},
	});

	const { temp, pty, rn1, humidity, sky, lgt } = response;

	const validated = [temp, pty, rn1, humidity, sky, lgt].every((el) => Number(el) < 900 && Number(el) > -900);

	if (!validated) {
		response = await fillShortForecastEmptyColumn(response);
	}

	if (shortForecast) {
		await shortForecast.update(response);
	} else {
		await ShortForecast.create(response);
	}
};
