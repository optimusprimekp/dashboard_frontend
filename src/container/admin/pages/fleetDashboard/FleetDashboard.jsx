import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Box, Typography, Grid, Paper, Skeleton } from "@mui/material";
import AirIcon from "@mui/icons-material/Air";
import {
  GoogleMap,
  KmlLayer,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import PagesIndex from "../../../PagesIndex";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Avatar,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LaunchIcon from "@mui/icons-material/Launch";
import { useNavigate } from "react-router-dom";
import Chip from "@mui/material/Chip";
import moment from "moment";
import mqtt from "mqtt";
import ScadaView from "./ScadaView";
import { useMqtt } from "./useMqtt";

const kmlUrl =
  "https://www.google.com/maps/d/u/0/kml?mid=1daXMx_xd7ll-uZzUmRy0I1DSQ8dAfAw&ehbc=2E312F";

// ─── Skeleton Components ───────────────────────────────────────────────────────

const DonutSkeleton = () => (
  <Paper
    elevation={3}
    sx={{ p: 2.5, borderRadius: 3, backgroundColor: "white", height: "100%" }}
  >
    <Skeleton variant="text" width={160} height={32} sx={{ mb: 2 }} />
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 350,
          }}
        >
          <Skeleton variant="circular" width={180} height={180} />
        </Box>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={44}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Box>
      </Grid>
    </Grid>
  </Paper>
);

const WeatherSkeleton = () => (
  <Paper
    elevation={3}
    sx={{ p: 2, mb: 3, borderRadius: 3, height: 210, overflow: "hidden" }}
  >
    <Skeleton
      variant="rounded"
      width="100%"
      height="100%"
      sx={{ borderRadius: 3 }}
    />
  </Paper>
);

const KpiSkeleton = () => (
  <Grid container spacing={3}>
    {[...Array(4)].map((_, i) => (
      <Grid item xs={12} sm={6} key={i}>
        <Paper elevation={3} sx={{ p: 1.75, borderRadius: 3 }}>
          <Skeleton variant="text" width="80%" height={18} />
          <Skeleton variant="text" width="50%" height={40} />
        </Paper>
      </Grid>
    ))}
  </Grid>
);

const CommandHistorySkeleton = () => (
  <Box
    sx={{
      p: 3,
      borderRadius: 4,
      backgroundColor: "white",
      border: "1px solid #f0f1f3",
    }}
  >
    <Skeleton variant="text" width={220} height={32} sx={{ mb: 3 }} />
    {[...Array(3)].map((_, i) => (
      <Skeleton
        key={i}
        variant="rounded"
        height={64}
        sx={{ mb: 2, borderRadius: 2 }}
      />
    ))}
  </Box>
);

const MapSkeleton = () => (
  <Paper
    elevation={3}
    sx={{ height: 800, borderRadius: 3, overflow: "hidden" }}
  >
    <Skeleton
      variant="rounded"
      width="100%"
      height="100%"
      sx={{ borderRadius: 0 }}
    />
  </Paper>
);

// ─── Status Color Map ──────────────────────────────────────────────────────────

const STATUS_COLOR_MAP = {
  online: "#16a34a",
  offline: "#6b7280",
  cleaning: "#0ea5e9",
  idle: "#facc15",
  maintenance: "#a855f7",
  charging: "#22c55e",
  error: "#ef4444",
  update: "#3b82f6",
  staw: "#14b8a6",
};

const statusColorDot = (key) => STATUS_COLOR_MAP[key] ?? "#6b7280";

// ─── LegendRow — outside component so it never remounts ───────────────────────
const LegendRow = ({ item, totalDevices }) => {
  const value = item.value || 0;
  const percent =
    totalDevices > 0 ? Math.round((value / totalDevices) * 100) : 0;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 1,
        borderRadius: 2,
        backgroundColor: "#f9fafb",
        border: "1px solid #e5e7eb",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: statusColorDot(item.key),
          }}
        />
        <Typography variant="body2" sx={{ color: "#374151" }}>
          {item.name ?? item.label}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }}>
          {value}
        </Typography>
        <Typography variant="caption" sx={{ color: "#6b7280" }}>
          {totalDevices > 0 ? `${percent}%` : "—"}
        </Typography>
      </Box>
    </Box>
  );
};

