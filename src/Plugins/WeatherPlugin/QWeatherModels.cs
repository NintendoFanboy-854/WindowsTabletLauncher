namespace WeatherPlugin;

// ---- shared ----

public sealed class QMetadata
{
    public string? Tag { get; set; }
    public List<string>? Attributions { get; set; }
    public bool? ZeroResult { get; set; }
}

public sealed class QValueUnit
{
    public double? Value { get; set; }
    public string? Unit { get; set; }
}

public sealed class QColor
{
    public string? Code { get; set; }
    public double? Red { get; set; }
    public double? Green { get; set; }
    public double? Blue { get; set; }
    public double? Alpha { get; set; }
}

public sealed class QCondition
{
    public string? Text { get; set; }
    public string? Code { get; set; }
}

public sealed class QWindDirection
{
    public double? Degree { get; set; }
    public string? Compass { get; set; }
}

public sealed class QWind
{
    public QWindDirection? Direction { get; set; }
    public QValueUnit? Speed { get; set; }
    public double? Scale { get; set; }
}

public sealed class QPrecip
{
    public QValueUnit? Amount { get; set; }
    public QValueUnit? Intensity { get; set; }
    public double? Probability { get; set; }
    public string? Type { get; set; }
}

/// <summary>和风新版 API 错误：HTTP 状态码 + application/problem+json。</summary>
public sealed class QProblemError
{
    public QProblemDetail? Error { get; set; }
}

public sealed class QProblemDetail
{
    public double? Status { get; set; }
    public string? Type { get; set; }
    public string? Title { get; set; }
    public string? Detail { get; set; }
    public List<string>? InvalidParams { get; set; }
}

public sealed class QWeatherApiException : Exception
{
    public int StatusCode { get; }
    public string? Title { get; }
    public string? Detail { get; }

    public QWeatherApiException(int statusCode, string title, string? detail)
        : base(detail is { Length: > 0 } ? $"[{statusCode}] {title}: {detail}" : $"[{statusCode}] {title}")
    {
        StatusCode = statusCode;
        Title = title;
        Detail = detail;
    }
}

// ---- GeoAPI ----

public sealed class QGeoLocation
{
    public string? Name { get; set; }
    public string? Id { get; set; }
    public string? Lat { get; set; }
    public string? Lon { get; set; }
    public string? Adm2 { get; set; }
    public string? Adm1 { get; set; }
    public string? Country { get; set; }
    public string? Tz { get; set; }
    public string? Type { get; set; }
    public string? Rank { get; set; }
    public string? FxLink { get; set; }

    public override string ToString() => string.IsNullOrEmpty(Adm1) || Adm1 == Name ? Name ?? "" : $"{Adm1} {Name}";
}

public sealed class QGeoLookupResponse
{
    public string? Code { get; set; }
    public List<QGeoLocation>? Location { get; set; }
}

public sealed class QGeoTopResponse
{
    public string? Code { get; set; }
    public List<QGeoLocation>? TopCityList { get; set; }
}

public sealed class QGeoPoiResponse
{
    public string? Code { get; set; }
    public List<QGeoLocation>? Poi { get; set; }
}

// ---- 天气预报 v1（坐标端点）----

public sealed class QCurrentWeather
{
    public QMetadata? Metadata { get; set; }
    public QCondition? Condition { get; set; }
    public QValueUnit? Temperature { get; set; }
    public QValueUnit? FeelsLike { get; set; }
    public double? Humidity { get; set; }
    public QWind? Wind { get; set; }
    public QValueUnit? WindGust { get; set; }
    public QPrecip? Precipitation { get; set; }
    public QValueUnit? Pressure { get; set; }
    public QValueUnit? Visibility { get; set; }
    public QValueUnit? DewPoint { get; set; }
    public double? CloudCover { get; set; }
    public double? UvIndex { get; set; }
}

public sealed class QDailyWeather
{
    public QMetadata? Metadata { get; set; }
    public List<QDailyDay>? Days { get; set; }
}

