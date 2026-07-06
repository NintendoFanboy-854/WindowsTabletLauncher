using System.Text.Json.Serialization;

namespace WeatherPlugin;

public sealed class LiveResponse
{
    public string? Status { get; set; }
    public string? Info { get; set; }
    public string? Infocode { get; set; }
    public List<Live>? Lives { get; set; }
}

public sealed class Live
{
    public string Province { get; set; } = "";
    public string City { get; set; } = "";
    public string Adcode { get; set; } = "";
    public string Weather { get; set; } = "";
    public string Temperature { get; set; } = "";
    public string Winddirection { get; set; } = "";
    public string Windpower { get; set; } = "";
    public string Humidity { get; set; } = "";
    public string Reporttime { get; set; } = "";
}

public sealed class ForecastResponse
{
    public string? Status { get; set; }
    public string? Info { get; set; }
    public string? Infocode { get; set; }
    public List<Forecast>? Forecasts { get; set; }
}

public sealed class Forecast
{
    public string City { get; set; } = "";
    public string Adcode { get; set; } = "";
    public string Province { get; set; } = "";
    public string Reporttime { get; set; } = "";
    public List<Cast>? Casts { get; set; }
}

public sealed class Cast
{
    public string Date { get; set; } = "";
    public string Week { get; set; } = "";
    public string Dayweather { get; set; } = "";
    public string Nightweather { get; set; } = "";
    public string Daytemp { get; set; } = "";
    public string Nighttemp { get; set; } = "";
    public string Daywind { get; set; } = "";
    public string Nightwind { get; set; } = "";
    public string Daypower { get; set; } = "";
    public string Nightpower { get; set; } = "";
}

public sealed class IpResponse
{
    public string? Status { get; set; }
    public string? Info { get; set; }
    public string? Infocode { get; set; }

    [JsonConverter(typeof(FlexibleStringConverter))]
    public string? Province { get; set; }

    [JsonConverter(typeof(FlexibleStringConverter))]
    public string? City { get; set; }

    [JsonConverter(typeof(FlexibleStringConverter))]
    public string? Adcode { get; set; }
}

public sealed class DistrictResponse
{
    public string? Status { get; set; }
    public string? Info { get; set; }
    public List<District>? Districts { get; set; }
}

public sealed class District
{
    public string Name { get; set; } = "";
    public string Adcode { get; set; } = "";
    public string Level { get; set; } = "";
    public List<District>? Districts { get; set; }

    public override string ToString() => Name;
}
