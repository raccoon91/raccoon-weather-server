import { Model, DataTypes, BuildOptions } from "sequelize";
import { sequelize } from "./index";

import { IShortForecastData } from "../../interface/weather";

interface IShortForecast extends Model {
	city?: string;
	temp?: number;
	sky?: number;
	pty?: number;
	rn1?: number;
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

export const updateOrCreateShortForecast = async (response: IShortForecastData, weatherDate: string): Promise<void> => {
	const shortForecast = await ShortForecast.findOne({
		where: {
			city: response.city,
			weather_date: weatherDate,
		},
	});

	if (shortForecast) {
		await shortForecast.update(response);
	} else {
		await ShortForecast.create(response);
	}
};
