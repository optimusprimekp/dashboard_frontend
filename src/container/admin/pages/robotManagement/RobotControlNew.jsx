import Index from "../../../Index";
import "react-circular-progressbar/dist/styles.css";
import PagesIndex from "../../../PagesIndex";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import DataTable from "../../../../component/common/dataTable/DataTable";
import mqtt from "mqtt";
import { useLocation, useParams } from "react-router-dom";
import * as THREE from "three";
import TabLayout from "../../../../component/common/tabs/TabLayout";
import DetailsField from "../../../../component/common/detailsField/DetailsField";
import ActionButton from "../../../../component/common/Button/ActionButton";
import {
  GoogleMap,
  MarkerF,
  useLoadScript,
  Polyline,
  InfoWindow,
  KmlLayer,
} from "@react-google-maps/api";
import RobotDistanceTravelled from "../../../../component/common/robotDetailComponents/RobotDistanceTravelled";
import moment from "moment";
import { CircularProgress, TextField } from "@mui/material";
import Config from "./Config";
import { CSVLink } from "react-csv";
import PageIndex from "../../../../component/PagesIndex";
import MadgwickAHRS from "../../../../utils/madgwick";
import {
  toasterError,
  toasterSuccess,
} from "../../../../utils/toaster/toaster";

export default function RobotControlNew() {
  const { profile } = useContext(PageIndex.ProfileContext);
  const permissions = profile?.Role?.permissions || [];
  const location = useLocation();
  const { data } = location.state || {};
  const [historicalData, setHistoricalData] = useState([]);
  const [totalHistoricalCount, setTotalHistoricalCount] = useState(0);
  const [historicalCurrentPage, setHistoricalCurrentPage] = useState(1);
  const [client, setClient] = useState(null);
  const { appId, devEui } = useParams();
  const [deviceData, setDeviceData] = useState({});
  const [roboData, setRoboData] = useState({});
  const [cubeRotation, setCubeRotation] = useState({ x: 0, y: 0, z: 0 });
  const [imuData, setImuData] = useState({
    accX: 0,
    accY: 0,
    accZ: 0,
    gyroX: 0,
    gyroY: 0,
    gyroZ: 0,
  });
  const [alarmListData, setAlarmListData] = useState([]);
  const [joiningData, setJoinigData] = useState([]);
  const [alarmListTotalCount, setAlarmListTotalCount] = useState(0);
  const [alarmCurrentPage, setAlarmCurrentPage] = useState(1);
  const [disabledButtons, setDisabledButtons] = useState(false);
  const [commandStatus, setCommandStatus] = useState(undefined);
  const [commandStatusMessage, setCommandStatusMessage] = useState("");
  const [commandHistory, setCommandHistory] = useState([]);
  const [pathData, setPathData] = useState([]);
  const [centerGps, setCenterGps] = useState({ lat: 0, lng: 0 });
  const [positionData, setPositionData] = useState({
    hlat: 0,
    hlng: 0,
    rlat: 0,
    rlng: 0,
  });
  const [showInfo, setShowInfo] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceDetails, setDeviceDetails] = useState({});
  const [isResettingPath, setIsResettingPath] = useState(false);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_KEY,
  });
  const kmlUrl =
    "https://www.google.com/maps/d/u/0/kml?mid=1daXMx_xd7ll-uZzUmRy0I1DSQ8dAfAw&ehbc=2E312F";

  // --- States and Refs for Export Functionality ---
  const [isExportingAlarms, setIsExportingAlarms] = useState(false);
  const [alarmExportData, setAlarmExportData] = useState([]);
  const alarmCsvLinkRef = useRef(null);

  const [isExportingHistorical, setIsExportingHistorical] = useState(false);
  const [historicalExportData, setHistoricalExportData] = useState([]);
  const historicalCsvLinkRef = useRef(null);

  // --- States and Handlers for the Alarm Filter Bar ---
  const [alarmFilters, setAlarmFilters] = useState({
    startDate: "",
    endDate: "",
    alarmCode: "",
    alarmName: "",
  });

  const alarmInitialValues = {
    startDate: "",
    endDate: "",
    alarmCode: "",
    alarmName: "",
  };

  const handleSubmitAlarmForm = (values) => {
    setAlarmFilters(values); // Keep track of active filters for pagination
    getAlarmList(1, values);
  };

  const handleResetAlarmFilters = (resetForm) => {
    const clearedFilters = {
      startDate: "",
      endDate: "",
      alarmCode: "",
      alarmName: "",
    };
    resetForm(); // This is the key fix: reset Formik's state
    setAlarmFilters(clearedFilters); // Also reset our tracking state
    getAlarmList(1, clearedFilters);
  };
  const [historicalFilters, setHistoricalFilters] = useState({
    startDate: "",
    endDate: "",
  });

  const handleHistoricalFilterChange = (e) => {
    let { name, value } = e.target;
    setHistoricalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyHistoricalFilters = () => {
    getHistoricalList(1, historicalFilters);
  };

  const handleResetHistoricalFilters = () => {
    const clearedFilters = { startDate: "", endDate: "" };
    setHistoricalFilters(clearedFilters);
    getHistoricalList(1, clearedFilters);
  };
  // --- End of Historical Filter States and Handlers ---

  const handleDisabledButtonAction = () => {
    setDisabledButtons(true);
    setTimeout(() => {
      setDisabledButtons(false);
    }, 1000);
  };

  function formatData(data, time) {
    return {
      left_motor: {
        temperature: data?.left_motor?.temp || 0,
        current: data?.left_motor?.current / 1000 || 0,
        voltage: data?.left_motor?.voltage / 1000 || 0,
        speed: data?.left_motor?.speed || 0,
      },
      right_motor: {
        temperature: data?.right_motor?.temp || 0,
        current: data?.right_motor?.current / 1000 || 0,
        voltage: data?.right_motor?.voltage / 1000 || 0,
        speed: data?.right_motor?.speed || 0,
      },
      brush_motor: {
        temperature: data?.brush_motor?.temp || 0,
        current: data?.brush_motor?.current / 1000 || 0,
        voltage: data?.brush_motor?.voltage / 1000 || 0,
        speed: data?.brush_motor?.speed || 0,
      },
      main_battery: {
        level: data?.main_battery?.level || 0,
        temp: data?.main_battery?.temp || 0,
        current: data?.main_battery?.current / 1000 || 0,
        voltage: data?.main_battery?.voltage / 1000 || 0,
        discharging_switch: data?.main_battery?.discharging_switch ?? "-",
        charging_switch: data?.main_battery?.charging_switch ?? "-",
        load_status: data?.main_battery?.load_status ?? "-",
        state: data?.main_battery?.state || "-",
      },
      aux_battery: {
        level: data?.aux_battery?.level || data?.aux_battery?.level || 0,
        temp: data?.aux_battery?.temp || 0,
        current: data?.aux_battery?.current / 1000 || 0,
        voltage: data?.aux_battery?.voltage / 1000 || 0,
      },
      robot: {
        distance_traveled:
          data?.robot?.distance_traveled || data?.robot?.distance_traveled || 0,
        direction: data?.robot?.direction || data?.robot?.direction || "-",
        speed: data?.robot?.speed / 100 || data?.robot?.speed || 0,
      },
      imu: {
        gyro_x: data?.imu?.gyro_x || 0,
        gyro_y: data?.imu?.gyro_y || 0,
        gyro_z: data?.imu?.gyro_z || 0,
        accel_x: data?.imu?.accel_x || data?.imu?.acc_x || 0,
        accel_y: data?.imu?.accel_y || data?.imu?.acc_y || 0,
        accel_z: data?.imu?.accel_z || data?.imu?.acc_z || 0,
      },
      gps: {
        latitude: data?.gps?.latitude || data?.gps?.latitude,
        longitude: data?.gps?.longitude || data?.gps?.longitude,
        altitude: data?.gps?.altitude || data?.gps?.altitude,
      },
      running_command: data?.running_command || data?.running_command || "-",
      state: data?.device_state || data?.state || "-",
      time: time || data?.time || data?.lastSeen,
      status_byte: data?.status_byte || {},
    };
  }

  const handleResetGpsPath = async () => {
    try {
      setIsResettingPath(true);
      const url = `${PagesIndex.Api.GET_ADD_EDIT_DEVICES}/gps-path/reset/${devEui}`; // <-- Replace with your actual API endpoint
      const res = await PagesIndex.apiPostHandler(url, {});

      if (res?.status === 200) {
        PagesIndex.toasterSuccess("GPS path data reset successfully.");
        setPathData([]); // Clear path in UI
        apiData(devEui); // Refresh device data
      } else {
        PagesIndex.toasterError(
          res?.message || "Failed to reset GPS path data.",
        );
      }
    } catch (error) {
      console.error(error);
      PagesIndex.toasterError("An error occurred while resetting GPS path.");
    } finally {
      setIsResettingPath(false);
    }
  };
  const addCommandHistory = async (devEui, commandType) => {
    try {
      const payload = {
        devEui,
        command: commandType,
        triggeredFrom: "Individual Control",
      };

      await PagesIndex.apiPostHandler(
        `${PagesIndex.Api.GET_ADD_EDIT_DEVICES}/command-history`,
        payload,
      );
    } catch (error) {
      console.error("Failed to save command history:", error);
    }
  };
  const getCommandHistory = async (devEui) => {
    try {
      const res = await PagesIndex.apiGetHandler(
        `${PagesIndex.Api.GET_ADD_EDIT_DEVICES}/command-history/${devEui}`,
      );
      if (res?.status === 200) {
        setCommandHistory(res?.data || []);
      } else {
        console.error("Failed to fetch command history:", res?.message);
      }
    } catch (error) {
      console.error("Error fetching command history:", error);
    }
  };
  const handleCommands = async (devEui, buttonKey) => {
    const payload = {
      devEui,
      type: buttonKey,
    };
    const res = await PagesIndex.apiPostHandler(
      `${PagesIndex.Api.GET_ADD_EDIT_DEVICES}/queue`,
      payload,
    );
    if (res?.status == 200) {
      handleDisabledButtonAction(buttonKey);
      await addCommandHistory(devEui, buttonKey);
    }
  };
  const sendCommandStatusRequest = async (devEui) => {
    try {
      const res = await PagesIndex.apiGetHandler(
        `${PagesIndex.Api.GET_ADD_EDIT_DEVICES}/get-device-status/${devEui}`,
      );
      if (res?.status === 200) {
        console.log("Command status fetched:", res?.data);
        setCommandStatus(
          res?.data?.command_status === 0
            ? true
            : res?.data?.command_status === 1
              ? false
              : "",
        );
        setCommandStatusMessage(res?.data?.command_status_message || "");
      } else {
        PagesIndex.toasterError(res?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const apiData = async (devEui) => {
    try {
      const res = await PagesIndex.apiGetHandler(
        `${PagesIndex.Api.GET_ADD_EDIT_DEVICES}/telemetry/${devEui}`,
      );
      if (res?.status === 200) {
        console.log(res?.data);
        setPathData(res?.data?.device?.gps_coordinates);
        setPositionData({
          hlat: res?.data?.device?.table_row?.homeLatitude,
          hlng: res?.data?.device?.table_row?.homeLongitude,
          rlat: res?.data?.device?.table_row?.reverseStationLatitude,
          rlng: res?.data?.device?.table_row?.reverseStationLongitude,
        });
        setCenterGps({
          lat:
            res?.data?.device?.gps_coordinates?.[
              res?.data?.device?.gps_coordinates?.length - 1
            ]?.lat || res?.data?.device?.site?.latitude,
          lng:
            res?.data?.device?.gps_coordinates?.[
              res?.data?.device?.gps_coordinates?.length - 1
            ]?.lng || res?.data?.device?.site?.longitude,
        });
        setDeviceDetails(res?.data?.device);
        const data = res?.data?.telemetryData?.object;
        const formattedData = formatData(data, res?.data?.device?.lastSeen);
        setDeviceData(formattedData);
        setRoboData(res?.data?.device);
        setImuData({
          gyroX: formattedData?.imu?.gyro_x,
          gyroY: formattedData?.imu?.gyro_y,
          gyroZ: formattedData?.imu?.gyro_z,
          accX: formattedData?.imu?.accel_x,
          accY: formattedData?.imu?.accel_y,
          accZ: formattedData?.imu?.accel_z,
        });
        setCubeRotation({
          x: formattedData?.imu.gyro_x
            ? (formattedData?.imu.gyro_x / 16.4).toFixed(2)
            : 0,
          y: formattedData?.imu.gyro_y
            ? (formattedData?.imu.gyro_y / 16.4).toFixed(2)
            : 0,
          z: formattedData?.imu.gyro_z
            ? (formattedData?.imu.gyro_z / 16.4).toFixed(2)
            : 0,
        });
        await getCommandHistory(devEui);
      } else {
        PagesIndex.toasterError(res?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // const joiningDataApi = async (devEui) => {
  //   try {
  //     const res = await PagesIndex.apiGetHandler(
  //       `${PagesIndex.Api.GET_ADD_EDIT_DEVICES}/joining-requests/${devEui}`,
  //     );
  //     if (res?.status === 200) {
  //       console.log(res?.data);
  //       setJoinigData(res?.data);
  //     } else {
  //       PagesIndex.toasterError(res?.message);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const getAlarmList = useCallback(
    async (page, filters = {}, isExport = false) => {
      try {
        let url = `${PagesIndex.Api.GET_ADD_EDIT_DEVICES}/alarms/${devEui}?`;
        // For export, fetch all data by removing pagination.
        // This assumes the backend returns all items if page/pageSize are omitted.
        if (!isExport) {
          url += `page=${page}&pageSize=10`;
        }

        if (filters.startDate) url += `&startDate=${filters.startDate}`;
        if (filters.endDate) url += `&endDate=${filters.endDate}`;
        if (filters.alarmCode) url += `&alarmCode=${filters.alarmCode}`;
        if (filters.alarmName) url += `&alarmName=${filters.alarmName}`;

        const res = await PagesIndex.apiGetHandler(url);

        if (res.status === 200) {
          if (isExport) {
            // If exporting, return the data directly
            return res?.data?.alarms || [];
          } else {
            // Otherwise, update the state for the table
            setAlarmListData(res?.data?.alarms);
            setAlarmListTotalCount(res?.data?.pagination?.totalCount);
            setAlarmCurrentPage(res?.data?.pagination?.page);
          }
        } else {
          if (isExport) {
            PagesIndex.toasterError("Failed to fetch data for export.");
          }
          return [];
        }
      } catch (error) {
        console.log(error);
        if (isExport) {
          PagesIndex.toasterError("An error occurred during export.");
        }
        return [];
      }
    },
    [devEui],
  );

  const getHistoricalList = useCallback(
    async (page, filters = {}) => {
      try {
        let url = `${PagesIndex.Api.GET_ADD_EDIT_DEVICES}/telemetry/${devEui}/historical?page=${page}?pageSize=10`;
        if (filters.startDate) url += `&startDate=${filters.startDate}`;
        if (filters.endDate) url += `&endDate=${filters.endDate}`;

        const res = await PagesIndex.apiGetHandler(url);

        if (res?.status == 200) {
          const formattedData = res.data?.telemetryData.map((item) =>
            formatData(item?.object, item?.time),
          );
          setHistoricalData(formattedData);
          setTotalHistoricalCount(res?.data?.pagination?.totalCount);
          setHistoricalCurrentPage(res?.data?.pagination?.page);
        } else {
          PagesIndex.toasterError(res?.message);
        }
      } catch (error) {
        console.log(error);
      }
    },
    [devEui],
  );

  const getExportHistoricalData = useCallback(
    async (filters = {}, isExport = false) => {
      try {
        let url = `${PagesIndex.Api.GET_ADD_EDIT_DEVICES}/export/history/${devEui}?`;

        if (filters.startDate) url += `&startDate=${filters.startDate}`;
        if (filters.endDate) url += `&endDate=${filters.endDate}`;

        const res = await PagesIndex.apiGetHandler(url);

        if (res?.status == 200) {
          const formattedData = res.data?.map((item) =>
            formatData(item?.object, item?.time),
          );
          if (isExport) {
            return formattedData;
          }
        } else {
          PagesIndex.toasterError(res?.message);
          if (isExport) return [];
        }
      } catch (error) {
        console.log(error);
        if (isExport) return [];
      }
    },
    [devEui],
  );
  const getExportAlarmData = useCallback(
    async (filters = {}, isExport = false) => {
      try {
        let url = `${PagesIndex.Api.GET_ADD_EDIT_DEVICES}/export/alarms/${devEui}?`;

        if (filters.startDate) url += `&startDate=${filters.startDate}`;
        if (filters.endDate) url += `&endDate=${filters.endDate}`;
        if (filters.alarmCode) url += `&alarmCode=${filters.alarmCode}`;
        if (filters.alarmName) url += `&alarmName=${filters.alarmName}`;
        const res = await PagesIndex.apiGetHandler(url);

        if (res?.status == 200) {
          if (isExport) {
            return res.data;
          }
        } else {
          PagesIndex.toasterError(res?.message);
          if (isExport) return [];
        }
      } catch (error) {
        console.log(error);
        if (isExport) return [];
      }
    },
    [devEui],
  );

  // --- Handlers and UseEffects for Exporting Data ---
  const handleExportAlarms = async () => {
    setIsExportingAlarms(true);
    const allAlarms = await getExportAlarmData(alarmFilters, true);
    if (allAlarms && allAlarms.length > 0) {
      const preparedData = allAlarms.map((data, i) => ({
        No: i + 1,
        "Alarm Code": data?.object?.error_code,
        "Alarm Name": data?.object?.error_name,
        Description: data?.object?.failure_data || "-",
        "Trigger Date": moment(data?.time).format("DD-MM-YYYY HH:mm:ss"),
        "Close Date": moment(data?.time).format("DD-MM-YYYY HH:mm:ss"),
      }));
      setAlarmExportData(preparedData);
    } else {
      PagesIndex.toasterInfo("No data available to export.");
    }
    setIsExportingAlarms(false);
  };

  const handleExportHistorical = async () => {
    setIsExportingHistorical(true);
    const allHistorical = await getExportHistoricalData(
      historicalFilters,
      true,
    );
    if (allHistorical && allHistorical.length > 0) {
      const preparedData = allHistorical.map((data, i) => ({
        "Sr. No.": i + 1,
        Time: moment(data?.time).format("DD/MM/YYYY HH:mm:ss"),
        "Brush Motor Temp (°C)": data.brush_motor?.temperature,
        "Brush Motor Current (A)": data.brush_motor?.current,
        // "Brush Motor Voltage (V)": data.brush_motor?.voltage,
        "Brush Motor Speed": data.brush_motor?.speed,
        "Left Motor Temp (°C)": data.left_motor?.temperature,
        "Left Motor Current (A)": data.left_motor?.current,
        // "Left Motor Voltage (V)": data.left_motor?.voltage,
        "Left Motor Speed": data.left_motor?.speed,
        "Right Motor Temp (°C)": data.right_motor?.temperature,
        "Right Motor Current (A)": data.right_motor?.current,
        // "Right Motor Voltage (V)": data.right_motor?.voltage,
        "Right Motor Speed": data.right_motor?.speed,
        "Main Battery Temp (°C)": data.main_battery?.temp,
        "Main Battery Current (A)": data.main_battery?.current,
        "Main Battery Voltage (V)": data.main_battery?.voltage,
        "Main Battery Level (%)": data.main_battery?.level,
        "Main Battery Charging Switch": data.main_battery?.charging_switch,
        "Main Battery Discharge Switch": data.main_battery?.discharging_switch,
        "Main Battery Load Status": data.main_battery?.load_status,
        Latitude: data.gps?.latitude,
        Longitude: data.gps?.longitude,
        "IMU Gyro X": data.imu?.gyro_x.toFixed(2),
        "IMU Gyro Y": data.imu?.gyro_y.toFixed(2),
        "IMU Gyro Z": data.imu?.gyro_z.toFixed(2),
      }));
      setHistoricalExportData(preparedData);
    } else {
      PagesIndex.toasterInfo("No data available to export.");
    }
    setIsExportingHistorical(false);
  };

  useEffect(() => {
    if (
      alarmExportData.length > 0 &&
      alarmCsvLinkRef.current &&
      alarmCsvLinkRef.current.link
    ) {
      alarmCsvLinkRef.current.link.click();
      setAlarmExportData([]); // Reset after triggering download
    }
  }, [alarmExportData]);

  useEffect(() => {
    if (
      historicalExportData.length > 0 &&
      historicalCsvLinkRef.current &&
      historicalCsvLinkRef.current.link
    ) {
      historicalCsvLinkRef.current.link.click();
      setHistoricalExportData([]); // Reset after triggering download
    }
  }, [historicalExportData]);

  useEffect(() => {
    setDisabledButtons(false);
    if (typeof commandStatus === "boolean" && commandStatus) {
      // PagesIndex.toasterSuccess("Command executed succesfully");
      setCommandStatus(undefined);
    } else if (typeof commandStatus === "boolean" && !commandStatus) {
      // PagesIndex.toasterError(
      //   `Command execution failed due to ${commandStatusMessage} `,
      // );
      setCommandStatus(undefined);
    }
  }, [commandStatus]);

  useEffect(() => {
    if (!devEui) return;
    // Call once immediately
    sendCommandStatusRequest(devEui);
    // Call every 5 minutes
    const interval = setInterval(
      () => {
        sendCommandStatusRequest(devEui);
      },
      5 * 60 * 1000,
    ); // 5 minutes
    return () => clearInterval(interval);
  }, [devEui]);

  useEffect(() => {
    if (!devEui || !appId) return;

    const brokerUrl = import.meta.env.VITE_MQTT_URL;

    const options = {
      username: import.meta.env.VITE_MQTT_USERNAME,
      password: import.meta.env.VITE_MQTT_PASSWORD,
      clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
      clean: false,

      // ⭐ IMPORTANT — control reconnect behaviour
      reconnectPeriod: 5000, // retry every 5 sec (default is 1 sec)
      connectTimeout: 30000,
    };

    const mqttClient = mqtt.connect(brokerUrl, options);

    let reconnectCooldown = false; // 🚀 throttle flag

    mqttClient.on("connect", () => {
      console.log("Connected to ChirpStack MQTT broker");
      reconnectCooldown = false; // reset cooldown
      mqttClient.subscribe(
        `application/${appId}/device/${devEui}/event/up`,
        (err) => {
          if (err) {
            console.error("Subscription error:", err);
          }
        },
      );
    });

    mqttClient.on("error", (err) => {
      console.error("MQTT error:", err);
    });

    mqttClient.on("message", (topic, payload) => {
      const message = JSON.parse(payload.toString());
      getCommandHistory(devEui);
      console.log("Received MQTT message:", message);
      const commandFailed = [
        "CHECKSUM_MISMATCH",
        "OTA_SAME_OFFSET_ERROR",
        "OTA_OFFSET_MISMATCH",
        "FLASH_OPERATION_FAIL",
        "OTA_CRC_CMD_NOT_REC",
        "CMD_CRC_FAILED",
        "CMD_FRAME_LENGTH_MISMATCH",
        "CMD_INVALID_DEV_STATE",
        "CMD_PARAM_OUT_OF_RANGE",
        "CMD_FAILED",
        "MOTOR_ALREADY_STARTED",
        "MOTOR_ALREADY_STOPPED",
        "PERIPHERAL_CHECK_FAILED",
        "DIGNOSTICS_CHECK_FAILED",
        "INVALID_COMMAND",
      ];

      const commandName = message?.object?.received_command.replaceAll(
        "_",
        " ",
      );
      const receivedStatus = message?.object?.received_command;
      const commandResponse = message?.object?.command_response;
      const commandStatus = message?.object?.command_status;

      const isSuccess =
        commandStatus === 0 || commandResponse === "CMD_SUCCESS";
      const isFailed =
        commandStatus === 1 || commandFailed.includes(commandResponse);

      setCommandStatus(isSuccess ? true : isFailed ? false : "");
      setCommandStatusMessage(isFailed ? commandResponse : "");

      if (commandName) {
        if (isSuccess) {
          toasterSuccess(`Command: ${commandName} executed successfully`);
          apiData(devEui);
        } else if (isFailed) {
          toasterError(`Command: ${commandName} failed - ${commandResponse}`);
          apiData(devEui);
        }
      }
      
      if (receivedStatus === "DEVICE_STATUS") {
        getHistoricalList(1, { startDate: "", endDate: "" });

        const formattedData = formatData(message?.object, message?.time);
        setDeviceData(formattedData);
        apiData(devEui);

        setCubeRotation({
          x: Number(message?.object?.imu?.gyro_x / 16.4).toFixed(2) ?? 0,
          y: Number(message?.object?.imu?.gyro_y / 16.4).toFixed(2) ?? 0,
          z: Number(message?.object?.imu?.gyro_z / 16.4).toFixed(2) ?? 0,
        });
      } else {
        getAlarmList(1, alarmFilters);
      }
    });

    // 🚀 SAFE RECONNECT HANDLER
    mqttClient.on("reconnect", () => {
      console.log("Reconnecting MQTT...");

      // Prevent API spam
      if (reconnectCooldown) return;

      reconnectCooldown = true;

      setTimeout(() => {
        console.log("Running reconnect recovery APIs");

        getAlarmList(1, alarmFilters);
        getHistoricalList(1, { startDate: "", endDate: "" });

        reconnectCooldown = false;
      }, 10000); // ⭐ Wait 10 sec after reconnect
    });

    mqttClient.on("offline", () => {
      console.log("MQTT offline");
    });

    mqttClient.on("close", () => {
      console.log("MQTT connection closed");
    });

    setClient(mqttClient);

    return () => {
      mqttClient.end(true);
      console.log("MQTT disconnected");
    };
  }, [devEui, appId]);

  useEffect(() => {
    getHistoricalList(1, { startDate: "", endDate: "" });
    getAlarmList(1);
    apiData(devEui);
  }, [getHistoricalList, getAlarmList]);

  const containerRef = useRef(null);
  const cubeRef = useRef(null);
  const madgwickRef = useRef(
    new MadgwickAHRS({ sampleInterval: 20, beta: 0.1 }),
  );

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.offsetWidth / containerRef.current.offsetHeight,
      0.1,
      1000,
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.offsetWidth,
      containerRef.current.offsetHeight,
    );
    containerRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(5, 1, 4);
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0x03045e }),
      new THREE.MeshBasicMaterial({ color: 0x023e8a }),
      new THREE.MeshBasicMaterial({ color: 0x0077b6 }),
      new THREE.MeshBasicMaterial({ color: 0x03045e }),
      new THREE.MeshBasicMaterial({ color: 0x023e8a }),
      new THREE.MeshBasicMaterial({ color: 0x0077b6 }),
    ];
    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);
    cubeRef.current = cube;

    const animate = () => {
      requestAnimationFrame(animate);

      const { q0, q1, q2, q3 } = madgwickRef.current;
      cube.quaternion.set(q1, q2, q3, q0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      materials.forEach((mat) => mat.dispose());
    };
  }, []);

  useEffect(() => {
    if (
      imuData &&
      "accX" in imuData &&
      "accY" in imuData &&
      "accZ" in imuData &&
      "gyroX" in imuData &&
      "gyroY" in imuData &&
      "gyroZ" in imuData
    ) {
      // LSM6DSOX scaling
      const gyroX = imuData.gyroX / 114.29; // assuming ±250°/s
      const gyroY = imuData.gyroY / 114.29;
      const gyroZ = imuData.gyroZ / 114.29;

      const accX = imuData.accX / 16384; // assuming ±2g
      const accY = imuData.accY / 16384;
      const accZ = imuData.accZ / 16384;

      madgwickRef.current.updateIMU(gyroX, gyroY, gyroZ, accX, accY, accZ);
    }
  }, [imuData]);

  const isRobotActive = (lastSeenAt) => {
    const lastSeenDate = new Date(lastSeenAt);
    const currentDate = new Date();
    const diffMs = currentDate - lastSeenDate;
    const thresholdMs = (720 * 60 + 100) * 1000;

    return diffMs <= thresholdMs ? (
      <img src={PagesIndex.Svg.online} alt="Online" />
    ) : (
      <img src={PagesIndex.Svg.offline} alt="Offline" />
    );
  };

  const center = {
    lat: parseFloat(centerGps?.lat),
    lng: parseFloat(centerGps?.lng),
  };

  function calculatePercentage(currentValue, fixedValue) {
    if (fixedValue === 0) {
      return "Error: Fixed value cannot be zero.";
    }
    const percentage = (currentValue / fixedValue) * 100;
    return percentage > 100 ? 100 : percentage;
  }

  const formattedDistance = (() => {
    if (pathData?.length < 2) return "0 m";
    const first = pathData?.[0];
    const last = pathData?.[pathData?.length - 1];
    const d = haversineDistance(first?.lat, first?.lng, last?.lat, last?.lng);
    return `${(d / 1).toFixed(2)} m`;
  })();
  function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371000; // Earth radius in meters
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Line proximity filtering
  function isPointNearLineSegment(start, end, point, maxDistanceMeters) {
    const toRad = (val) => (val * Math.PI) / 180;

    const lat1 = toRad(start.lat);
    const lon1 = toRad(start.lng);
    const lat2 = toRad(end.lat);
    const lon2 = toRad(end.lng);
    const lat3 = toRad(point.lat);
    const lon3 = toRad(point.lng);

    const R = 6371000;

    const x1 = R * Math.cos(lat1) * Math.cos(lon1);
    const y1 = R * Math.cos(lat1) * Math.sin(lon1);
    const z1 = R * Math.sin(lat1);

    const x2 = R * Math.cos(lat2) * Math.cos(lon2);
    const y2 = R * Math.cos(lat2) * Math.sin(lon2);
    const z2 = R * Math.sin(lat2);

    const x3 = R * Math.cos(lat3) * Math.cos(lon3);
    const y3 = R * Math.cos(lat3) * Math.sin(lon3);
    const z3 = R * Math.sin(lat3);

    const A = [x2 - x1, y2 - y1, z2 - z1];
    const B = [x3 - x1, y3 - y1, z3 - z1];

    const dot = A[0] * B[0] + A[1] * B[1] + A[2] * B[2];
    const lenA = Math.sqrt(A[0] ** 2 + A[1] ** 2 + A[2] ** 2);
    const projLen = dot / lenA;

    const proj = [
      (A[0] * projLen) / lenA + x1,
      (A[1] * projLen) / lenA + y1,
      (A[2] * projLen) / lenA + z1,
    ];
    const dist = Math.sqrt(
      (x3 - proj[0]) ** 2 + (y3 - proj[1]) ** 2 + (z3 - proj[2]) ** 2,
    );

    return dist <= maxDistanceMeters;
  }

  // Final GPS path filter
  const homePosition = {
    lat: positionData?.hlat,
    lng: positionData?.hlng,
  };
  const reversePosition = {
    lat: positionData?.rlat,
    lng: positionData?.rlng,
  };
  function filterPathWithinRange(path, toleranceMeters = 2) {
    return path?.filter((point) => {
      const distToHome = haversineDistance(
        point.lat,
        point.lng,
        positionData.hlat,
        positionData.hlng,
      );
      const distToReverse = haversineDistance(
        point.lat,
        point.lng,
        positionData.rlat,
        positionData.rlng,
      );
      return (
        distToHome <= toleranceMeters ||
        distToReverse <= toleranceMeters ||
        isPointNearLineSegment(
          homePosition,
          reversePosition,
          point,
          toleranceMeters,
        )
      );
    });
  }
  const filteredPath = filterPathWithinRange(pathData);
  const tabs = ["Display parameters", "Control instruction", "Configuration"];

  return (
    <>
      <Index.Box className="admin-dashboard-content">
        <Index.Box className="admin-user-list-flex admin-page-title-main">
          <Index.Typography
            className="admin-page-title"
            component="h2"
            variant="h2"
          >
            Robot Configuration
          </Index.Typography>
          <Index.Typography
            className="admin-page-title"
            component="h2"
            variant="h2"
          >
            Last Refresh:{" "}
            {deviceData?.time
              ? moment(deviceData?.time).format("YYYY-MM-DD hh:mm:ss")
              : "Loading..."}
          </Index.Typography>
        </Index.Box>
        <Index.Box className="common-card" sx={{ marginBottom: "20px" }}>
          {/* <DetailsField label={"Name"} text={deviceDetails?.name}>
            {isRobotActive(deviceData?.time)}
            </DetailsField> */}
          <Index.Grid container>
            <Index.Grid item xs={12} md={6}>
              <DetailsField label={"Name"} text={deviceDetails?.name}>
                {isRobotActive(deviceData?.time)}
              </DetailsField>
            </Index.Grid>
            <Index.Grid item xs={12} md={6}>
              <DetailsField
                label={"Last Joining Time"}
                text={
                  moment(joiningData?.[0]?.time).format(
                    "YYYY-MM-DD HH:mm:ss A",
                  ) || "-"
                }
              />
            </Index.Grid>
            <Index.Grid item xs={12} md={6}>
              <DetailsField label={"Robot ID"} text={deviceDetails?.devEui} />
            </Index.Grid>
            <Index.Grid item xs={12} md={6}>
              <DetailsField
                label={"Site Name"}
                text={deviceDetails?.site?.name}
              />
            </Index.Grid>
            <Index.Grid item xs={12} md={6}>
              <DetailsField
                label={"Multicast Address"}
                text={deviceDetails?.mcAddr || "-"}
              />
            </Index.Grid>
            <Index.Grid item xs={12} md={6}>
              <DetailsField
                label={"Firmware Version"}
                text={deviceDetails?.firmwareVersion || "-"}
              />
            </Index.Grid>
            <Index.Grid item xs={12} md={6}>
              <DetailsField
                label={"State"}
                text={deviceDetails?.state || "-"}
              />
            </Index.Grid>
            <Index.Grid item xs={12} md={6}>
              <DetailsField
                label={"Running Command"}
                text={deviceDetails?.runningCommand || "-"}
              />
            </Index.Grid>
          </Index.Grid>
        </Index.Box>
        {/* 🔹 Timeline History Section */}
        <Index.Box className="common-card" sx={{ mb: 3 }}>
          <Index.Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            Command Line History
          </Index.Typography>

          <Index.Box
            sx={{
              width: "100%",
              overflowX: "auto", // Enables horizontal scroll
              pb: 2, // Space for the scrollbar
              // Custom scrollbar styling (optional but looks better)
              "&::-webkit-scrollbar": { height: "6px" },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#ccc",
                borderRadius: "10px",
              },
            }}
          >
            <Index.Box
              sx={{
                display: "inline-flex", // Ensures container expands to fit children
                alignItems: "flex-start",
                gap: 0, // We will use padding on children for more precise arrow calculation
                position: "relative",
                zIndex: 1,
                mt: 2,
                minWidth: "max-content", // Forces the box to be as wide as the content
              }}
            >
              {commandHistory?.map((item, index) => {
                const isLast = index === commandHistory.length - 1;

                return (
                  <Index.Box
                    key={index}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: 200, // Fixed width so arrows stay consistent
                      textAlign: "center",
                      position: "relative",
                    }}
                  >
                    {/* CONNECTOR LINE & ARROW */}
                    {!isLast && (
                      <Index.Box
                        sx={{
                          position: "absolute",
                          top: 6, // Half of dot height
                          left: "47%", // Starts at middle of current dot
                          width: "100%", // Stretches to middle of next dot
                          height: "2px",
                          backgroundColor: "#1976d2",
                          zIndex: 0,
                          "&::after": {
                            content: '""',
                            position: "absolute",
                            right: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 0,
                            height: 0,
                            borderTop: "5px solid transparent",
                            borderBottom: "5px solid transparent",
                            borderLeft: "8px solid #1976d2",
                          },
                        }}
                      />
                    )}

                    {/* DOT */}
                    <Index.Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        backgroundColor: isLast ? "#2e7d32" : "#1976d2",
                        border: "3px solid white",
                        zIndex: 2,
                        boxShadow: isLast
                          ? "0 0 0 6px rgba(46,125,50,0.15)"
                          : "none",
                        animation: isLast ? "pulse 1.5s infinite" : "none",
                      }}
                    />

                    {/* CONTENT */}
                    <Index.Box sx={{ mt: 3, px: 1 }}>
                      <Index.Typography
                        variant="caption"
                        sx={{
                          color: "gray",
                          display: "block",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {moment(item?.executedAt).format(
                          "DD-MM-YYYY hh:mm:ss A",
                        )}
                      </Index.Typography>

                      <Index.Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ whiteSpace: "normal", wordBreak: "break-word" }}
                      >
                        {item?.commandName.replaceAll("_", " ")}
                      </Index.Typography>

                      <Index.Typography variant="caption" display="block">
                        {item?.User?.name}
                      </Index.Typography>

                      <Index.Typography
                        variant="caption"
                        sx={{
                          color:
                            item?.status === "COMPLETED"
                              ? "green"
                              : item?.status === "FAILED"
                                ? "red"
                                : "orange",
                          fontWeight: 600,
                        }}
                        display="block"
                      >
                        {item?.status}
                      </Index.Typography>

                      <Index.Typography
                        variant="caption"
                        display="block"
                        sx={{ color: "gray" }}
                      >
                        {item?.completedAt
                          ? moment(item?.completedAt).format(
                              "DD-MM-YYYY hh:mm:ss A",
                            )
                          : "-"}
                      </Index.Typography>
                    </Index.Box>
                  </Index.Box>
                );
              })}
            </Index.Box>
          </Index.Box>
        </Index.Box>

        <TabLayout tabs={tabs}>
          {/* ---- Display Parameters ---- */}
          <Index.Box>
            <Index.Box className="robot-progress-bar-content">
              <Index.Typography className="action-title">
                Distance Travelled
              </Index.Typography>

              <span className="admin-progress-bar-text">
                {/* Use deviceData?.distancePercentage for the percentage text */}
                {deviceDetails?.distanceTravelled > 0
                  ? calculatePercentage(
                      deviceDetails?.distanceTravelled,
                      deviceDetails?.table_row?.distance * 2,
                    ).toFixed(2)
                  : 0}
                %
              </span>
            </Index.Box>
            <RobotDistanceTravelled
              // The progress bar component likely takes a percentage or current value
              // Assuming it needs the percentage:
              totalDistance={
                calculatePercentage(
                  deviceDetails?.distanceTravelled,
                  deviceDetails?.table_row?.distance * 2,
                ).toFixed(2) || 0
              } // Pass the percentage
              // If it expects the raw meters for the 1070m segment:
              // totalDistance={deviceData?.distanceTravelled || 0}
            />
            <Index.Box
              sx={{ display: "flex", flexWrap: "wrap" }}
              className="details-flex-fields-container"
            >
              <DetailsField
                label={"Cycle Progress"} // New field for the 1070m segment progress
                text={`${(deviceDetails?.distanceTravelled || 0).toFixed(
                  2,
                )} meters`}
              />
              <DetailsField
                label={"Cycle Direction"} // Clarify label
                text={deviceData?.robot?.direction || "-"} // Display accumulated distance in meters
              />
              <DetailsField
                label={"Cycle (speed)"}
                text={deviceData?.robot?.speed || 0}
              />
            </Index.Box>
            <Index.Typography
              sx={{ marginTop: "10px", marginBottom: "10px" }}
              className="action-title"
            >
              Main Battery
            </Index.Typography>
            <Index.Grid container>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Level"}
                  text={`${deviceData?.main_battery?.level || 0}%`}
                />
              </Index.Grid>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Temperature"}
                  text={`${deviceData?.main_battery?.temp || 0} °C`}
                />
              </Index.Grid>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Current"}
                  text={`${deviceData?.main_battery?.current || 0} A`}
                />
              </Index.Grid>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Voltage"}
                  text={`${deviceData?.main_battery?.voltage || 0} V`}
                />
              </Index.Grid>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Source"}
                  text={deviceData?.status_byte?.current_power_source || "-"}
                />
              </Index.Grid>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Status"}
                  text={deviceData?.main_battery?.load_status || "-"}
                />
              </Index.Grid>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Charging Switch"}
                  text={`${deviceData?.main_battery?.charging_switch || "-"}`}
                />
              </Index.Grid>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Discharge Switch"}
                  text={`${
                    deviceData?.main_battery?.discharging_switch || "-"
                  }`}
                />
              </Index.Grid>
            </Index.Grid>

            <Index.Typography
              sx={{ marginTop: "10px", marginBottom: "10px" }}
              className="action-title"
            >
              Brush Motor
            </Index.Typography>
            <Index.Grid container>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Speed"}
                  text={`${deviceData?.brush_motor?.speed || 0} `}
                />
              </Index.Grid>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Temperature"}
                  text={`${deviceData?.brush_motor?.temperature || 0} °C`}
                />
              </Index.Grid>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Current"}
                  text={`${deviceData?.brush_motor?.current || 0} A`}
                />
              </Index.Grid>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Voltage"}
                  text={`${deviceData?.brush_motor?.voltage || 0} V`}
                />
              </Index.Grid>
            </Index.Grid>
            <Index.Typography
              sx={{ marginTop: "10px", marginBottom: "10px" }}
              className="action-title"
            >
              Left Motor
            </Index.Typography>
            <Index.Grid container>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Speed"}
                  text={`${deviceData?.left_motor?.speed || 0} `}
                />
              </Index.Grid>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Temperature"}
                  text={`${deviceData?.left_motor?.temperature || 0} °C`}
                />
              </Index.Grid>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Current"}
                  text={`${deviceData?.left_motor?.current || 0} A`}
                />
              </Index.Grid>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Voltage"}
                  text={`${deviceData?.left_motor?.voltage || 0} V`}
                />
              </Index.Grid>
            </Index.Grid>
            <Index.Typography
              sx={{ marginTop: "10px", marginBottom: "10px" }}
              className="action-title"
            >
              Right Motor
            </Index.Typography>
            <Index.Grid container>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Speed"}
                  text={`${deviceData?.right_motor?.speed || 0} `}
                />
              </Index.Grid>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Temperature"}
                  text={`${deviceData?.right_motor?.temperature || 0} °C`}
                />
              </Index.Grid>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Current"}
                  text={`${deviceData?.right_motor?.current || 0} A`}
                />
              </Index.Grid>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Voltage"}
                  text={`${deviceData?.right_motor?.voltage || 0} V`}
                />
              </Index.Grid>
            </Index.Grid>
            <Index.Typography
              sx={{ marginTop: "10px", marginBottom: "10px" }}
              className="action-title"
            >
              External Sensor And Switch Status
            </Index.Typography>
            <Index.Grid container>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Switch Left"}
                  text={deviceData?.status_byte?.left_switch_status || "-"}
                />
              </Index.Grid>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Switch Right"}
                  text={deviceData?.status_byte?.right_switch_status || "-"}
                />
              </Index.Grid>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Proximity Left"}
                  text={deviceData?.status_byte?.left_proximity_status || "-"}
                />
              </Index.Grid>
              <Index.Grid item lg={3} xs={12} sm={6}>
                <DetailsField
                  label={"Proximity Right"}
                  text={deviceData?.status_byte?.right_proximity_status || "-"}
                />
              </Index.Grid>
            </Index.Grid>
          </Index.Box>
          {/* ---- Control Instruction ---- */}
          <Index.Box>
            <Index.Grid container rowGap={"20px"} alignItems={"center"}>
              {/* ---- MAIN COMMAND SECTION ---- */}
              <Index.Grid item xs={12} sm={2}>
                <Index.Typography className="action-title">
                  Main Command
                </Index.Typography>
              </Index.Grid>
              <Index.Grid item xs={12} sm={10}>
                <Index.Grid className="robot-control-actions-grid" container>
                  {permissions.includes("robotcommand_clean") && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() =>
                          handleCommands(devEui, "CLEAN_ONE_CYCLE")
                        }
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.powerButton}
                        imgAlt={"Clean"}
                        label={"Clean"}
                        bgColor={"rgba(55,126,34,0.1)"}
                        textColor={"rgba(55,126,34,1)"}
                        borderColor={"rgba(55,126,34,0.3)"}
                      />
                    </Index.Grid>
                  )}
                  {permissions.includes("robotcommand_standby") && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => handleCommands(devEui, "STOP_ROBOT")}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.stopIcon}
                        imgAlt={"Standby"}
                        label={"Standby"}
                        bgColor={"rgba(255,0,0,0.1)"}
                        textColor={"red"}
                        borderColor={"rgba(255,0,0,0.3)"}
                      />
                    </Index.Grid>
                  )}
                  {permissions.includes("robotcommand_left") && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => handleCommands(devEui, "LEFT_START")}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.leftArrowIcon}
                        imgAlt={"Run Left"}
                        label={"Run Left"}
                        bgColor={"rgba(0,0,255,0.1)"}
                        textColor={"blue"}
                        borderColor={"rgba(0,0,255,0.3)"}
                      />
                    </Index.Grid>
                  )}
                  {permissions.includes("robotcommand_right") && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => handleCommands(devEui, "RIGHT_START")}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.rightArrowIcon}
                        imgAlt={"Run Right"}
                        label={"Run Right"}
                        bgColor={"rgba(0,0,255,0.1)"}
                        textColor={"blue"}
                        borderColor={"rgba(0,0,255,0.3)"}
                      />
                    </Index.Grid>
                  )}
                  {permissions.includes("robotcommand_home") && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => handleCommands(devEui, "HOME")}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.homeIcon}
                        imgAlt={"Home"}
                        label={"Home"}
                        bgColor={"rgba(0,0,255,0.1)"}
                        textColor={"blue"}
                        borderColor={"rgba(0,0,255,0.3)"}
                      />
                    </Index.Grid>
                  )}
                </Index.Grid>
              </Index.Grid>
              <Index.Grid item xs={12} sm={2}>
                <Index.Typography className="action-title">
                  Maintenance Command
                </Index.Typography>
              </Index.Grid>
              <Index.Grid item xs={12} sm={10}>
                <Index.Grid className="robot-control-actions-grid" container>
                  {permissions.includes(
                    "robottreelevelcommand_entermaintenancestate",
                  ) && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() =>
                          handleCommands(devEui, "ENTER_MAINTENANCE_STATE")
                        }
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.tool}
                        imgAlt={"Enter maintenance state"}
                        label={"Enter maintenance state"}
                        bgColor={"rgba(0,0,255,0.1)"}
                        textColor={"blue"}
                        borderColor={"rgba(0,0,255,0.3)"}
                      />
                    </Index.Grid>
                  )}
                  {permissions.includes(
                    "robottreelevelcommand_exitmaintenancestate",
                  ) && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => {
                          handleCommands(devEui, "EXIT_MAINTENANCE_STATE");
                        }}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.toolOff}
                        imgAlt={"Exit maintenance state"}
                        label={"Exit maintenance state"}
                        bgColor={"rgba(255,0,0,0.1)"}
                        textColor={"red"}
                        borderColor={"rgba(255,0,0,0.3)"}
                      />
                    </Index.Grid>
                  )}
                  {permissions.includes("robottreelevelcommand_softreset") && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => {
                          handleCommands(devEui, "SOFT_RESET");
                        }}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.rotate}
                        imgAlt={"Soft reset"}
                        label={"Soft reset"}
                        bgColor={"rgba(255,0,0,0.1)"}
                        textColor={"red"}
                        borderColor={"rgba(255,0,0,0.3)"}
                      />
                    </Index.Grid>
                  )}
                  {permissions.includes("robottreelevelcommand_hardreset") && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => {
                          handleCommands(devEui, "HARD_RESET");
                        }}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.rotate}
                        imgAlt={"Hard reset"}
                        label={"Hard reset"}
                        bgColor={"rgba(255,0,0,0.1)"}
                        textColor={"red"}
                        borderColor={"rgba(255,0,0,0.3)"}
                      />
                    </Index.Grid>
                  )}
                </Index.Grid>
              </Index.Grid>
              <Index.Grid item xs={12} sm={2}>
                <Index.Typography className="action-title">
                  Peripherals Check Command
                </Index.Typography>
              </Index.Grid>
              <Index.Grid item xs={12} sm={10}>
                <Index.Grid className="robot-control-actions-grid" container>
                  {permissions.includes(
                    "robottreelevelcommand_fetchbattery",
                  ) && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => {
                          handleCommands(devEui, "CHECK_BATTERY_STATUS");
                        }}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.battery}
                        imgAlt={"Fetch battery status"}
                        label={"Fetch battery status"}
                        bgColor={"rgba(0,0,255,0.1)"}
                        textColor={"blue"}
                        borderColor={"rgba(0,0,255,0.3)"}
                      />
                    </Index.Grid>
                  )}
                  {permissions.includes(
                    "robottreelevelcommand_rundiagnostic",
                  ) && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => {
                          handleCommands(robot.devEui, "RUN_DIAGNOSTICS");
                        }}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.scan}
                        imgAlt={"Run diagnostic"}
                        label={"Run diagnostic"}
                        bgColor={"rgba(0,0,255,0.1)"}
                        textColor={"blue"}
                        borderColor={"rgba(0,0,255,0.3)"}
                      />
                    </Index.Grid>
                  )}
                  {permissions.includes("robottreelevelcommand_brushmotor") && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => {
                          handleCommands(devEui, "BRUSH_MOTOR_CHECK");
                        }}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.motor}
                        imgAlt={"Brush Motor Check"}
                        label={"Brush Motor Check"}
                        bgColor={"rgba(0,0,255,0.1)"}
                        textColor={"blue"}
                        borderColor={"rgba(0,0,255,0.3)"}
                      />
                    </Index.Grid>
                  )}
                  {permissions.includes("robottreelevelcommand_leftmotor") && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => {
                          handleCommands(devEui, "LEFT_MOTOR_CHECK");
                        }}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.motor}
                        imgAlt={"Left Motor Check"}
                        label={"Left Motor Check"}
                        bgColor={"rgba(0,0,255,0.1)"}
                        textColor={"blue"}
                        borderColor={"rgba(0,0,255,0.3)"}
                      />
                    </Index.Grid>
                  )}
                  {permissions.includes("robottreelevelcommand_rightmotor") && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => {
                          handleCommands(devEui, "RIGHT_MOTOR_CHECK");
                        }}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.motor}
                        imgAlt={"Right Motor Check"}
                        label={"Right Motor Check"}
                        bgColor={"rgba(0,0,255,0.1)"}
                        textColor={"blue"}
                        borderColor={"rgba(0,0,255,0.3)"}
                      />
                    </Index.Grid>
                  )}
                  {permissions.includes("robottreelevelcommand_imu") && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => {
                          handleCommands(devEui, "IMU_CHECK");
                        }}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.imu}
                        imgAlt={"IMU Check"}
                        label={"IMU Check"}
                        bgColor={"rgba(0,0,255,0.1)"}
                        textColor={"blue"}
                        borderColor={"rgba(0,0,255,0.3)"}
                      />
                    </Index.Grid>
                  )}
                  {permissions.includes("robottreelevelcommand_gps") && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => {
                          handleCommands(devEui, "GPS_CHECK");
                        }}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.gps}
                        imgAlt={"GPS Check"}
                        label={"GPS Check"}
                        bgColor={"rgba(0,0,255,0.1)"}
                        textColor={"blue"}
                        borderColor={"rgba(0,0,255,0.3)"}
                      />
                    </Index.Grid>
                  )}
                  {permissions.includes("robottreelevelcommand_battery") && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => {
                          handleCommands(devEui, "BATTERY_CHECK");
                        }}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.battery}
                        imgAlt={"Battery Check"}
                        label={"Battery Check"}
                        bgColor={"rgba(0,0,255,0.1)"}
                        textColor={"blue"}
                        borderColor={"rgba(0,0,255,0.3)"}
                      />
                    </Index.Grid>
                  )}
                </Index.Grid>
              </Index.Grid>
              {/* ---- MAIN COMMAND SECTION END---- */}
              {/* ---- BRUSH MOTOR SECTION ---- */}
              {/* <Index.Grid item xs={12} sm={2}>
                <Index.Typography className="action-title">
                  Brush Motor
                </Index.Typography>
              </Index.Grid>
              <Index.Grid item xs={12} sm={10}>
                <Index.Grid className="robot-control-actions-grid" container>
                  {permissions.includes("robotcommand_brushreverse") && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => {}}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.anticlockwise}
                        imgAlt={"Reverse"}
                        label={"Reverse"}
                        bgColor={"rgba(0,0,255,0.1)"}
                        textColor={"blue"}
                        borderColor={"rgba(0,0,255,0.3)"}
                      />
                    </Index.Grid>
                  )}
                  {permissions.includes("robotcommand_brushstop") && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => {}}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.stopIcon}
                        imgAlt={"Stop"}
                        label={"Stop"}
                        bgColor={"rgba(255,0,0,0.1)"}
                        textColor={"red"}
                        borderColor={"rgba(255,0,0,0.3)"}
                      />
                    </Index.Grid>
                  )}
                  {permissions.includes("robotcommand_brushforward") && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => {}}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.clockwise}
                        imgAlt={"Forward"}
                        label={"Forward"}
                        bgColor={"rgba(0,0,255,0.1)"}
                        textColor={"blue"}
                        borderColor={"rgba(0,0,255,0.3)"}
                      />
                    </Index.Grid>
                  )}
                </Index.Grid>
              </Index.Grid> */}
              {/* ---- BRUSH MOTOR SECTION END---- */}
              {/* ---- LEFT MOTOR SECTION ---- */}
              {/* <Index.Grid item xs={12} sm={2}>
                <Index.Typography className="action-title">
                  Left Motor
                </Index.Typography>
              </Index.Grid>
              <Index.Grid item xs={12} sm={10}>
                <Index.Grid className="robot-control-actions-grid" container>
                  {permissions.includes("robotcommand_leftreverse") && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => {}}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.anticlockwise}
                        imgAlt={"Reverse"}
                        label={"Reverse"}
                        bgColor={"rgba(0,0,255,0.1)"}
                        textColor={"blue"}
                        borderColor={"rgba(0,0,255,0.3)"}
                      />
                    </Index.Grid>
                  )}
                  {permissions.includes("robotcommand_leftstop") && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => {}}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.stopIcon}
                        imgAlt={"Stop"}
                        label={"Stop"}
                        bgColor={"rgba(255,0,0,0.1)"}
                        textColor={"red"}
                        borderColor={"rgba(255,0,0,0.3)"}
                      />
                    </Index.Grid>
                  )}
                  {permissions.includes("robotcommand_leftforward") && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => {}}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.clockwise}
                        imgAlt={"Forward"}
                        label={"Forward"}
                        bgColor={"rgba(0,0,255,0.1)"}
                        textColor={"blue"}
                        borderColor={"rgba(0,0,255,0.3)"}
                      />
                    </Index.Grid>
                  )}
                </Index.Grid>
              </Index.Grid> */}
              {/* ---- LEFT MOTOR SECTION END---- */}
              {/* ---- RIGHT MOTOR SECTION ---- */}
              {/* <Index.Grid item xs={12} sm={2}>
                <Index.Typography className="action-title">
                  Right Motor
                </Index.Typography>
              </Index.Grid>
              <Index.Grid item xs={12} sm={10}>
                <Index.Grid container className="robot-control-actions-grid">
                  {permissions.includes("robotcommand_rightreverse") && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => {}}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.anticlockwise}
                        imgAlt={"Reverse"}
                        label={"Reverse"}
                        bgColor={"rgba(0,0,255,0.1)"}
                        textColor={"blue"}
                        borderColor={"rgba(0,0,255,0.3)"}
                      />
                    </Index.Grid>
                  )}
                  {permissions.includes("robotcommand_rightstop") && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => {}}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.stopIcon}
                        imgAlt={"Stop"}
                        label={"Stop"}
                        bgColor={"rgba(255,0,0,0.1)"}
                        textColor={"red"}
                        borderColor={"rgba(255,0,0,0.3)"}
                      />
                    </Index.Grid>
                  )}
                  {permissions.includes("robotcommand_rightforward") && (
                    <Index.Grid item md={11 / 5} xs={12} sm={5}>
                      <ActionButton
                        btnSx={{ minWidth: "100%" }}
                        onClick={() => {}}
                        isDisabled={disabledButtons}
                        imgSRC={PagesIndex.Svg.clockwise}
                        imgAlt={"Forward"}
                        label={"Forward"}
                        bgColor={"rgba(0,0,255,0.1)"}
                        textColor={"blue"}
                        borderColor={"rgba(0,0,255,0.3)"}
                      />
                    </Index.Grid>
                  )}
                </Index.Grid>
              </Index.Grid> */}
              {/* <Index.Grid item xs={12} sm={2}>
                <Index.Typography className="action-title">
                  Other
                </Index.Typography>
              </Index.Grid>
              <Index.Grid item xs={12} sm={10}>
                <Index.Grid container className="robot-control-actions-grid">
                  <Index.Grid
                    item
                    sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                    xs={12}
                    sm={4}
                    lg={3}
                  >
                    <ActionButton
                      btnSx={{ minWidth: "100%", height: "100%" }}
                      onClick={() => {
                        handleCommands(devEui, "RUN_DIAGNOSTICS");
                      }}
                      isDisabled={false}
                      imgSRC={PagesIndex.Svg.scan}
                      imgAlt={"Run diagnostic"}
                      label={"Run diagnostic"}
                      bgColor={"rgba(0,0,255,0.1)"}
                      textColor={"blue"}
                      borderColor={"rgba(0,0,255,0.3)"}
                    />
                  </Index.Grid>
                </Index.Grid>
              </Index.Grid> */}
              {/* ---- RIGHT MOTOR SECTION END---- */}
            </Index.Grid>
          </Index.Box>
          {/* ---- Config Parameters ---- */}
          {permissions.includes("robotconfig_refresh") && (
            <Config devEui={devEui} />
          )}
        </TabLayout>

        <Index.Grid container sx={{ margin: "20px 0" }}>
          {/* First Card (left block) */}
          <Index.Grid container spacing={2}>
            {" "}
            {/* Added container and spacing */}
            {/* First Card (Left Block: Round Button Content) */}
            <Index.Grid
              item
              xs={12} // Full width on mobile
              md={6} // Half width on desktop
              sx={{
                // Proportional heights: shorter on mobile so user doesn't have to scroll too much
                height: { xs: "350px", md: "50vh", lg: "60vh" },
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Index.Box
                className="common-card"
                sx={{
                  height: "100%",
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                <div
                  className="round-btn-content-card"
                  ref={containerRef}
                  style={{ height: "100%", width: "100%" }}
                ></div>
              </Index.Box>
            </Index.Grid>
            {/* Second Card (Right Block: Google Map) */}
            <Index.Grid
              item
              xs={12}
              md={6}
              sx={{
                height: { xs: "450px", md: "50vh", lg: "60vh" },
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Index.Box
                className="common-card"
                sx={{
                  height: "100%",
                  width: "100%",
                  p: 2, // Consistent padding
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Header section for Reset Button */}
                <Index.Box
                  sx={{
                    mb: 1,
                    display: "flex",
                    justifyContent: "flex-end",
                    flexShrink: 0, // Prevents header from squashing
                  }}
                >
                  <Index.Button
                    variant="outlined"
                    color="error"
                    size="small" // Smaller button for mobile
                    onClick={handleResetGpsPath}
                    disabled={isResettingPath}
                  >
                    {isResettingPath ? "Resetting..." : "Reset GPS Path"}
                  </Index.Button>
                </Index.Box>

                {/* Map Container */}
                <Index.Box
                  sx={{
                    flexGrow: 1,
                    width: "100%",
                    position: "relative",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  {isLoaded ? (
                    <GoogleMap
                      center={center}
                      zoom={17.5}
                      mapContainerStyle={{ width: "100%", height: "100%" }}
                      options={{
                        mapTypeControl: false, // Usually too cluttered for mobile
                        streetViewControl: false,
                        fullscreenControl: true,
                        zoomControl: true,
                        gestureHandling: "greedy", // Makes mobile panning easier
                      }}
                    >
                      <KmlLayer
                        url={kmlUrl}
                        options={{ preserveViewport: true }}
                      />
                      <MarkerF position={homePosition} label="Home" />
                      <MarkerF position={reversePosition} label="Reverse" />

                      <Polyline
                        path={[homePosition, reversePosition]}
                        options={{
                          strokeColor: "rgb(14, 14, 14)",
                          strokeOpacity: 0.7,
                          strokeWeight: 3,
                        }}
                      />

                      {pathData?.length > 0 && (
                        <>
                          <Polyline
                            path={filteredPath}
                            options={{
                              strokeColor: "rgb(100, 127, 233)",
                              strokeOpacity: 1.0,
                              strokeWeight: 6,
                            }}
                          />
                          <MarkerF
                            position={pathData?.[pathData?.length - 1]}
                            onClick={() => setShowInfo(true)}
                          >
                            {showInfo && (
                              <InfoWindow
                                position={pathData?.[pathData?.length - 1]}
                                onCloseClick={() => setShowInfo(false)}
                              >
                                <div
                                  style={{ fontSize: "12px", padding: "5px" }}
                                >
                                  Distance: <strong>{formattedDistance}</strong>
                                </div>
                              </InfoWindow>
                            )}
                          </MarkerF>
                        </>
                      )}
                    </GoogleMap>
                  ) : null}
                </Index.Box>
              </Index.Box>
            </Index.Grid>
          </Index.Grid>
        </Index.Grid>

        <Index.Box className="common-card bat-card">
          <Index.Box
            className="admin-sub-title-main"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Index.Typography className="admin-sub-title">
              Alarm List
            </Index.Typography>
            <Index.Button
              variant="outlined"
              onClick={handleExportAlarms}
              disabled={isExportingAlarms || alarmListData?.length === 0}
              startIcon={
                isExportingAlarms ? <CircularProgress size={20} /> : null // Replace with <DownloadIcon /> if available
              }
            >
              {isExportingAlarms ? "Exporting..." : "Export"}
            </Index.Button>
            <CSVLink
              data={alarmExportData}
              filename={`alarm-list-${devEui}.csv`}
              ref={alarmCsvLinkRef}
              style={{ display: "none" }}
            />
          </Index.Box>

          <Index.Box
            className="common-card"
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: "transparent",
              boxShadow: "none",
              border: "1px solid #e0e0e0",
            }}
          >
            <PagesIndex.Formik
              enableReinitialize
              initialValues={alarmInitialValues}
              validationSchema={PagesIndex.alarmFormSchema}
              onSubmit={handleSubmitAlarmForm}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleSubmit,
                setFieldValue,
                resetForm,
              }) => (
                <PagesIndex.Form onSubmit={handleSubmit}>
                  <Index.Grid container spacing={2} alignItems="flex-end">
                    <Index.Grid item xs={12} sm={6} md={2.5}>
                      <Index.Typography
                        component="label"
                        htmlFor="alarmCode"
                        sx={{
                          display: "block",
                          fontWeight: "bold",
                          mb: 0.5,
                          fontSize: "14px",
                        }}
                      >
                        Alarm Code
                      </Index.Typography>
                      <TextField
                        id="alarmCode"
                        name="alarmCode"
                        placeholder="Enter code"
                        fullWidth
                        value={values.alarmCode}
                        onChange={handleChange}
                        size="small"
                      />
                      <Index.FormHelperText error>
                        {errors?.alarmCode && touched?.alarmCode
                          ? errors?.alarmCode
                          : null}
                      </Index.FormHelperText>
                    </Index.Grid>
                    <Index.Grid item xs={12} sm={6} md={2.5}>
                      <Index.Typography
                        component="label"
                        htmlFor="alarmName"
                        sx={{
                          display: "block",
                          fontWeight: "bold",
                          mb: 0.5,
                          fontSize: "14px",
                        }}
                      >
                        Alarm Name
                      </Index.Typography>
                      <TextField
                        id="alarmName"
                        name="alarmName"
                        placeholder="Enter name"
                        fullWidth
                        value={values.alarmName}
                        onChange={handleChange}
                        size="small"
                      />
                      <Index.FormHelperText error>
                        {errors?.alarmName && touched?.alarmName
                          ? errors?.alarmName
                          : null}
                      </Index.FormHelperText>
                    </Index.Grid>
                    <Index.Grid item xs={12} sm={6} md={2.5}>
                      <Index.Typography
                        component="label"
                        htmlFor="startDate"
                        sx={{
                          display: "block",
                          fontWeight: "bold",
                          mb: 0.5,
                          fontSize: "14px",
                        }}
                      >
                        From Date
                      </Index.Typography>
                      <TextField
                        id="startDate"
                        name="startDate"
                        type="date"
                        fullWidth
                        value={values.startDate}
                        onChange={(e) => {
                          handleChange(e);
                          setFieldValue("endDate", "");
                        }}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                      <Index.FormHelperText error>
                        {errors?.startDate && touched?.startDate
                          ? errors?.startDate
                          : null}
                      </Index.FormHelperText>
                    </Index.Grid>
                    <Index.Grid item xs={12} sm={6} md={2.5}>
                      <Index.Typography
                        component="label"
                        htmlFor="endDate"
                        sx={{
                          display: "block",
                          fontWeight: "bold",
                          mb: 0.5,
                          fontSize: "14px",
                        }}
                      >
                        To Date
                      </Index.Typography>
                      <TextField
                        id="endDate"
                        name="endDate"
                        type="date"
                        fullWidth
                        value={values.endDate}
                        disabled={!values.startDate}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                        inputProps={{
                          min: values.startDate
                            ? values.startDate
                            : "1900-01-01",
                        }}
                      />
                      <Index.FormHelperText error>
                        {errors?.endDate && touched?.endDate
                          ? errors?.endDate
                          : null}
                      </Index.FormHelperText>
                    </Index.Grid>
                    <Index.Grid item xs={12} md={2}>
                      <Index.Box sx={{ display: "flex", gap: 1 }}>
                        <Index.Button
                          variant="contained"
                          type="submit"
                          sx={{ flexGrow: 1 }}
                        >
                          Apply
                        </Index.Button>
                        <Index.Button
                          variant="outlined"
                          onClick={() => handleResetAlarmFilters(resetForm)}
                          sx={{ flexGrow: 1 }}
                        >
                          Reset
                        </Index.Button>
                      </Index.Box>
                    </Index.Grid>
                  </Index.Grid>
                </PagesIndex.Form>
              )}
            </PagesIndex.Formik>
          </Index.Box>
          <DataTable
            headerData={[
              { field: "No" },
              { field: "Alarm code" },
              { field: "Alarm Name" },
              { field: "Description" },
              { field: "Trigger Date" },
              { field: "Close Date" },
            ]}
            filterData={alarmListTotalCount}
            currentPage={alarmCurrentPage}
            setCurrentPage={(page) => getAlarmList(page, alarmFilters)}
          >
            {alarmListData?.map((data, i) => {
              return (
                <Index.TableRow
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                  key={data?.id}
                >
                  <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {(alarmCurrentPage - 1) * 10 + i + 1}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {data?.object?.error_code}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {data?.object?.error_name}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {data?.object?.failure_data || "-"}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {moment(data?.time).format("DD-MM-YYYY hh:mm:ss A")}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {moment(data?.time).format("DD-MM-YYYY hh:mm:ss A")}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                </Index.TableRow>
              );
            })}
          </DataTable>
        </Index.Box>
        <Index.Box className="common-card bat-card">
          <Index.Box
            className="admin-sub-title-main"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Index.Typography className="admin-sub-title">
              Historical Data
            </Index.Typography>
            <Index.Button
              variant="outlined"
              onClick={handleExportHistorical}
              disabled={isExportingHistorical || historicalData?.length === 0}
              startIcon={
                isExportingHistorical ? <CircularProgress size={20} /> : null // Replace with <DownloadIcon /> if available
              }
            >
              {isExportingHistorical ? "Exporting..." : "Export"}
            </Index.Button>
            <CSVLink
              data={historicalExportData}
              filename={`historical-data-${devEui}.csv`}
              ref={historicalCsvLinkRef}
              style={{ display: "none" }}
            />
          </Index.Box>

          {/* ----- NEW Historical Data Filter Bar ----- */}
          <Index.Box
            className="common-card"
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: "transparent",
              boxShadow: "none",
              border: "1px solid #e0e0e0",
            }}
          >
            <Index.Grid container spacing={2} alignItems="flex-end">
              <Index.Grid item xs={12} sm={6} md={4}>
                <Index.Typography
                  component="label"
                  htmlFor="hist-startDate"
                  sx={{
                    display: "block",
                    fontWeight: "bold",
                    mb: 0.5,
                    fontSize: "14px",
                  }}
                >
                  From Date
                </Index.Typography>
                <TextField
                  id="hist-startDate"
                  name="startDate"
                  type="date"
                  fullWidth
                  value={historicalFilters.startDate}
                  onChange={handleHistoricalFilterChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Index.Grid>
              <Index.Grid item xs={12} sm={6} md={4}>
                <Index.Typography
                  component="label"
                  htmlFor="hist-endDate"
                  sx={{
                    display: "block",
                    fontWeight: "bold",
                    mb: 0.5,
                    fontSize: "14px",
                  }}
                >
                  To Date
                </Index.Typography>
                <TextField
                  id="hist-endDate"
                  name="endDate"
                  type="date"
                  fullWidth
                  value={historicalFilters.endDate}
                  onChange={handleHistoricalFilterChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  inputProps={{
                    min: historicalFilters.startDate || "1900-01-01",
                  }}
                />
              </Index.Grid>
              <Index.Grid item xs={12} md={4}>
                <Index.Box sx={{ display: "flex", gap: 1 }}>
                  <Index.Button
                    variant="contained"
                    onClick={handleApplyHistoricalFilters}
                    sx={{ flexGrow: 1 }}
                  >
                    Apply
                  </Index.Button>
                  <Index.Button
                    variant="outlined"
                    onClick={handleResetHistoricalFilters}
                    sx={{ flexGrow: 1 }}
                  >
                    Reset
                  </Index.Button>
                </Index.Box>
              </Index.Grid>
            </Index.Grid>
          </Index.Box>
          {/* ----- END Historical Data Filter Bar ----- */}

          <DataTable
            headerData={[
              { field: "Sr. No." },
              { field: "Time" },
              { field: "Motor (Brush)", colSpan: 3 },
              { field: "Motor (Left)", colSpan: 3 },
              { field: "Motor (Right)", colSpan: 3 },
              { field: "Battery (Main)", colSpan: 4 },
            ]}
            subHeaderData={[
              { field: "" },
              { field: "" },
              { field: "Temp" },
              { field: "Current" },
              // { field: "Voltage" },
              { field: "Speed" },
              { field: "Temp" },
              { field: "Current" },
              // { field: "Voltage" },
              { field: "Speed" },
              { field: "Temp" },
              { field: "Current" },
              // { field: "Voltage" },
              { field: "Speed" },
              { field: "Temp" },
              { field: "Current" },
              { field: "Voltage" },
              { field: "Level" },
            ]}
            filterData={totalHistoricalCount}
            currentPage={historicalCurrentPage}
            setCurrentPage={(page) =>
              getHistoricalList(page, historicalFilters)
            }
          >
            {historicalData?.map((data, i) => {
              const {
                brush_motor,
                left_motor,
                right_motor,
                main_battery,
                // imu,
              } = data;
              return (
                <Index.TableRow
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                  key={data?.id || i} // Use index as fallback key
                >
                  <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {(historicalCurrentPage - 1) * 10 + i + 1}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {PagesIndex.moment(data?.time)?.format(
                          "DD/MM/YYYY hh:mm:ss A",
                        )}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {brush_motor?.temperature}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {brush_motor?.current}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  {/* <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {brush_motor?.voltage}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell> */}
                  <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {brush_motor?.speed}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {left_motor?.temperature}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {left_motor?.current}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  {/* <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {left_motor?.voltage}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell> */}
                  <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {left_motor?.speed}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {right_motor?.temperature}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {right_motor?.current}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  {/* <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {right_motor?.voltage}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell> */}
                  <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {right_motor?.speed}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {main_battery?.temp}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {main_battery?.current}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {main_battery?.voltage}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {main_battery?.level}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  {/* <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {imu?.gyro_x.toFixed(2)}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {imu?.gyro_y.toFixed(2)}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {imu?.gyro_z.toFixed(2)}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell> */}
                </Index.TableRow>
              );
            })}
          </DataTable>
        </Index.Box>
        {/* <Index.Box className="common-card bat-card">
          <Index.Box
            className="admin-sub-title-main"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Index.Typography className="admin-sub-title">
              Joining List
            </Index.Typography>
          </Index.Box>
          <DataTable
            headerData={[
              { field: "No" },
              { field: "Joining address" },
              { field: "Device Profile" },
              { field: "Joining Date" },
              { field: "Joining Time" },
            ]}
            filterData={joiningData}
          >
            {joiningData?.map((data, i) => {
              return (
                <Index.TableRow
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                  key={data?.id}
                >
                  <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {i + 1}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {data?.devAddr}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {data?.deviceInfo?.deviceProfileName}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {moment(data?.time).format("DD-MM-YYYY")}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {moment(data?.time).format("hh:mm:ss A")}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                </Index.TableRow>
              );
            })}
          </DataTable>
        </Index.Box> */}
      </Index.Box>
    </>
  );
}
