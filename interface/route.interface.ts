export interface ILocation {
	ip?: string;
	city?: string;
	country?: string;
	code?: string;
	r1?: string;
	r2?: string;
	r3?: string;
	lat?: number;
	long?: number;
	net?: string;
}

export interface IWeatherRouteResponse {
	city?: string;
	temp?: number;
	yesterday_temp?: number;
	sky?: number;
	pty?: number;
	pop?: number;
	rn1?: number;
	humidity?: number;
	pm10?: number | string;
	pm25?: number | string;
	hour?: number | string;
	weather_date?: string;
}

export interface IForecastRouteResponse {
	categories: string[];
	rainProbData: number[];
	humidityData: number[];
	tempData: number[];
	condition: number[][];
}