public sealed class QAstro
{
    public string? Sunrise { get; set; }
    public string? Sunset { get; set; }
    public string? Moonrise { get; set; }
    public string? Moonset { get; set; }
    public string? MoonPhase { get; set; }
}

public sealed class QDailyDay
{
    public string? ForecastStartTime { get; set; }
    public string? ForecastEndTime { get; set; }
    public QAstro? Astro { get; set; }
    public QValueUnit? TemperatureMax { get; set; }
    public QValueUnit? TemperatureMin { get; set; }
    public QValueUnit? TemperatureAvg { get; set; }
    public double? UvIndexMax { get; set; }
    public QDayPart? Daytime { get; set; }
    public QDayPart? Nighttime { get; set; }
}

public sealed class QDayPart
{
    public string? ForecastStartTime { get; set; }
    public string? ForecastEndTime { get; set; }
    public QCondition? Condition { get; set; }
    public QValueUnit? TemperatureMax { get; set; }
    public QValueUnit? TemperatureMin { get; set; }
    public double? Humidity { get; set; }
    public QWind? Wind { get; set; }
    public QValueUnit? WindGustMax { get; set; }
    public QPrecip? Precipitation { get; set; }
    public double? CloudCover { get; set; }
}

public sealed class QHourlyWeather
{
    public QMetadata? Metadata { get; set; }
    public List<QHourlyHour>? Hours { get; set; }
}

public sealed class QHourlyHour
{
    public string? ForecastTime { get; set; }
    public QCondition? Condition { get; set; }
    public QValueUnit? Temperature { get; set; }
    public QValueUnit? FeelsLike { get; set; }
    public double? Humidity { get; set; }
    public QWind? Wind { get; set; }
    public QValueUnit? WindGust { get; set; }
    public QPrecip? Precipitation { get; set; }
    public QValueUnit? Pressure { get; set; }
    public QValueUnit? Visibility { get; set; }
    public QValueUnit? DewPoint { get; set; }
    public double? CloudCover { get; set; }
    public double? UvIndex { get; set; }
}

// ---- 天气预报 v7（LocationID 城市端点，旧版）----

public abstract class QV7Response
{
    public string? Code { get; set; }
    public string? UpdateTime { get; set; }
    public string? FxLink { get; set; }
}

public sealed class QV7NowResponse : QV7Response
{
    public QV7Now? Now { get; set; }
}

public sealed class QV7Now
{
    public string? ObsTime { get; set; }
    public string? Temp { get; set; }
    public string? FeelsLike { get; set; }
    public string? Icon { get; set; }
    public string? Text { get; set; }
    public string? Wind360 { get; set; }
    public string? WindDir { get; set; }
    public string? WindScale { get; set; }
    public string? WindSpeed { get; set; }
    public string? Humidity { get; set; }
    public string? Precip { get; set; }
    public string? Pressure { get; set; }
    public string? Vis { get; set; }
    public string? Cloud { get; set; }
    public string? Dew { get; set; }
}

public sealed class QV7DailyResponse : QV7Response
{
    public List<QV7Day>? Daily { get; set; }
}

public sealed class QV7Day
{
    public string? FxDate { get; set; }
    public string? TempMax { get; set; }
    public string? TempMin { get; set; }
    public string? IconDay { get; set; }
    public string? TextDay { get; set; }
    public string? IconNight { get; set; }
    public string? TextNight { get; set; }
    public string? Wind360Day { get; set; }
    public string? WindDirDay { get; set; }
    public string? WindScaleDay { get; set; }
    public string? WindSpeedDay { get; set; }
    public string? Wind360Night { get; set; }
    public string? WindDirNight { get; set; }
    public string? WindScaleNight { get; set; }
    public string? WindSpeedNight { get; set; }
    public string? Humidity { get; set; }
    public string? Precip { get; set; }
    public string? Pressure { get; set; }
    public string? Vis { get; set; }
    public string? Cloud { get; set; }
    public string? UvIndex { get; set; }
}

