import React, { useState, useEffect } from "react";
import PagesIndex from "../../../PagesIndex";

/**
 * Converts wind direction from degrees to a cardinal direction.
 */
const getWindDirection = (degree) => {
  const sectors = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  // Handle potential undefined degree
  if (typeof degree !== "number") return "N/A";
  return sectors[Math.round((degree % 360) / 45) % 8];
};

// --- Reusable GlowCard Component ---
const GlowCard = ({ children, style = {}, glowStyle = {} }) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseGlowStyle = {
    position: "absolute",
    top: "-4px",
    left: "-4px",
    right: "-4px",
    bottom: "-4px",
    background: "linear-gradient(160deg, #4f46e5, #34d399, #f59e0b)",
    borderRadius: "28px", // Slightly larger than content
    filter: "blur(20px)",
    zIndex: 0,
    opacity: isHovered ? 0.7 : 0.5,
    transition: "opacity 0.3s ease-in-out",
    ...glowStyle,
  };

  const contentStyle = {
    background: "#1C1B22",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    position: "relative",
    zIndex: 1,
    overflow: "hidden",
    height: "100%",
    ...style,
  };

  return (
    <div
      style={{ position: "relative", height: "100%" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={baseGlowStyle} />
      <div style={contentStyle}>{children}</div>
    </div>
  );
};

// --- Main App Component ---
const WeatherView = () => {
  // --- State for weather data, loading, and errors ---
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [site, setSite] = useState({});

  // --- API Configuration ---
  // IMPORTANT: Replace with your own OpenWeatherMap API key
  const API_KEY = import.meta.env.VITE_REACT_APP_OPENWEATHER_API_KEY;
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch Site Data
        const res = await PagesIndex.apiGetHandler(
          PagesIndex.Api.GET_DASHBOARD_DATA + "/sites"
        );
        if (res.status !== 200) throw new Error("Failed to fetch site data.");
        setSite(res.data);

        // Validate API key
        if (API_KEY === "YOUR_OPENWEATHERMAP_API_KEY") {
          setError(
            "Please replace 'YOUR_OPENWEATHERMAP_API_KEY' with your actual API key."
          );
          setLoading(false);
          return; // Stop further execution
        }

        // Ensure site info is present
        if (!res.data?.latitude || !res.data?.longitude) {
          setError("Missing site coordinates.");
          setLoading(false);
          return;
        }

        // Fetch Current Weather
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${res.data.latitude}&lon=${res.data.longitude}&appid=${API_KEY}&units=metric`
        );
        if (!weatherResponse.ok)
          throw new Error(
            "Weather data not found. Check city name or API key."
          );
        const currentData = await weatherResponse.json();
        setWeatherData(currentData);

        // Fetch Forecast
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${res.data.latitude}&lon=${res.data.longitude}&appid=${API_KEY}&units=metric`
        );
        if (!forecastResponse.ok) throw new Error("Forecast data not found.");
        const forecastResult = await forecastResponse.json();

        // Process Forecast Data
        const dailyForecasts = forecastResult.list
          .filter((item) => item.dt_txt.includes("12:00:00"))
          .map((item) => ({
            dt: item.dt,
            weather: item.weather,
            main: item.main,
            day: new Date(item.dt * 1000).toLocaleDateString("en-US", {
              weekday: "short",
            }),
          }));

        setForecastData(dailyForecasts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const styles = {
    appContainer: {
      fontFamily: "'Inter', sans-serif",
      minHeight: "100vh",
      background:
        "linear-gradient(160deg,rgb(33, 32, 54),rgb(63, 148, 117),rgb(165, 115, 28))",
      color: "#e0e0e0",
      padding: "50px",
    },
    mainContent: {
      maxWidth: "1000px",
      margin: "0 auto",
    },
    // Main card specific styles
    mainCardContainer: {
      marginBottom: "50px",
    },
    mainCardContent: {
      padding: "40px 30px",
      textAlign: "center",
    },
    locationName: {
      fontSize: "42px",
      fontWeight: "600",
      margin: "0 0 15px 0",
      color: "#FFFFFF",
    },
    temperature: {
      fontSize: "88px",
      fontWeight: "700",
      margin: "0 0 15px 0",
      color: "#FFFFFF",
      lineHeight: 1,
    },
    description: {
      fontSize: "22px",
      color: "#9E9E9E",
      margin: 0,
      textTransform: "capitalize",
    },
    // Detail cards section
    detailCardsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "30px",
    },
    detailCardContent: {
      padding: "25px",
    },
    cardTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "20px",
      color: "#d0d5f0",
      display: "flex",
      alignItems: "center",
    },
    cardData: {
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      textAlign: "center",
    },
    cardValue: {
      fontSize: "28px",
      fontWeight: "600",
      margin: "0 0 5px 0",
      color: "#fff",
    },
    cardLabel: {
      fontSize: "12px",
      color: "#a0a5d0",
      margin: 0,
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
    icon: {
      width: "22px",
      height: "22px",
      marginRight: "12px",
      color: "#8a91e0",
    },
    // Forecast section
    forecastContainer: { marginTop: "50px", width: "100%" },
    forecastTitle: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "25px",
      textAlign: "center",
      color: "#fff",
    },
    forecastGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
      gap: "20px",
    },
    forecastItemContent: {
      padding: "20px",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    message: { textAlign: "center", fontSize: "20px", padding: "50px" },
  };

  const icons = {
    thermometer: (
      <svg
        style={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
      </svg>
    ),
    wind: (
      <svg
        style={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
      </svg>
    ),
    droplet: (
      <svg
        style={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
      </svg>
    ),
  };

  return (
    <div style={styles.appContainer}>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
        rel="stylesheet"
      />

      <main style={styles.mainContent}>
        {loading && <p style={styles.message}>Loading Weather Dashboard...</p>}
        {error && <p style={styles.message}>{error}</p>}
        {weatherData && !loading && !error && (
          <>
            <div style={styles.mainCardContainer}>
              <GlowCard style={styles.mainCardContent}>
                <p style={styles.locationName}>{weatherData.name}</p>
                <p style={styles.temperature}>
                  {Math.round(weatherData.main.temp)}°C
                </p>
                <p style={styles.description}>
                  {weatherData.weather[0].description}
                </p>
              </GlowCard>
            </div>

            <div style={styles.detailCardsContainer}>
              <GlowCard style={styles.detailCardContent}>
                <h3 style={styles.cardTitle}>
                  {icons.thermometer}Temperature Details
                </h3>
                <div style={styles.cardData}>
                  <div>
                    <p style={styles.cardValue}>
                      {Math.round(weatherData.main.feels_like)}°C
                    </p>
                    <p style={styles.cardLabel}>Feels Like</p>
                  </div>
                  <div>
                    <p style={styles.cardValue}>{weatherData.main.humidity}%</p>
                    <p style={styles.cardLabel}>Humidity</p>
                  </div>
                </div>
              </GlowCard>
              <GlowCard style={styles.detailCardContent}>
                <h3 style={styles.cardTitle}>{icons.wind}Wind</h3>
                <div style={styles.cardData}>
                  <div>
                    <p style={styles.cardValue}>{weatherData.wind.speed} m/s</p>
                    <p style={styles.cardLabel}>Speed</p>
                  </div>
                  <div>
                    <p style={styles.cardValue}>
                      {getWindDirection(weatherData.wind.deg)}
                    </p>
                    <p style={styles.cardLabel}>Direction</p>
                  </div>
                </div>
              </GlowCard>
              <GlowCard style={styles.detailCardContent}>
                <h3 style={styles.cardTitle}>{icons.droplet}Precipitation</h3>
                <div style={styles.cardData}>
                  <div>
                    <p style={styles.cardValue}>
                      {weatherData.rain ? weatherData.rain["1h"] || 0 : 0} mm
                    </p>
                    <p style={styles.cardLabel}>Last 1h</p>
                  </div>
                  <div>
                    <p style={styles.cardValue}>{weatherData.clouds.all}%</p>
                    <p style={styles.cardLabel}>Cloudiness</p>
                  </div>
                </div>
              </GlowCard>
            </div>
          </>
        )}

        {forecastData && forecastData.length > 0 && !loading && !error && (
          <div style={styles.forecastContainer}>
            <h2 style={styles.forecastTitle}>5-Day Forecast</h2>
            <div style={styles.forecastGrid}>
              {forecastData.slice(0, 5).map((day) => (
                <GlowCard key={day.dt} style={styles.forecastItemContent}>
                  <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>
                    {day.day}
                  </p>
                  <img
                    src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                    alt={day.weather[0].description}
                  />
                  <p
                    style={{
                      margin: "5px 0 0 0",
                      fontSize: "18px",
                      fontWeight: "600",
                    }}
                  >
                    {Math.round(day.main.temp)}°C
                  </p>
                </GlowCard>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WeatherView;
