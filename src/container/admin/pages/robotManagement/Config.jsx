import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import RefreshIcon from "@mui/icons-material/Refresh";
import PageIndex from "../../../../component/PagesIndex";
// --- Date-picker and time handling imports ---
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { toasterSuccess } from "../../../../utils/toaster/toaster";
dayjs.extend(utc);

// --- Centralized Chirpstack/LoRaWAN command generation logic ---
// This object defines the entire configuration protocol.
const protocolConfigurations = {
  // We keep individual definitions for reference or potential future single-config commands.
  LEFT_MOTOR_DUTYCYCLE: { code: 0x60, length: 2, type: "uint16" },
  LEFT_MOTOR_FREQUENCY: { code: 0x61, length: 2, type: "uint16" },
  RIGHT_MOTOR_DUTYCYCLE: { code: 0x62, length: 2, type: "uint16" },
  RIGHT_MOTOR_FREQUENCY: { code: 0x63, length: 2, type: "uint16" },
  BRUSH_MOTOR_DUTYCYCLE: { code: 0x64, length: 2, type: "uint16" },
  BRUSH_MOTOR_FREQUENCY: { code: 0x65, length: 2, type: "uint16" },
  LEFT_MOTOR_TEMPERATURE_UPPER_THRESHOLD: {
    code: 0x66,
    length: 1,
    type: "uint8",
  },
  LEFT_MOTOR_TEMPERATURE_LOWER_THRESHOLD: {
    code: 0x67,
    length: 1,
    type: "int8",
  },
  RIGHT_MOTOR_TEMPERATURE_UPPER_THRESHOLD: {
    code: 0x68,
    length: 1,
    type: "uint8",
  },
  RIGHT_MOTOR_TEMPERATURE_LOWER_THRESHOLD: {
    code: 0x69,
    length: 1,
    type: "int8",
  },
  BRUSH_MOTOR_TEMPERATURE_UPPER_THRESHOLD: {
    code: 0x6a,
    length: 1,
    type: "uint8",
  },
  BRUSH_MOTOR_TEMPERATURE_LOWER_THRESHOLD: {
    code: 0x6b,
    length: 1,
    type: "int8",
  },
  LEFT_MOTOR_VOLTAGE_UPPER_THRESHOLD: { code: 0x6c, length: 2, type: "uint16" },
  LEFT_MOTOR_VOLTAGE_LOWER_THRESHOLD: { code: 0x6d, length: 2, type: "uint16" },
  RIGHT_MOTOR_VOLTAGE_UPPER_THRESHOLD: {
    code: 0x6e,
    length: 2,
    type: "uint16",
  },
  RIGHT_MOTOR_VOLTAGE_LOWER_THRESHOLD: {
    code: 0x6f,
    length: 2,
    type: "uint16",
  },
  BRUSH_MOTOR_VOLTAGE_UPPER_THRESHOLD: {
    code: 0x70,
    length: 2,
    type: "uint16",
  },
  BRUSH_MOTOR_VOLTAGE_LOWER_THRESHOLD: {
    code: 0x71,
    length: 2,
    type: "uint16",
  },
  LEFT_MOTOR_CURRENT_UPPER_THRESHOLD: { code: 0x72, length: 2, type: "uint16" },
  LEFT_MOTOR_CURRENT_LOWER_THRESHOLD: { code: 0x73, length: 2, type: "uint16" },
  RIGHT_MOTOR_CURRENT_UPPER_THRESHOLD: {
    code: 0x74,
    length: 2,
    type: "uint16",
  },
  RIGHT_MOTOR_CURRENT_LOWER_THRESHOLD: {
    code: 0x75,
    length: 2,
    type: "uint16",
  },
  BRUSH_MOTOR_CURRENT_UPPER_THRESHOLD: {
    code: 0x76,
    length: 2,
    type: "uint16",
  },
  BRUSH_MOTOR_CURRENT_LOWER_THRESHOLD: {
    code: 0x77,
    length: 2,
    type: "uint16",
  },
  RTC_TIME: { code: 0x78, length: 8, type: "uint64" },
  DEVICE_STATUS_INTERVAL: { code: 0x79, length: 2, type: "uint16" },
  LOCK_SWITCHES: { code: 0x7a, length: 1, type: "uint8" },
  RTC_TIME_SYNC_INTERVAL: { code: 0x7b, length: 2, type: "uint16" },
  MAIN_BATTERY_SOC_LOWER_THRESHOLD: { code: 0x7c, length: 1, type: "uint8" },
  MAIN_BATTERY_SOC_REQUIREMENT_ONE_CYCLE: {
    code: 0x7d,
    length: 1,
    type: "uint8",
  },
  MAINTENANCE_STATE_TIMEOUT: { code: 0x7e, length: 2, type: "uint16" },
  UPDATE_STATE_TIMEOUT: { code: 0x80, length: 2, type: "uint16" },
  ALARM_STATUS_ERROR_STATE_INTERVAL: { code: 0x81, length: 2, type: "uint16" },
  HOME_POSITION: { code: 0x82, length: 1, type: "uint8" },
  CHARGING_DISTANCE: { code: 0x83, length: 2, type: "uint16" },
  // Grouped commands are the primary way we'll send data
  ALL_MOTOR_RELATED_DATA: {
    code: 0x87,
    length: 42,
    type: "group",
    fields: [
      { name: "LEFT_MOTOR_DUTYCYCLE", type: "uint16" },
      { name: "LEFT_MOTOR_FREQUENCY", type: "uint16" },
      { name: "RIGHT_MOTOR_DUTYCYCLE", type: "uint16" },
      { name: "RIGHT_MOTOR_FREQUENCY", type: "uint16" },
      { name: "BRUSH_MOTOR_DUTYCYCLE", type: "uint16" },
      { name: "BRUSH_MOTOR_FREQUENCY", type: "uint16" },
      { name: "LEFT_MOTOR_TEMPERATURE_UPPER_THRESHOLD", type: "uint8" },
      { name: "LEFT_MOTOR_TEMPERATURE_LOWER_THRESHOLD", type: "int8" },
      { name: "RIGHT_MOTOR_TEMPERATURE_UPPER_THRESHOLD", type: "uint8" },
      { name: "RIGHT_MOTOR_TEMPERATURE_LOWER_THRESHOLD", type: "int8" },
      { name: "BRUSH_MOTOR_TEMPERATURE_UPPER_THRESHOLD", type: "uint8" },
      { name: "BRUSH_MOTOR_TEMPERATURE_LOWER_THRESHOLD", type: "int8" },
      { name: "LEFT_MOTOR_VOLTAGE_UPPER_THRESHOLD", type: "uint16" },
      { name: "LEFT_MOTOR_VOLTAGE_LOWER_THRESHOLD", type: "uint16" },
      { name: "RIGHT_MOTOR_VOLTAGE_UPPER_THRESHOLD", type: "uint16" },
      { name: "RIGHT_MOTOR_VOLTAGE_LOWER_THRESHOLD", type: "uint16" },
      { name: "BRUSH_MOTOR_VOLTAGE_UPPER_THRESHOLD", type: "uint16" },
      { name: "BRUSH_MOTOR_VOLTAGE_LOWER_THRESHOLD", type: "uint16" },
      { name: "LEFT_MOTOR_CURRENT_UPPER_THRESHOLD", type: "uint16" },
      { name: "LEFT_MOTOR_CURRENT_LOWER_THRESHOLD", type: "uint16" },
      { name: "RIGHT_MOTOR_CURRENT_UPPER_THRESHOLD", type: "uint16" },
      { name: "RIGHT_MOTOR_CURRENT_LOWER_THRESHOLD", type: "uint16" },
      { name: "BRUSH_MOTOR_CURRENT_UPPER_THRESHOLD", type: "uint16" },
      { name: "BRUSH_MOTOR_CURRENT_LOWER_THRESHOLD", type: "uint16" },
    ],
  },
  OTHER_DATA: {
    code: 0x88,
    length: 18,
    type: "group",
    fields: [
      { name: "RTC_TIME", type: "uint64" },
      { name: "DEVICE_STATUS_INTERVAL", type: "uint16" },
      { name: "LOCK_SWITCHES", type: "uint8" },
      { name: "RTC_TIME_SYNC_INTERVAL", type: "uint16" },
      { name: "MAIN_BATTERY_SOC_LOWER_THRESHOLD", type: "uint8" },
      { name: "MAIN_BATTERY_SOC_REQUIREMENT_ONE_CYCLE", type: "uint8" },
      { name: "MAINTENANCE_STATE_TIMEOUT", type: "uint16" },
      { name: "UPDATE_STATE_TIMEOUT", type: "uint16" },
      { name: "ALARM_STATUS_ERROR_STATE_INTERVAL", type: "uint16" },
      { name: "HOME_POSITION", type: "uint8" },
      { name: "CHARGING_DISTANCE", type: "uint16" },
    ],
  },
};