public sealed class QV7HourlyResponse : QV7Response
{
    public List<QV7Hour>? Hourly { get; set; }
}

public sealed class QV7Hour
{
    public string? FxTime { get; set; }
    public string? Temp { get; set; }
    public string? Icon { get; set; }
    public string? Text { get; set; }
    public string? Wind360 { get; set; }
    public string? WindDir { get; set; }
    public string? WindScale { get; set; }
    public string? WindSpeed { get; set; }
    public string? Humidity { get; set; }
    public string? Pop { get; set; }
    public string? Precip { get; set; }
    public string? Pressure { get; set; }
    public string? Cloud { get; set; }
    public string? Dew { get; set; }
}

// ---- 分钟预报 ----

public sealed class QV7MinutelyResponse : QV7Response
{
    public string? Summary { get; set; }
    public List<QMinutelyItem>? Minutely { get; set; }
}

public sealed class QMinutelyItem
{
    public string? FxTime { get; set; }
    public string? Precip { get; set; }
    public string? Type { get; set; }
}

// ---- 预警 ----

public sealed class QAlertResponse
{
    public QMetadata? Metadata { get; set; }
    public List<QAlert>? Alerts { get; set; }
}

public sealed class QAlertMessageType
{
    public string? Code { get; set; }
    public List<string>? Supersedes { get; set; }
}

public sealed class QAlertEventType
{
    public string? Name { get; set; }
    public string? Code { get; set; }
}

public sealed class QAlert
{
    public string? Id { get; set; }
    public string? SenderName { get; set; }
    public string? IssuedTime { get; set; }
    public QAlertMessageType? MessageType { get; set; }
    public QAlertEventType? EventType { get; set; }
    public string? Urgency { get; set; }
    public string? Severity { get; set; }
    public string? Certainty { get; set; }
    public string? Icon { get; set; }
    public QColor? Color { get; set; }
    public string? EffectiveTime { get; set; }
    public string? OnsetTime { get; set; }
    public string? ExpireTime { get; set; }
    public string? Headline { get; set; }
    public string? Description { get; set; }
    public string? Criteria { get; set; }
    public string? Instruction { get; set; }
}

// ---- 天气指数 ----

public sealed class QV7IndicesResponse : QV7Response
{
    public List<QIndicesItem>? Daily { get; set; }
}

public sealed class QIndicesItem
{
    public string? Date { get; set; }
    public string? Type { get; set; }
    public string? Name { get; set; }
    public string? Level { get; set; }
    public string? Category { get; set; }
    public string? Text { get; set; }
}

// ---- 空气质量 ----

public sealed class QAirResponse
{
    public QMetadata? Metadata { get; set; }
    public List<QAirIndex>? Indexes { get; set; }
    public List<QPollutant>? Pollutants { get; set; }
    public List<QAirStation>? Stations { get; set; }
}

public sealed class QPollutantRef
{
    public string? Code { get; set; }
    public string? Name { get; set; }
    public string? FullName { get; set; }
}

public sealed class QAirHealth
{
    public string? Effect { get; set; }
    public QAirAdvice? Advice { get; set; }
}

public sealed class QAirAdvice
{
    public string? GeneralPopulation { get; set; }
    public string? SensitivePopulation { get; set; }
}

public sealed class QAirIndex
{
    public string? Code { get; set; }
    public string? Name { get; set; }
    public double? Aqi { get; set; }
    public string? AqiDisplay { get; set; }
    public string? Level { get; set; }
    public string? Category { get; set; }
    public QColor? Color { get; set; }
    public QPollutantRef? PrimaryPollutant { get; set; }
    public QAirHealth? Health { get; set; }
}

public sealed class QSubIndex
{
    public string? Code { get; set; }
    public double? Aqi { get; set; }
    public string? AqiDisplay { get; set; }
}