// ─── FleetDashboard ────────────────────────────────────────────────────────────

const FleetDashboard = () => {
  const [weather, setWeather] = useState(null);
  const [topTab, setTopTab] = useState(0);
  const navigate = useNavigate();
  const [count, setCount] = useState({});
  const [devices, setDevices] = useState([]);
  const [site, setSite] = useState({});
  const [commandHistory, setCommandHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [trackerAngle, setTrackerAngle] = useState(0);
  const [weatherData, setWeatherData] = useState(null);

  // ── KEY FIX: pass active flag so MQTT only runs on the SCADA tab ──────────
  const mqttData = useMqtt({ active: topTab === 1 });

  const [loading, setLoading] = useState({
    dashboard: true,
    devices: true,
    site: true,
    commandHistory: true,
    weather: true,
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_KEY,
  });

  const mqttClientRef = useRef(null);

  // ─── Debounce search ──────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // ─── MQTT for Dashboard tab (wind / tracker angle) ────────────────────────
  useEffect(() => {
    if (topTab !== 0) {
      mqttClientRef.current?.end(true);
      mqttClientRef.current = null;
      return;
    }

    const brokerUrl = import.meta.env.VITE_GSM_MQTT_URL;
    const options = {
      username: import.meta.env.VITE_GSM_MQTT_USERNAME,
      password: import.meta.env.VITE_GSM_MQTT_PASSWORD,
      clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
      clean: false,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
    };

    const client = mqtt.connect(brokerUrl, options);
    mqttClientRef.current = client;

    client.on("connect", () => {
      client.subscribe("gsmkp/khavda_GUVNL/nextracker/ncu_id", (err) => {
        if (err) console.error("Subscribe error:", err);
      });
    });

    client.on("message", (_topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data?.Wind_Speed != null) setWeatherData({ wind: data.Wind_Speed });
        if (data?.Tracker_Angle != null) setTrackerAngle(data.Tracker_Angle);
      } catch (err) {
        console.error("MQTT Parse Error:", err);
      }
    });

    client.on("error", (err) => console.error("MQTT Error:", err));

    return () => {
      client.end(true);
      mqttClientRef.current = null;
    };
  }, [topTab]);

  // ─── Parallel API Calls ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      const [dashRes, devicesRes, siteRes, cmdRes] = await Promise.allSettled([
        PagesIndex.apiGetHandler(PagesIndex.Api.GET_DASHBOARD_DATA + "/count"),
        PagesIndex.apiGetHandler(
          PagesIndex.Api.GET_DASHBOARD_DATA + "/device-map",
        ),
        PagesIndex.apiGetHandler(PagesIndex.Api.GET_DASHBOARD_DATA + "/sites"),
        PagesIndex.apiGetHandler(
          PagesIndex.Api.GET_DASHBOARD_DATA + "/command-history-data",
        ),
      ]);

      if (dashRes.status === "fulfilled" && dashRes.value?.status === 200)
        setCount(dashRes.value.data);
      setLoading((p) => ({ ...p, dashboard: false }));

      if (devicesRes.status === "fulfilled" && devicesRes.value?.status === 200)
        setDevices(devicesRes.value.data);
      setLoading((p) => ({ ...p, devices: false }));

      if (siteRes.status === "fulfilled" && siteRes.value?.status === 200)
        setSite(siteRes.value.data);
      setLoading((p) => ({ ...p, site: false }));

      if (cmdRes.status === "fulfilled" && cmdRes.value?.status === 200)
        setCommandHistory(cmdRes.value.data);
      setLoading((p) => ({ ...p, commandHistory: false }));
    };

    fetchAll();
  }, []);

  // ─── Weather fetch ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!site.latitude || !site.longitude) return;
    let cancelled = false;

    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=23.8443&lon=69.7317&appid=${
            import.meta.env.VITE_REACT_APP_OPENWEATHER_API_KEY
          }&units=metric`,
        );
        const data = await res.json();
        if (!cancelled) {
          setWeather({
            temp: data.main?.temp,
            condition: (data.weather?.[0]?.main || "").toLowerCase(),
          });
          setLoading((p) => ({ ...p, weather: false }));
        }
      } catch (error) {
        console.error("Weather fetch failed", error);
        if (!cancelled) setLoading((p) => ({ ...p, weather: false }));
      }
    };

    fetchWeather();
    return () => {
      cancelled = true;
    };
  }, [site.latitude, site.longitude]);

  // ─── Derived / memoised ───────────────────────────────────────────────────
  const totalDevices = count.devices || 0;

  const onlineOfflinePieData = useMemo(
    () => [
      { key: "online", name: "Online", value: count.online || 0 },
      { key: "offline", name: "Offline", value: count.offline || 0 },
    ],
    [count.online, count.offline],
  );

  const robotStatusItems = useMemo(
    () => [
      { key: "online", label: "Online", value: count.online },
      { key: "offline", label: "Offline", value: count.offline },
      { key: "idle", label: "Idle", value: count.idle },
      { key: "maintenance", label: "Maintenance", value: count.maintenance },
      { key: "charging", label: "Charging", value: count.charging },
      { key: "error", label: "Error", value: count.error },
      { key: "update", label: "Update", value: count.update },
      { key: "staw", label: "Staw", value: count.staw },
    ],
    [count],
  );

  const modeStatusItems = useMemo(
    () =>
      robotStatusItems.filter((s) => s.key !== "online" && s.key !== "offline"),
    [robotStatusItems],
  );

  const modePieData = useMemo(
    () =>
      modeStatusItems.map((item) => ({
        key: item.key,
        name: item.label,
        value: item.value || 0,
      })),
    [modeStatusItems],
  );

  const mapCenter = useMemo(
    () => ({
      lat: site.latitude ? Number(site.latitude) : 23.0225,
      lng: site.longitude ? Number(site.longitude) : 72.5714,
    }),
    [site.latitude, site.longitude],
  );

  const filteredCommandHistory = useMemo(
    () =>
      commandHistory.filter((d) =>
        d.deviceName.toLowerCase().includes(debouncedSearch.toLowerCase()),
      ),
    [commandHistory, debouncedSearch],
  );

  const handleNavigate = useCallback(
    (device) => (e) => {
      e.stopPropagation();
      navigate(`/admin/control-flow/${device.applicationId}/${device.devEui}`, {
        state: { data: device },
      });
    },
    [navigate],
  );

  const tabs = ["Dashboard", "Tracker SCADA"];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        bgcolor: "rgb(245, 245, 245)",
        minHeight: "100vh",
        position: "relative",
        p: 2,
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          backgroundImage: `url("https://kpgroup.co/wp-content/uploads/2025/07/kp-logo-150x150-1.webp")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "200px",
          opacity: 0.1,
          pointerEvents: "none",
        },
      }}
    >
      {/* ── Tab Bar ── */}
      <Box
        sx={{
          display: "flex",
          gap: "4px",
          bgcolor: "#e5e7eb",
          borderRadius: 2,
          p: "4px",
          width: "fit-content",
          mb: 2,
          position: "relative",
          zIndex: 1,
        }}
      >
        {tabs.map((label, i) => (
          <Box
            key={label}
            onClick={() => setTopTab(i)}
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: 1.5,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: topTab === i ? 600 : 400,
              color: topTab === i ? "text.primary" : "text.secondary",
              bgcolor: topTab === i ? "white" : "transparent",
              border:
                topTab === i ? "1px solid #d1d5db" : "1px solid transparent",
              boxShadow: topTab === i ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s ease",
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </Box>
        ))}
      </Box>

      {/* ── Dashboard Tab ──
          Using display:none instead of conditional render so the heavy
          GoogleMap / charts do NOT unmount/remount on every tab switch.        */}
      <Box
        sx={{
          display: topTab === 0 ? "block" : "none",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Grid container spacing={2}>
          {/* LEFT PANEL */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2} mb={3}>
              {/* Donut 1: Online vs Offline */}
              <Grid item xs={12} md={6}>
                {loading.dashboard ? (
                  <DonutSkeleton />
                ) : (
                  <Paper
                    elevation={3}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      backgroundColor: "white",
                      height: "100%",
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      Connectivity
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ height: 350 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={onlineOfflinePieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={3}
                                stroke="#ffffff"
                              >
                                {onlineOfflinePieData.map((entry, i) => (
                                  <Cell
                                    key={`oo-${entry.key}-${i}`}
                                    fill={statusColorDot(entry.key)}
                                  />
                                ))}
                                <Label
                                  value={totalDevices || 0}
                                  position="center"
                                  style={{
                                    fontSize: 22,
                                    fontWeight: 700,
                                    fill: "#111827",
                                  }}
                                />
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            maxHeight: 250,
                            overflowY: "auto",
                          }}
                        >
                          {onlineOfflinePieData.map((item) => (
                            <LegendRow
                              key={item.key}
                              item={item}
                              totalDevices={totalDevices}
                            />
                          ))}
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                )}
              </Grid>

              {/* Donut 2: Modes */}
              <Grid item xs={12} md={6}>
                {loading.dashboard ? (
                  <DonutSkeleton />
                ) : (
                  <Paper
                    elevation={3}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      backgroundColor: "white",
                      height: "100%",
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      Operating Modes
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ height: 350 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={modePieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={2}
                                stroke="#ffffff"
                              >
                                {modePieData.map((entry, i) => (
                                  <Cell
                                    key={`mode-${entry.key}-${i}`}
                                    fill={statusColorDot(entry.key)}
                                  />
                                ))}
                                <Label
                                  value={totalDevices || 0}
                                  position="center"
                                  style={{
                                    fontSize: 22,
                                    fontWeight: 700,
                                    fill: "#111827",
                                  }}
                                />
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            maxHeight: 350,
                            overflowY: "auto",
                          }}
                        >
                          {modeStatusItems.map((item) => (
                            <LegendRow
                              key={item.key}
                              item={item}
                              totalDevices={totalDevices}
                            />
                          ))}
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                )}
              </Grid>
            </Grid>
          </Grid>

          {/* RIGHT PANEL */}
          <Grid item xs={12} md={4}>
            {loading.weather ? (
              <WeatherSkeleton />
            ) : (
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 3,
                  background: `url(${import.meta.env.VITE_IMAGE_URL + "shared_image.jpg"})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  height: 210,
                  color: "black",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Typography variant="body2">Weather Today</Typography>
                <Typography variant="h3" fontWeight={700}>
                  {weather?.temp != null ? `${weather.temp}°C` : "--"}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ textTransform: "capitalize" }}
                >
                  {weather?.condition || "N/A"}
                </Typography>
                <Box mt={1} display="flex" alignItems="center" gap={1}>
                  <AirIcon sx={{ mt: 0.2 }} />
                  <Typography component="span">
                    {weatherData?.wind != null
                      ? `${(weatherData.wind * 0.01).toFixed(2)} Miles/h Wind`
                      : "Loading..."}
                  </Typography>
                </Box>
              </Paper>
            )}

            {loading.dashboard ? (
              <KpiSkeleton />
            ) : (
              <Grid container spacing={3}>
                {[
                  { label: "Total Gateways", value: count.gateways ?? 0 },
                  { label: "Total Blocks", value: count.blocks ?? 0 },
                  { label: "Total Devices", value: count.devices ?? 0 },
                  {
                    label: "Tracker Angle(Degree)",
                    value: (trackerAngle * 0.01).toFixed(2) ?? 0,
                  },
                ].map(({ label, value }) => (
                  <Grid item xs={12} sm={6} key={label}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 1.75,
                        borderRadius: 3,
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "#6b7280", textTransform: "uppercase" }}
                      >
                        {label}
                      </Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {value}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>

          {/* Command History */}
          <Grid item xs={12}>
            {loading.commandHistory ? (
              <CommandHistorySkeleton />
            ) : (
              <Box
                sx={{
                  p: 3,
                  borderRadius: 4,
                  backgroundColor: "white",
                  border: "1px solid #f0f1f3",
                  boxShadow: "0px 4px 20px rgba(0,0,0,0.03)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 2,
                    mb: 4,
                  }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Robots Command Line
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="Search device name..."
                    variant="outlined"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon
                            sx={{ color: "text.disabled", fontSize: 20 }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      minWidth: 300,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "#f9fafb",
                        "& fieldset": { border: "none" },
                        "&:hover fieldset": { border: "1px solid #e5e7eb" },
                      },
                    }}
                  />
                </Box>

                <Box sx={{ maxHeight: 400, overflowY: "auto", pr: 1 }}>
                  {filteredCommandHistory.map((device, index) => (
                    <Accordion
                      key={device.deviceId}
                      defaultExpanded={index === 0}
                      elevation={0}
                      sx={{
                        mb: 2,
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px !important",
                        "&:before": { display: "none" },
                        overflow: "hidden",
                      }}
                    >
                      <AccordionSummary
                        expandIcon={
                          <ExpandMoreIcon sx={{ color: "primary.main" }} />
                        }
                        sx={{
                          backgroundColor: "#fcfcfd",
                          "& .MuiAccordionSummary-content": {
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            margin: "12px 0",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "primary.main",
                            }}
                          />
                          <Typography fontWeight={600} color="text.primary">
                            {device.deviceName}
                          </Typography>
                        </Box>
                        <Box sx={{ flexGrow: 1 }} />
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            pr: "10px",
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={handleNavigate(device)}
                            sx={{
                              color: "primary.main",
                              "&:hover": {
                                backgroundColor: "rgba(25,118,210,0.04)",
                              },
                            }}
                          >
                            <LaunchIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails sx={{ p: 2, backgroundColor: "white" }}>
                        {device.history.map((cmd, idx) => {
                          const statusConfig = {
                            COMPLETED: {
                              color: "#10b981",
                              bg: "#ecfdf5",
                              label: "Completed",
                            },
                            FAILED: {
                              color: "#ef4444",
                              bg: "#fef2f2",
                              label: "Failed",
                            },
                            OVERRIDDEN: {
                              color: "#f59e0b",
                              bg: "#fffbeb",
                              label: "Overridden",
                            },
                          }[cmd.status] || {
                            color: "#3b82f6",
                            bg: "#eff6ff",
                            label: cmd.status,
                          };

                          return (
                            <Box
                              key={cmd.id}
                              sx={{
                                display: "flex",
                                gap: 2,
                                mb: idx === device.history.length - 1 ? 0 : 2,
                                position: "relative",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  visibility:
                                    idx === device.history.length - 1
                                      ? "hidden"
                                      : "visible",
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 2,
                                    flexGrow: 1,
                                    bgcolor: "#f3f4f6",
                                    mt: 4,
                                  }}
                                />
                              </Box>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2,
                                  flex: 1,
                                  borderRadius: 3,
                                  border: "1px solid #f3f4f6",
                                  transition: "0.2s",
                                  "&:hover": {
                                    borderColor: "primary.light",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                  },
                                }}
                              >
                                <Grid container spacing={2} alignItems="center">
                                  <Grid item xs={12} md={3}>
                                    <Typography
                                      variant="caption"
                                      color="text.disabled"
                                      display="block"
                                    >
                                      Command
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                      color="text.primary"
                                    >
                                      {cmd.commandName}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} md={2}>
                                    <Typography
                                      variant="caption"
                                      color="text.disabled"
                                      display="block"
                                    >
                                      Status
                                    </Typography>
                                    <Chip
                                      label={statusConfig.label}
                                      size="small"
                                      sx={{
                                        fontWeight: 600,
                                        fontSize: "0.65rem",
                                        color: statusConfig.color,
                                        backgroundColor: statusConfig.bg,
                                        borderRadius: "6px",
                                        border: `1px solid ${statusConfig.color}20`,
                                      }}
                                    />
                                  </Grid>
                                  <Grid item xs={12} md={3}>
                                    <Typography
                                      variant="caption"
                                      color="text.disabled"
                                      display="block"
                                    >
                                      Operator
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Avatar
                                        sx={{
                                          width: 20,
                                          height: 20,
                                          fontSize: 10,
                                          bgcolor: "secondary.main",
                                        }}
                                      >
                                        {cmd.userName.charAt(0)}
                                      </Avatar>
                                      <Typography
                                        variant="body2"
                                        fontWeight={500}
                                      >
                                        {cmd.userName}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid
                                    item
                                    xs={12}
                                    md={4}
                                    sx={{ textAlign: { md: "right" } }}
                                  >
                                    <Typography
                                      variant="caption"
                                      color="text.disabled"
                                      display="block"
                                    >
                                      Executed At
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ fontFamily: "Monospace" }}
                                    >
                                      {moment(cmd.executedAt).format(
                                        "DD MMM YYYY · hh:mm:ss A",
                                      )}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </Paper>
                            </Box>
                          );
                        })}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              </Box>
            )}
          </Grid>

          {/* Google Map */}
          <Grid item xs={12} paddingBottom={2}>
            {loading.devices || loading.site ? (
              <MapSkeleton />
            ) : (
              <Paper
                elevation={3}
                sx={{
                  height: 800,
                  borderRadius: 3,
                  overflow: "hidden",
                  backgroundColor: "white",
                }}
              >
                {!isLoaded ? (
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography>Loading Map...</Typography>
                  </Box>
                ) : (
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={mapCenter}
                    zoom={16}
                    options={{
                      mapTypeId: "satellite",
                      tilt: 0,
                      streetViewControl: false,
                      fullscreenControl: true,
                    }}
                  >
                    <KmlLayer
                      url={kmlUrl}
                      options={{ preserveViewport: true }}
                    />
                    {devices.map((d, index) => {
                      if (!d.latitude || !d.longitude) return null;
                      const color = statusColorDot(
                        d?.state?.replace("_STATE", "").toLowerCase(),
                      );
                      const svgMarker = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 24 24">
                          <path fill="${color}" stroke="white" stroke-width="1"
                            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                          <circle cx="12" cy="9" r="3" fill="white" fill-opacity="0.5"/>
                        </svg>`;
                      const markerKey = d?.id ?? d?.devEui ?? d?.name ?? index;
                      return (
                        <Marker
                          key={`dv-${markerKey}`}
                          label={{
                            text: d?.name || "",
                            color: "black",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                          position={{
                            lat: Number(d.latitude),
                            lng: Number(d.longitude),
                          }}
                          icon={{
                            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgMarker)}`,
                            scaledSize: new window.google.maps.Size(40, 40),
                            anchor: new window.google.maps.Point(20, 40),
                          }}
                        />
                      );
                    })}
                  </GoogleMap>
                )}
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* ── Tracker SCADA Tab ──
          Also kept always mounted after first render via display:none.
          ScadaView renders thousands of tracker cells — remounting it on every
          tab click was the main source of the switching lag.                   */}
      <Box
        sx={{
          display: topTab === 1 ? "block" : "none",
          position: "relative",
          zIndex: 1,
        }}
      >
        <ScadaView mqttData={mqttData} />
      </Box>
    </Box>
  );
};

export default FleetDashboard;