function generateChirpstackConfigCommand(configName, configValue, sequenceId) {
  const selectedConfig = protocolConfigurations[configName];
  if (!selectedConfig || selectedConfig.type !== "group") {
    console.error(
      `Error: Group configuration '${configName}' not found or is not a group.`
    );
    return null;
  }

  const commandId = 0x51;
  const seqId = parseInt(sequenceId) & 0xff;
  let payload = [selectedConfig.code];

  if (typeof configValue !== "object" || configValue === null) {
    console.error(`Error: configValue for '${configName}' must be an object.`);
    return null;
  }

  for (const field of selectedConfig.fields) {
    let value = configValue[field.name];
    if (value === undefined || value === null) {
      console.warn(
        `Warning: Value for '${field.name}' in '${configName}' is missing. Using 0.`
      );
      value = 0;
    }

    if (field.type === "uint64") {
      const bigValue = BigInt(value);
      for (let i = 0; i < 8; i++) {
        payload.push(Number((bigValue >> BigInt(8 * i)) & BigInt(0xff)));
      }
    } else {
      const parsedValue = parseInt(value);
      switch (field.type) {
        case "uint8":
          payload.push(parsedValue & 0xff);
          break;
        case "int8":
          payload.push(
            parsedValue < 0 ? (256 + parsedValue) & 0xff : parsedValue & 0xff
          );
          break;
        case "uint16":
          payload.push(parsedValue & 0xff, (parsedValue >> 8) & 0xff);
          break;
        default:
          console.warn(`Unknown type for field: ${field.name} (${field.type})`);
      }
    }
  }

  const xorChecksum = (data) => data.reduce((acc, byte) => acc ^ byte, 0);

  const payloadLength = payload.length;
  const checksum = xorChecksum(payload);
  const frame = [commandId, seqId, payloadLength, ...payload, checksum];

  const hexString = frame.map((b) => b.toString(16).padStart(2, "0")).join(" ");

  // Browser-compatible Base64 encoding
  const byteString = String.fromCharCode.apply(null, frame);
  const base64String = btoa(byteString);

  return { hex: hexString, base64: base64String };
}