public sealed class QPollutant
{
    public string? Code { get; set; }
    public string? Name { get; set; }
    public string? FullName { get; set; }
    public QValueUnit? Concentration { get; set; }
    public List<QSubIndex>? SubIndexes { get; set; }
}

public sealed class QAirStation
{
    public string? Id { get; set; }
    public string? Name { get; set; }
}

public sealed class QAirHourlyResponse
{
    public QMetadata? Metadata { get; set; }
    public List<QAirHour>? Hours { get; set; }
}

public sealed class QAirHour
{
    public string? ForecastTime { get; set; }
    public List<QAirIndex>? Indexes { get; set; }
    public List<QPollutant>? Pollutants { get; set; }
}

public sealed class QAirDailyResponse
{
    public QMetadata? Metadata { get; set; }
    public List<QAirDay>? Days { get; set; }
}

public sealed class QAirDay
{
    public string? ForecastStartTime { get; set; }
    public string? ForecastEndTime { get; set; }
    public List<QAirIndex>? Indexes { get; set; }
    public List<QPollutant>? Pollutants { get; set; }
}

// ---- 时光机（历史天气）----

public sealed class QV7HistoricalResponse : QV7Response
{
    public QHistoricalDaily? WeatherDaily { get; set; }
    public List<QHistoricalHour>? WeatherHourly { get; set; }
}

public sealed class QHistoricalDaily
{
    public string? Date { get; set; }
    public string? Sunrise { get; set; }
    public string? Sunset { get; set; }
    public string? Moonrise { get; set; }
    public string? Moonset { get; set; }
    public string? MoonPhase { get; set; }
    public string? TempMax { get; set; }
    public string? TempMin { get; set; }
    public string? Humidity { get; set; }
    public string? Precip { get; set; }
    public string? Pressure { get; set; }
}

public sealed class QHistoricalHour
{
    public string? Time { get; set; }
    public string? Temp { get; set; }
    public string? Icon { get; set; }
    public string? Text { get; set; }
    public string? Wind360 { get; set; }
    public string? WindDir { get; set; }
    public string? WindScale { get; set; }
    public string? WindSpeed { get; set; }
    public string? Humidity { get; set; }
    public string? Precip { get; set; }
    public string? Pressure { get; set; }
}

// ---- 天文 ----

public sealed class QV7SunResponse : QV7Response
{
    public string? Sunrise { get; set; }
    public string? Sunset { get; set; }
}

public sealed class QV7MoonResponse : QV7Response
{
    public string? Moonrise { get; set; }
    public string? Moonset { get; set; }
    public List<QMoonPhaseItem>? MoonPhase { get; set; }
}

public sealed class QMoonPhaseItem
{
    public string? FxTime { get; set; }
    public string? Value { get; set; }
    public string? Name { get; set; }
    public string? Illumination { get; set; }
    public string? Icon { get; set; }
}

public sealed class QV7SolarAngleResponse
{
    public string? Code { get; set; }
    public string? SolarElevationAngle { get; set; }
    public string? SolarAzimuthAngle { get; set; }
    public string? SolarHour { get; set; }
    public string? HourAngle { get; set; }
}

// ---- 控制台 API ----

public sealed class QFinanceSummary
{
    public QMetadata? Metadata { get; set; }
    public string? AsOf { get; set; }
    public string? Currency { get; set; }
    public double? Balance { get; set; }
    public QAccruedCharges? AccruedCharges { get; set; }
}

public sealed class QAccruedCharges
{
    public double? PreviousDay { get; set; }
    public double? ThisMonth { get; set; }
    public double? SinceLastBill { get; set; }
}

public sealed class QMetricsStats
{
    public QMetadata? Metadata { get; set; }
    public string? AsOf { get; set; }
    public List<QMetricSeries>? Success { get; set; }
    public List<QMetricSeries>? Errors { get; set; }
}

public sealed class QMetricSeries
{
    public string? Api { get; set; }
    public List<double>? Hours { get; set; }
}
