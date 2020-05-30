import { Model, DataTypes, BuildOptions } from "sequelize";
import { sequelize } from "./index";

import { IPollutionData } from "../../interface";

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

export const AirPollutionModel = <IAirPollutionModelStatic>sequelize.define("airpollution", {
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

export const bulkUpdateOrCreateAirPollution = async (response: IPollutionData[]): Promise<void> => {
  for (let i = 0; i < response.length; i++) {
    const airPollution = response[i];

    const weather = await AirPollutionModel.findOne({
      where: {
        city: airPollution.city,
        air_date: airPollution.air_date,
      },
    });

    if (weather) {
      await weather.update(airPollution);
    } else {
      await AirPollutionModel.create(airPollution);
    }
  }
};

export const bulkUpdateOrCreateAirForecast = async (response: IPollutionData[]): Promise<void> => {
  for (let i = 0; i < response.length; i++) {
    const airForecast = response[i];

    const weather = await AirPollutionModel.findOne({
      where: {
        city: airForecast.city,
        air_date: airForecast.air_date,
      },
    });

    if (weather) {
      if (weather.type !== "current") {
        weather.update(airForecast);
      }
    } else {
      AirPollutionModel.create(airForecast);
    }
  }
};