// --- Reusable UI Component ---
const EditableDetailsField = ({
  label,
  value,
  unit,
  onChange,
  type = "text",
  min,
  max,
  select = false,
  options = [],
  error,
}) => {
  const renderField = () => {
    if (type === "switch") {
      return (
        <Index.FormControlLabel
          control={
            <Index.Switch
              checked={value === 1}
              onChange={(e) => onChange(e.target.checked ? 1 : 0)}
            />
          }
          label={value === 1 ? "On" : "Off"}
        />
      );
    }
    if (type === "datetime") {
      return (
        <DateTimePicker
          value={value}
          onChange={onChange}
          renderInput={(params) => (
            <Index.TextField
              {...params}
              fullWidth
              size="small"
              error={!!error}
              helperText={error}
            />
          )}
        />
      );
    }
    if (select) {
      return (
        <Index.FormControl fullWidth size="small" error={!!error}>
          <Index.Select
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            {options.map((option) => (
              <Index.MenuItem key={option.value} value={option.value}>
                {option.label}
              </Index.MenuItem>
            ))}
          </Index.Select>
          {error && <Index.FormHelperText>{error}</Index.FormHelperText>}
        </Index.FormControl>
      );
    }
    return (
      <Index.TextField
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        size="small"
        InputProps={{
          endAdornment: unit ? (
            <Index.Typography sx={{ marginLeft: "5px" }}>
              {unit}
            </Index.Typography>
          ) : null,
        }}
        inputProps={{ min, max }}
        error={!!error}
        helperText={error}
      />
    );
  };
  return (
    <Index.Box sx={{ marginBottom: "10px" }}>
      <Index.Typography variant="body2" color="textSecondary">
        {label}
      </Index.Typography>
      {renderField()}
    </Index.Box>
  );
};

// --- UI Helper Constants ---
const getMinMax = (key) => {
  const config = protocolConfigurations[key.toUpperCase()];
  return config ? { min: config.min, max: config.max } : {};
};

const homePositionOptions = [
  { value: 2, label: "Left" },
  { value: 1, label: "Right" },
];

const motorConfigKeys =
  protocolConfigurations.ALL_MOTOR_RELATED_DATA.fields.map((f) =>
    f.name.toLowerCase()
  );
const otherConfigKeys = protocolConfigurations.OTHER_DATA.fields.map((f) =>
  f.name.toLowerCase()
);

