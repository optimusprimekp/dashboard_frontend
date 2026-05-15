import { useEffect, useState, useRef } from "react";
import mqtt from "mqtt";

export const useMqtt = ({ active = true } = {}) => {
  const [data, setData] = useState({
    weather: {},
    trackerAngle: 0,
    ncuTrackers: {},
  });

  const clientRef = useRef(null);

  useEffect(() => {
    // ── Disconnect when not active (tab hidden) ───────────────────────────
    if (!active) {
      if (clientRef.current) {
        clientRef.current.end(true);
        clientRef.current = null;
      }
      return;
    }

    // ── Already connected ─────────────────────────────────────────────────
    if (clientRef.current) return;

    // ── Connect ───────────────────────────────────────────────────────────
    const client = mqtt.connect(import.meta.env.VITE_GSM_MQTT_URL, {
      username: import.meta.env.VITE_GSM_MQTT_USERNAME,
      password: import.meta.env.VITE_GSM_MQTT_PASSWORD,
      reconnectPeriod: 5000,
    });

    clientRef.current = client;

    client.on("connect", () => {
      console.log("MQTT Connected");
      client.subscribe("gsmkp/khavda_GUVNL/nextracker/ncu_id");
    });

    client.on("message", (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());

        setData((prev) => {
          let updated = { ...prev };

          Object.keys(payload).forEach((key) => {
            const value = payload[key];

            if (key === "Wind_Speed") {
              updated.weather = { wind: value };
            }

            if (key === "Tracker_Angle") {
              updated.trackerAngle = value;
            }

            if (key.includes("Tracker_position")) {
              let ncuId = "01";
              let trackerId;

              if (key.startsWith("NCU")) {
                const parts = key.split("_");
                ncuId = parts[0].replace("NCU", "").padStart(2, "0");
                trackerId = parts[3];
              } else {
                trackerId = key.split("_")[2];
              }

              updated.ncuTrackers = {
                ...updated.ncuTrackers,
                [ncuId]: {
                  ...(updated.ncuTrackers[ncuId] || {}),
                  [trackerId]: {
                    value,
                    updatedAt: Date.now(),
                  },
                },
              };
            }
          });

          return updated;
        });
      } catch (err) {
        console.error(err);
      }
    });

    return () => {
      client.end(true);
      clientRef.current = null;
    };
  }, [active]); // re-run when active changes

  return data;
};
