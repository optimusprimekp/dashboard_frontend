import React, { useContext, useEffect, useState } from "react";
import Index from "../../Index";
import PagesIndex from "../../PagesIndex";
import { getStoredToken } from "../../../utils/authUtils";
import mqtt from "mqtt";

export default function Header(props) {
  const { profile } = useContext(PagesIndex.ProfileContext);
  const token = getStoredToken();
  const navigate = PagesIndex.useNavigate();

  // ================= MQTT STATE =================
  const [marqueeText, setMarqueeText] = useState("Connecting to Tracker...");
  const [angle, setAngle] = useState(null);
  const [mode, setMode] = useState(null);
  const [isAlert, setIsAlert] = useState(false);
  const MODE_MAP = {
    0: "Auto",
    1: "Manual",
    2: "Clean",
    3: "Flood Stow",
    4: "Snow Stow",
    5: "Wind Stow",
  };

  const CRITICAL_MODES = [3, 4, 5]; // alert modes
  useEffect(() => {
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

    client.on("connect", () => {
      console.log("MQTT Connected");

      client.subscribe("gsmkp/khavda_GUVNL/nextracker/ncu_id", (err) => {
        if (err) console.error("Subscribe error:", err);
      });
    });
    client.on("message", (topic, message) => {
      try {
        const data = JSON.parse(message.toString());

        // ✅ Update angle if exists
        if (data?.Tracker_Angle !== undefined && data?.Tracker_Angle !== null) {
          const newAngle = (data.Tracker_Angle * 0.01).toFixed(2);
          setAngle(newAngle);
        }

        // ✅ Update mode if exists
        if (data?.Tracker_CMD !== undefined && data?.Tracker_CMD !== null) {
          setMode(data?.Tracker_CMD);
        }
      } catch (err) {
        console.error("MQTT parse error:", err);
      }
    });

    return () => {
      client.end();
    };
  }, []);
  useEffect(() => {
    let textParts = [];
    let alert = false;

    if (angle !== null) {
      textParts.push(`Tracker Angle: ${angle}`);
    }

    if (mode !== null) {
      const modeText = MODE_MAP[mode] || "Unknown";
      textParts.push(`Mode: ${modeText}`);

      if (CRITICAL_MODES.includes(mode)) {
        alert = true;
      }
    }

    if (textParts.length > 0) {
      setMarqueeText(textParts.join(" | "));
      setIsAlert(alert);
    }
  }, [angle, mode]);
  // ================= HEADER MENU =================
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("refreshToken", token?.refreshToken);

    try {
      const res = await PagesIndex.apiPostHandler(
        PagesIndex.Api.LOGOUT_USER,
        urlEncoded,
      );

      if (res.status) {
        sessionStorage.removeItem("token");
        navigate("/");
        handleClose();
        PagesIndex.toasterSuccess(res?.message);
      } else {
        PagesIndex.toasterError(res?.message);
      }
    } catch (error) {
      console.error("Header handleLogout:", error);
      PagesIndex.toasterError("Failed to sign out");
    }
  };

  return (
    <Index.Box
      className={`admin-header-main ${
        props.open ? "active" : "admin-header-deactive"
      }`}
    >
      {/* ================= LEFT ================= */}
      <Index.Box className="admin-header-left">
        <Index.Box className="admin-header-logo-main">
          <Index.Button
            className="admin-bergur-button"
            onClick={() => {
              props.setOpen(!props.open);
              document.body.classList[props.open ? "remove" : "add"](
                "admin-body-overflow",
              );
            }}
          >
            <img
              src={PagesIndex.Svg.bergurmenu}
              className="bergurmenu-icon"
              alt="menu"
            />
          </Index.Button>
        </Index.Box>
      </Index.Box>

      {/* ================= CENTER (MARQUEE) ================= */}
      <Index.Box className="admin-header-center">
        <div className={`marquee-content ${isAlert ? "alert" : ""}`}>
          {marqueeText}
        </div>
      </Index.Box>

      {/* ================= RIGHT ================= */}
      <Index.Box className="admin-header-right">
        <Index.Box className="admin-header-drop-main">
          <Index.Button onClick={handleClick}>
            <Index.Box className="admin-flex-drop-main">
              <img
                src={
                  profile?.image
                    ? `${import.meta.env.VITE_IMAGE_URL}${profile?.image}`
                    : PagesIndex.Png.kp
                }
                className="admin-header-profile-icon"
                alt="profile"
              />
              <Index.Typography className="admin-header-drop">
                {profile?.name}
              </Index.Typography>
            </Index.Box>
          </Index.Button>
        </Index.Box>

        <Index.Menu
          className="admin-drop-header-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          <Index.MenuItem
            onClick={() => {
              navigate("/admin/account");
              handleClose();
            }}
          >
            <img
              src={PagesIndex.Svg.profilegrey}
              className="admin-drop-header-icon admin-icon"
              alt="Profile"
            />
            Profile
          </Index.MenuItem>

          <Index.MenuItem onClick={handleLogout}>
            <img
              src={PagesIndex.Svg.logout}
              className="admin-drop-header-icon admin-icon"
              alt="Logout"
            />
            Sign Out
          </Index.MenuItem>
        </Index.Menu>
      </Index.Box>
    </Index.Box>
  );
}