// --- Main React Component ---
const Config = ({ devEui }) => {
  const { profile } = useContext(PageIndex.ProfileContext);
  const permissions = profile?.Role?.permissions || [];
  const [editedData, setEditedData] = useState({});
  const [isMotorDirty, setIsMotorDirty] = useState(false);
  const [isOtherDirty, setIsOtherDirty] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const initialData = useRef(null);
  const [errors, setErrors] = useState({});
  const sequenceIdRef = useRef(1); // To manage command sequence ID

  const fetchData = useCallback(async () => {
    try {
      const response = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_ADD_EDIT_DEVICES + `/telemetry/${devEui}`
      );
      if (response.status === 200) {
        const configData = response.data.device.configuration;

        const initialConfig = { ...configData };
        if (configData.rtc_time) {
          configData.rtc_time = dayjs.unix(configData.rtc_time);
          initialConfig.rtc_time = dayjs.unix(initialConfig.rtc_time);
        } else {
          configData.rtc_time = null;
          initialConfig.rtc_time = null;
        }

        setEditedData(configData);
        initialData.current = initialConfig;

        // Reset dirty states and errors on refresh
        setIsMotorDirty(false);
        setIsOtherDirty(false);
        setErrors({});
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [devEui]);

  useEffect(() => {
    if (devEui) {
      fetchData();
    }
  }, [devEui, fetchData]);

  useEffect(() => {
    if (initialData.current) {
      const motorHasChanged = motorConfigKeys.some(
        (key) => initialData.current[key] !== editedData[key]
      );
      setIsMotorDirty(motorHasChanged);

      const otherHasChanged = otherConfigKeys.some((key) => {
        const initialValue = initialData.current[key];
        const currentValue = editedData[key];
        if (
          key === "rtc_time" &&
          dayjs.isDayjs(initialValue) &&
          dayjs.isDayjs(currentValue)
        ) {
          return initialValue.unix() !== currentValue.unix();
        }
        return initialValue !== currentValue;
      });
      setIsOtherDirty(otherHasChanged);
    }
  }, [editedData]);

  const handleFieldChange = (field, min, max) => (inputValue) => {
    if (inputValue === "" || inputValue === null) {
      setErrors((prev) => ({
        ...prev,
        [field]: "This field cannot be empty.",
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    if (inputValue === "") {
      setEditedData((prev) => ({ ...prev, [field]: "" }));
      return;
    }
    let newValue = Number(inputValue);
    if (min !== undefined && newValue < min) newValue = min;
    if (max !== undefined && newValue > max) newValue = max;
    if (!isNaN(newValue)) {
      setEditedData((prev) => ({ ...prev, [field]: newValue }));
    }
  };

  const handleValueChange = (field) => (newValue) => {
    if (newValue === null) {
      setErrors((prev) => ({ ...prev, [field]: "Please select a value." }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    setEditedData((prev) => ({ ...prev, [field]: newValue }));
  };

  const validateOnSave = (fieldsToValidate) => {
    const newErrors = {};
    fieldsToValidate.forEach((key) => {
      const value = editedData[key];
      if (value === null || value === undefined || value === "") {
        const label = protocolConfigurations[key.toUpperCase()]?.label || key;
        newErrors[key] = `${label} is a required field.`;
      }
    });
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveMotorConfig = async () => {
    if (!validateOnSave(motorConfigKeys)) {
      console.log("Motor validation failed.");
      return;
    }

    const configValue = {};
    motorConfigKeys.forEach((key) => {
      configValue[key.toUpperCase()] = editedData[key];
    });
    console.log("Generated Motor Config Value:", configValue);
    const command = generateChirpstackConfigCommand(
      "ALL_MOTOR_RELATED_DATA",
      configValue,
      sequenceIdRef.current
    );

    if (command) {
      console.log("Generated Motor Config Command (Base64):", command.base64);
      console.log("Generated Motor Config Command (Hex):", command.hex);
      const res = await PagesIndex.apiPostHandler(
        `${PagesIndex.Api.GET_ADD_EDIT_DEVICES}/config/queue`,
        { devEui, command: command.base64, type: "motor" }
      );
      console.log(res);
      sequenceIdRef.current += 1;
    }

    const newInitialData = { ...initialData.current };
    motorConfigKeys.forEach((key) => {
      newInitialData[key] = editedData[key];
    });
    initialData.current = newInitialData;
    setIsMotorDirty(false);
    setErrors((prev) => {
      const nextErrors = { ...prev };
      motorConfigKeys.forEach((key) => delete nextErrors[key]);
      return nextErrors;
    });
  };

  const handleSaveOtherConfig = async () => {
    if (!validateOnSave(otherConfigKeys)) {
      console.log("Other configuration validation failed.");
      return;
    }

    const configValue = {};
    otherConfigKeys.forEach((key) => {
      const upperCaseKey = key.toUpperCase();
      if (key === "rtc_time" && dayjs.isDayjs(editedData[key])) {
        configValue[upperCaseKey] = editedData[key].unix();
      } else {
        configValue[upperCaseKey] = editedData[key];
      }
    });
    console.log("Generated other Config Value:", configValue);

    const command = generateChirpstackConfigCommand(
      "OTHER_DATA",
      configValue,
      sequenceIdRef.current
    );

    if (command) {
      console.log("Generated Other Config Command (Base64):", command.base64);
      console.log("Generated Other Config Command (Hex):", command.hex);
      const res = await PagesIndex.apiPostHandler(
        `${PagesIndex.Api.GET_ADD_EDIT_DEVICES}/config/queue`,
        { devEui, command: command.base64 }
      );
      console.log(res);
      sequenceIdRef.current += 1;
    }

    const newInitialData = { ...initialData.current };
    otherConfigKeys.forEach((key) => {
      newInitialData[key] = editedData[key];
    });
    initialData.current = newInitialData;
    setIsOtherDirty(false);
    setErrors((prev) => {
      const nextErrors = { ...prev };
      otherConfigKeys.forEach((key) => delete nextErrors[key]);
      return nextErrors;
    });
  };

  const getValue = (key) => {
    const value = editedData[key];
    if (key === "rtc_time") return value;
    if (key === "lock_switches" || key === "home_position") return value ?? 1;
    return value === "" ? "" : value ?? 0;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await PagesIndex.apiPostHandler(
        `${PagesIndex.Api.GET_ADD_EDIT_DEVICES}/queue`,
        { devEui, type: "GET_CONFIGURATION_88" }
      );
      if (res.status === 200) {
        await PagesIndex.apiPostHandler(
          `${PagesIndex.Api.GET_ADD_EDIT_DEVICES}/queue`,
          { devEui, type: "GET_CONFIGURATION_87" }
        );
        toasterSuccess("Data refreshing please wait...");
        setIsRefreshing(false);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Index.Box>
        {permissions?.includes("robotconfig_refresh") && (
          <Index.Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Index.Button
              sx={{
                fontSize: "14px",
                right: "0",
                background: "rgba(0,0,255,0.1)",
                padding: "5px 0",
                width: "120px",
                color: "blue",
                borderRadius: "20px",
                textAlign: "center",
                float: "right",
                opacity: isRefreshing ? 0.6 : 1,
                cursor: isRefreshing ? "not-allowed" : "pointer",
              }}
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Index.Button>
            {/* <Index.IconButton
              onClick={handleRefresh}
              aria-label="Refresh configuration data"
              title="Refresh configuration data"
            >
              <RefreshIcon />
            </Index.IconButton> */}
          </Index.Box>
        )}

        <Index.Typography sx={{ my: "10px" }} className="action-title">
          Brush Motor Configuration
        </Index.Typography>
        <Index.Grid container spacing={2}>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Duty cycle"}
              value={getValue("brush_motor_dutycycle")}
              unit="%"
              onChange={handleFieldChange(
                "brush_motor_dutycycle",
                getMinMax("BRUSH_MOTOR_DUTYCYCLE").min,
                getMinMax("BRUSH_MOTOR_DUTYCYCLE").max
              )}
              type="number"
              min={getMinMax("BRUSH_MOTOR_DUTYCYCLE").min}
              max={getMinMax("BRUSH_MOTOR_DUTYCYCLE").max}
              error={errors.brush_motor_dutycycle}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Frequency"}
              value={getValue("brush_motor_frequency")}
              unit="Hz"
              onChange={handleFieldChange(
                "brush_motor_frequency",
                getMinMax("BRUSH_MOTOR_FREQUENCY").min,
                getMinMax("BRUSH_MOTOR_FREQUENCY").max
              )}
              type="number"
              min={getMinMax("BRUSH_MOTOR_FREQUENCY").min}
              max={getMinMax("BRUSH_MOTOR_FREQUENCY").max}
              error={errors.brush_motor_frequency}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Temp upper threshold"}
              value={getValue("brush_motor_temperature_upper_threshold")}
              unit="°C"
              onChange={handleFieldChange(
                "brush_motor_temperature_upper_threshold",
                getMinMax("BRUSH_MOTOR_TEMPERATURE_UPPER_THRESHOLD").min,
                getMinMax("BRUSH_MOTOR_TEMPERATURE_UPPER_THRESHOLD").max
              )}
              type="number"
              min={getMinMax("BRUSH_MOTOR_TEMPERATURE_UPPER_THRESHOLD").min}
              max={getMinMax("BRUSH_MOTOR_TEMPERATURE_UPPER_THRESHOLD").max}
              error={errors.brush_motor_temperature_upper_threshold}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Temp lower threshold"}
              value={getValue("brush_motor_temperature_lower_threshold")}
              unit="°C"
              onChange={handleFieldChange(
                "brush_motor_temperature_lower_threshold",
                getMinMax("BRUSH_MOTOR_TEMPERATURE_LOWER_THRESHOLD").min,
                getMinMax("BRUSH_MOTOR_TEMPERATURE_LOWER_THRESHOLD").max
              )}
              type="number"
              min={getMinMax("BRUSH_MOTOR_TEMPERATURE_LOWER_THRESHOLD").min}
              max={getMinMax("BRUSH_MOTOR_TEMPERATURE_LOWER_THRESHOLD").max}
              error={errors.brush_motor_temperature_lower_threshold}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Voltage upper threshold"}
              value={getValue("brush_motor_voltage_upper_threshold")}
              unit="V"
              onChange={handleFieldChange(
                "brush_motor_voltage_upper_threshold",
                getMinMax("BRUSH_MOTOR_VOLTAGE_UPPER_THRESHOLD").min,
                getMinMax("BRUSH_MOTOR_VOLTAGE_UPPER_THRESHOLD").max
              )}
              type="number"
              min={getMinMax("BRUSH_MOTOR_VOLTAGE_UPPER_THRESHOLD").min}
              max={getMinMax("BRUSH_MOTOR_VOLTAGE_UPPER_THRESHOLD").max}
              error={errors.brush_motor_voltage_upper_threshold}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Voltage lower threshold"}
              value={getValue("brush_motor_voltage_lower_threshold")}
              unit="V"
              onChange={handleFieldChange(
                "brush_motor_voltage_lower_threshold",
                getMinMax("BRUSH_MOTOR_VOLTAGE_LOWER_THRESHOLD").min,
                getMinMax("BRUSH_MOTOR_VOLTAGE_LOWER_THRESHOLD").max
              )}
              type="number"
              min={getMinMax("BRUSH_MOTOR_VOLTAGE_LOWER_THRESHOLD").min}
              max={getMinMax("BRUSH_MOTOR_VOLTAGE_LOWER_THRESHOLD").max}
              error={errors.brush_motor_voltage_lower_threshold}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Current upper threshold"}
              value={getValue("brush_motor_current_upper_threshold")}
              unit="mA"
              onChange={handleFieldChange(
                "brush_motor_current_upper_threshold",
                getMinMax("BRUSH_MOTOR_CURRENT_UPPER_THRESHOLD").min,
                getMinMax("BRUSH_MOTOR_CURRENT_UPPER_THRESHOLD").max
              )}
              type="number"
              min={getMinMax("BRUSH_MOTOR_CURRENT_UPPER_THRESHOLD").min}
              max={getMinMax("BRUSH_MOTOR_CURRENT_UPPER_THRESHOLD").max}
              error={errors.brush_motor_current_upper_threshold}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Current lower threshold"}
              value={getValue("brush_motor_current_lower_threshold")}
              unit="mA"
              onChange={handleFieldChange(
                "brush_motor_current_lower_threshold",
                getMinMax("BRUSH_MOTOR_CURRENT_LOWER_THRESHOLD").min,
                getMinMax("BRUSH_MOTOR_CURRENT_LOWER_THRESHOLD").max
              )}
              type="number"
              min={getMinMax("BRUSH_MOTOR_CURRENT_LOWER_THRESHOLD").min}
              max={getMinMax("BRUSH_MOTOR_CURRENT_LOWER_THRESHOLD").max}
              error={errors.brush_motor_current_lower_threshold}
            />
          </Index.Grid>
        </Index.Grid>

        {/* --- LEFT MOTOR SECTION --- */}
        <Index.Typography sx={{ my: "10px" }} className="action-title">
          Left Motor Configuration
        </Index.Typography>
        <Index.Grid container spacing={2}>
          {/* ...all left motor EditableDetailsField components... */}
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Duty cycle"}
              value={getValue("left_motor_dutycycle")}
              unit="%"
              onChange={handleFieldChange(
                "left_motor_dutycycle",
                getMinMax("LEFT_MOTOR_DUTYCYCLE").min,
                getMinMax("LEFT_MOTOR_DUTYCYCLE").max
              )}
              type="number"
              min={getMinMax("LEFT_MOTOR_DUTYCYCLE").min}
              max={getMinMax("LEFT_MOTOR_DUTYCYCLE").max}
              error={errors.left_motor_dutycycle}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Frequency"}
              value={getValue("left_motor_frequency")}
              unit="Hz"
              onChange={handleFieldChange(
                "left_motor_frequency",
                getMinMax("LEFT_MOTOR_FREQUENCY").min,
                getMinMax("LEFT_MOTOR_FREQUENCY").max
              )}
              type="number"
              min={getMinMax("LEFT_MOTOR_FREQUENCY").min}
              max={getMinMax("LEFT_MOTOR_FREQUENCY").max}
              error={errors.left_motor_frequency}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Temp upper threshold"}
              value={getValue("left_motor_temperature_upper_threshold")}
              unit="°C"
              onChange={handleFieldChange(
                "left_motor_temperature_upper_threshold",
                getMinMax("LEFT_MOTOR_TEMPERATURE_UPPER_THRESHOLD").min,
                getMinMax("LEFT_MOTOR_TEMPERATURE_UPPER_THRESHOLD").max
              )}
              type="number"
              min={getMinMax("LEFT_MOTOR_TEMPERATURE_UPPER_THRESHOLD").min}
              max={getMinMax("LEFT_MOTOR_TEMPERATURE_UPPER_THRESHOLD").max}
              error={errors.left_motor_temperature_upper_threshold}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Temp lower threshold"}
              value={getValue("left_motor_temperature_lower_threshold")}
              unit="°C"
              onChange={handleFieldChange(
                "left_motor_temperature_lower_threshold",
                getMinMax("LEFT_MOTOR_TEMPERATURE_LOWER_THRESHOLD").min,
                getMinMax("LEFT_MOTOR_TEMPERATURE_LOWER_THRESHOLD").max
              )}
              type="number"
              min={getMinMax("LEFT_MOTOR_TEMPERATURE_LOWER_THRESHOLD").min}
              max={getMinMax("LEFT_MOTOR_TEMPERATURE_LOWER_THRESHOLD").max}
              error={errors.left_motor_temperature_lower_threshold}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Voltage upper threshold"}
              value={getValue("left_motor_voltage_upper_threshold")}
              unit="V"
              onChange={handleFieldChange(
                "left_motor_voltage_upper_threshold",
                getMinMax("LEFT_MOTOR_VOLTAGE_UPPER_THRESHOLD").min,
                getMinMax("LEFT_MOTOR_VOLTAGE_UPPER_THRESHOLD").max
              )}
              type="number"
              min={getMinMax("LEFT_MOTOR_VOLTAGE_UPPER_THRESHOLD").min}
              max={getMinMax("LEFT_MOTOR_VOLTAGE_UPPER_THRESHOLD").max}
              error={errors.left_motor_voltage_upper_threshold}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Voltage lower threshold"}
              value={getValue("left_motor_voltage_lower_threshold")}
              unit="V"
              onChange={handleFieldChange(
                "left_motor_voltage_lower_threshold",
                getMinMax("LEFT_MOTOR_VOLTAGE_LOWER_THRESHOLD").min,
                getMinMax("LEFT_MOTOR_VOLTAGE_LOWER_THRESHOLD").max
              )}
              type="number"
              min={getMinMax("LEFT_MOTOR_VOLTAGE_LOWER_THRESHOLD").min}
              max={getMinMax("LEFT_MOTOR_VOLTAGE_LOWER_THRESHOLD").max}
              error={errors.left_motor_voltage_lower_threshold}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Current upper threshold"}
              value={getValue("left_motor_current_upper_threshold")}
              unit="mA"
              onChange={handleFieldChange(
                "left_motor_current_upper_threshold",
                getMinMax("LEFT_MOTOR_CURRENT_UPPER_THRESHOLD").min,
                getMinMax("LEFT_MOTOR_CURRENT_UPPER_THRESHOLD").max
              )}
              type="number"
              min={getMinMax("LEFT_MOTOR_CURRENT_UPPER_THRESHOLD").min}
              max={getMinMax("LEFT_MOTOR_CURRENT_UPPER_THRESHOLD").max}
              error={errors.left_motor_current_upper_threshold}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Current lower threshold"}
              value={getValue("left_motor_current_lower_threshold")}
              unit="mA"
              onChange={handleFieldChange(
                "left_motor_current_lower_threshold",
                getMinMax("LEFT_MOTOR_CURRENT_LOWER_THRESHOLD").min,
                getMinMax("LEFT_MOTOR_CURRENT_LOWER_THRESHOLD").max
              )}
              type="number"
              min={getMinMax("LEFT_MOTOR_CURRENT_LOWER_THRESHOLD").min}
              max={getMinMax("LEFT_MOTOR_CURRENT_LOWER_THRESHOLD").max}
              error={errors.left_motor_current_lower_threshold}
            />
          </Index.Grid>
        </Index.Grid>

        {/* --- RIGHT MOTOR SECTION --- */}
        <Index.Typography sx={{ my: "10px" }} className="action-title">
          Right Motor Configuration
        </Index.Typography>
        <Index.Grid container spacing={2}>
          {/* ...all right motor EditableDetailsField components... */}
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Duty cycle"}
              value={getValue("right_motor_dutycycle")}
              unit="%"
              onChange={handleFieldChange(
                "right_motor_dutycycle",
                getMinMax("RIGHT_MOTOR_DUTYCYCLE").min,
                getMinMax("RIGHT_MOTOR_DUTYCYCLE").max
              )}
              type="number"
              min={getMinMax("RIGHT_MOTOR_DUTYCYCLE").min}
              max={getMinMax("RIGHT_MOTOR_DUTYCYCLE").max}
              error={errors.right_motor_dutycycle}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Frequency"}
              value={getValue("right_motor_frequency")}
              unit="Hz"
              onChange={handleFieldChange(
                "right_motor_frequency",
                getMinMax("RIGHT_MOTOR_FREQUENCY").min,
                getMinMax("RIGHT_MOTOR_FREQUENCY").max
              )}
              type="number"
              min={getMinMax("RIGHT_MOTOR_FREQUENCY").min}
              max={getMinMax("RIGHT_MOTOR_FREQUENCY").max}
              error={errors.right_motor_frequency}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Temp upper threshold"}
              value={getValue("right_motor_temperature_upper_threshold")}
              unit="°C"
              onChange={handleFieldChange(
                "right_motor_temperature_upper_threshold",
                getMinMax("RIGHT_MOTOR_TEMPERATURE_UPPER_THRESHOLD").min,
                getMinMax("RIGHT_MOTOR_TEMPERATURE_UPPER_THRESHOLD").max
              )}
              type="number"
              min={getMinMax("RIGHT_MOTOR_TEMPERATURE_UPPER_THRESHOLD").min}
              max={getMinMax("RIGHT_MOTOR_TEMPERATURE_UPPER_THRESHOLD").max}
              error={errors.right_motor_temperature_upper_threshold}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Temp lower threshold"}
              value={getValue("right_motor_temperature_lower_threshold")}
              unit="°C"
              onChange={handleFieldChange(
                "right_motor_temperature_lower_threshold",
                getMinMax("RIGHT_MOTOR_TEMPERATURE_LOWER_THRESHOLD").min,
                getMinMax("RIGHT_MOTOR_TEMPERATURE_LOWER_THRESHOLD").max
              )}
              type="number"
              min={getMinMax("RIGHT_MOTOR_TEMPERATURE_LOWER_THRESHOLD").min}
              max={getMinMax("RIGHT_MOTOR_TEMPERATURE_LOWER_THRESHOLD").max}
              error={errors.right_motor_temperature_lower_threshold}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Voltage upper threshold"}
              value={getValue("right_motor_voltage_upper_threshold")}
              unit="V"
              onChange={handleFieldChange(
                "right_motor_voltage_upper_threshold",
                getMinMax("RIGHT_MOTOR_VOLTAGE_UPPER_THRESHOLD").min,
                getMinMax("RIGHT_MOTOR_VOLTAGE_UPPER_THRESHOLD").max
              )}
              type="number"
              min={getMinMax("RIGHT_MOTOR_VOLTAGE_UPPER_THRESHOLD").min}
              max={getMinMax("RIGHT_MOTOR_VOLTAGE_UPPER_THRESHOLD").max}
              error={errors.right_motor_voltage_upper_threshold}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Voltage lower threshold"}
              value={getValue("right_motor_voltage_lower_threshold")}
              unit="V"
              onChange={handleFieldChange(
                "right_motor_voltage_lower_threshold",
                getMinMax("RIGHT_MOTOR_VOLTAGE_LOWER_THRESHOLD").min,
                getMinMax("RIGHT_MOTOR_VOLTAGE_LOWER_THRESHOLD").max
              )}
              type="number"
              min={getMinMax("RIGHT_MOTOR_VOLTAGE_LOWER_THRESHOLD").min}
              max={getMinMax("RIGHT_MOTOR_VOLTAGE_LOWER_THRESHOLD").max}
              error={errors.right_motor_voltage_lower_threshold}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Current upper threshold"}
              value={getValue("right_motor_current_upper_threshold")}
              unit="mA"
              onChange={handleFieldChange(
                "right_motor_current_upper_threshold",
                getMinMax("RIGHT_MOTOR_CURRENT_UPPER_THRESHOLD").min,
                getMinMax("RIGHT_MOTOR_CURRENT_UPPER_THRESHOLD").max
              )}
              type="number"
              min={getMinMax("RIGHT_MOTOR_CURRENT_UPPER_THRESHOLD").min}
              max={getMinMax("RIGHT_MOTOR_CURRENT_UPPER_THRESHOLD").max}
              error={errors.right_motor_current_upper_threshold}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Current lower threshold"}
              value={getValue("right_motor_current_lower_threshold")}
              unit="mA"
              onChange={handleFieldChange(
                "right_motor_current_lower_threshold",
                getMinMax("RIGHT_MOTOR_CURRENT_LOWER_THRESHOLD").min,
                getMinMax("RIGHT_MOTOR_CURRENT_LOWER_THRESHOLD").max
              )}
              type="number"
              min={getMinMax("RIGHT_MOTOR_CURRENT_LOWER_THRESHOLD").min}
              max={getMinMax("RIGHT_MOTOR_CURRENT_LOWER_THRESHOLD").max}
              error={errors.right_motor_current_lower_threshold}
            />
          </Index.Grid>
        </Index.Grid>

        {permissions?.includes("robotconfig_edit") && (
          <Index.Box
            sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
          >
            <Index.Button
              variant="contained"
              color="primary"
              onClick={handleSaveMotorConfig}
              disabled={!isMotorDirty}
            >
              Save Motor Configurations
            </Index.Button>
          </Index.Box>
        )}

        <Index.Divider sx={{ my: 3 }} />

        <Index.Typography sx={{ my: "10px" }} className="action-title">
          Other Configuration
        </Index.Typography>
        <Index.Grid container spacing={2}>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Battery level lower threshold"}
              value={getValue("main_battery_soc_lower_threshold")}
              onChange={handleFieldChange(
                "main_battery_soc_lower_threshold",
                getMinMax("MAIN_BATTERY_SOC_LOWER_THRESHOLD").min,
                getMinMax("MAIN_BATTERY_SOC_LOWER_THRESHOLD").max
              )}
              type="number"
              unit="%"
              error={errors.main_battery_soc_lower_threshold}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Battery level one cycle"}
              value={getValue("main_battery_soc_requirement_one_cycle")}
              onChange={handleFieldChange(
                "main_battery_soc_requirement_one_cycle",
                getMinMax("MAIN_BATTERY_SOC_REQUIREMENT_ONE_CYCLE").min,
                getMinMax("MAIN_BATTERY_SOC_REQUIREMENT_ONE_CYCLE").max
              )}
              type="number"
              unit="%"
              error={errors.main_battery_soc_requirement_one_cycle}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Device status interval"}
              value={getValue("device_status_interval")}
              onChange={handleFieldChange(
                "device_status_interval",
                getMinMax("DEVICE_STATUS_INTERVAL").min,
                getMinMax("DEVICE_STATUS_INTERVAL").max
              )}
              type="number"
              unit="s"
              error={errors.device_status_interval}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Home position"}
              value={getValue("home_position")}
              onChange={handleValueChange("home_position")}
              select={true}
              options={homePositionOptions}
              error={errors.home_position}
            />
          </Index.Grid>
        </Index.Grid>

        <Index.Grid container spacing={2}>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Charging distance"}
              value={getValue("charging_distance")}
              onChange={handleFieldChange(
                "charging_distance",
                getMinMax("CHARGING_DISTANCE").min,
                getMinMax("CHARGING_DISTANCE").max
              )}
              type="number"
              unit="cm"
              error={errors.charging_distance}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Alarm error status interval"}
              value={getValue("alarm_status_error_state_interval")}
              onChange={handleFieldChange(
                "alarm_status_error_state_interval",
                getMinMax("ALARM_STATUS_ERROR_STATE_INTERVAL").min,
                getMinMax("ALARM_STATUS_ERROR_STATE_INTERVAL").max
              )}
              type="number"
              unit="s"
              error={errors.alarm_status_error_state_interval}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Update state timeout"}
              value={getValue("update_state_timeout")}
              onChange={handleFieldChange(
                "update_state_timeout",
                getMinMax("UPDATE_STATE_TIMEOUT").min,
                getMinMax("UPDATE_STATE_TIMEOUT").max
              )}
              type="number"
              unit="s"
              error={errors.update_state_timeout}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Maintenance state timeout"}
              value={getValue("maintenance_state_timeout")}
              onChange={handleFieldChange(
                "maintenance_state_timeout",
                getMinMax("MAINTENANCE_STATE_TIMEOUT").min,
                getMinMax("MAINTENANCE_STATE_TIMEOUT").max
              )}
              type="number"
              unit="s"
              error={errors.maintenance_state_timeout}
            />
          </Index.Grid>
        </Index.Grid>

        <Index.Grid container spacing={2}>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"RTC time sync interval"}
              value={getValue("rtc_time_sync_interval")}
              onChange={handleFieldChange(
                "rtc_time_sync_interval",
                getMinMax("RTC_TIME_SYNC_INTERVAL").min,
                getMinMax("RTC_TIME_SYNC_INTERVAL").max
              )}
              type="number"
              unit="s"
              error={errors.rtc_time_sync_interval}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"RTC time"}
              value={getValue("rtc_time")}
              onChange={handleValueChange("rtc_time")}
              type="datetime"
              error={errors.rtc_time}
            />
          </Index.Grid>
          <Index.Grid item lg={3} xs={12} sm={6}>
            <EditableDetailsField
              label={"Lock switch"}
              value={getValue("lock_switches")}
              onChange={handleValueChange("lock_switches")}
              type="switch"
              error={errors.lock_switches}
            />
          </Index.Grid>
        </Index.Grid>

        {permissions?.includes("robotconfig_edit") && (
          <Index.Box
            sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
          >
            <Index.Button
              variant="contained"
              color="primary"
              onClick={handleSaveOtherConfig}
              disabled={!isOtherDirty}
            >
              Save Other Configurations
            </Index.Button>
          </Index.Box>
        )}
      </Index.Box>
    </LocalizationProvider>
  );
};

export default Config;
