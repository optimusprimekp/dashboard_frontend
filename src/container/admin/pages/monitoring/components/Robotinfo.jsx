import React, { useContext, useEffect, useState } from "react";
import Index from "../../../../Index";
import DetailsField from "../../../../../component/common/detailsField/DetailsField";
import TabLayout from "../../../../../component/common/tabs/TabLayout";
import ActionButton from "../../../../../component/common/Button/ActionButton";
import PagesIndex from "../../../../PagesIndex";
import RobotDistanceTravelled from "../../../../../component/common/robotDetailComponents/RobotDistanceTravelled";
import mqtt from "mqtt";
import PageIndex from "../../../../../component/PagesIndex";

const Robotinfo = ({ robot, onRefreshSuccess }) => {
  const { profile } = useContext(PageIndex.ProfileContext);
  const permissions = profile?.Role?.permissions || [];
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [disabledButtons, setDisabledButtons] = useState(false);
  const [commandStatus, setCommandStatus] = useState(undefined);
  const [commandStatusMessage, setCommandStatusMessage] = useState("");
  const [deviceDetails, setDeviceDetails] = useState(robot);
  const [client, setClient] = useState(null);

  console.log("Robotinfo component rendered with robot:", robot);

  function formatData(data, time) {
    return {
      left_motor: {
        temperature: data?.motor2?.temp || data?.left_motor?.temp || 0,
        current:
          data?.motor2?.current / 1000 || data?.left_motor?.current / 1000 || 0,
        voltage:
          data?.motor2?.voltage / 1000 || data?.left_motor?.voltage / 1000 || 0,
        speed: data?.motor2?.speed / 100 || data?.left_motor?.speed || 0,
      },
      right_motor: {
        temperature: data?.motor1?.temp || data?.right_motor?.temp || 0,
        current:
          data?.motor1?.current / 1000 ||
          data?.right_motor?.current / 1000 ||
          0,
        voltage:
          data?.motor1?.voltage / 1000 ||
          data?.right_motor?.voltage / 1000 ||
          0,
        speed: data?.motor1?.speed / 100 || data?.right_motor?.speed || 0,
      },
      brush_motor: {
        temperature: data?.motor3?.temp || data?.brush_motor?.temp || 0,
        current:
          data?.motor3?.current / 1000 ||
          data?.brush_motor?.current / 1000 ||
          0,
        voltage:
          data?.motor3?.voltage / 1000 ||
          data?.brush_motor?.voltage / 1000 ||
          0,
        speed: data?.motor3?.speed / 100 || data?.brush_motor?.speed || 0,
      },
      main_battery: {
        state: data?.main_battery?.state || data?.main_battery?.state || "-",
        level: data?.main_battery?.level || 0,
        temp: data?.main_battery?.temp || 0,
        current: data?.main_battery?.current / 1000 || 0,
        voltage: data?.main_battery?.voltage / 1000 || 0,
        discharging_switch: data?.main_battery?.discharging_switch ?? "-",
        charging_switch: data?.main_battery?.charging_switch ?? "-",
        load_status: data?.main_battery?.load_status ?? "-",
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
        gyro_x: data?.imu?.gyro_x / 16.4 || data?.imu?.gyro_x / 16.4 || 0,
        gyro_y: data?.imu?.gyro_y / 16.4 || data?.imu?.gyro_y / 16.4 || 0,
        gyro_z: data?.imu?.gyro_z / 16.4 || data?.imu?.gyro_z / 16.4 || 0,
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
  const telemetryData = formatData(
    robot?.telemetryData?.object,
    robot?.telemetryData?.time
  );

  const handleRefreshTelemetryData = async () => {
    setIsRefreshing(true);
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_ADD_EDIT_DEVICES + `/overview/${robot.id}`
      );
      if (res.status === 200 && res.data) {
        onRefreshSuccess(res.data);
        setDeviceDetails(res.data);
        PagesIndex.toasterSuccess("Data refreshed successfully!");
      } else {
        PagesIndex.toasterError(
          `Failed to refresh data for robot: ${robot.devEui}`
        );
      }
    } catch (error) {
      console.error("Error refreshing telemetry data:", error);
      PagesIndex.toasterError("An unexpected error occurred during refresh.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDisabledButtonAction = () => {
    PagesIndex.toasterSuccess("Command executing...");
    setDisabledButtons(true);
    setTimeout(() => {
      setDisabledButtons(false);
    }, 1000);
  };

  const handleCommands = async (devEui, buttonKey) => {
    PagesIndex.toasterSuccess("Command sent");
    const payload = { devEui, type: buttonKey };
    const res = await PagesIndex.apiPostHandler(
      `${PagesIndex.Api.GET_ADD_EDIT_DEVICES}/queue`,
      payload
    );
    if (res?.status == 200) {
      PagesIndex.toasterSuccess("Command in queue");
      handleDisabledButtonAction();
    }
  };

  useEffect(() => {
    setDisabledButtons(false);
    if (typeof commandStatus === "boolean" && commandStatus) {
      PagesIndex.toasterSuccess("Command executed succesfully");
      setCommandStatus(undefined);
    } else if (typeof commandStatus === "boolean" && !commandStatus) {
      PagesIndex.toasterError(
        `Command execution failed due to ${commandStatusMessage} `
      );
      setCommandStatus(undefined);
    }
  }, [commandStatus]);

  useEffect(() => {
    const brokerUrl = import.meta.env.VITE_MQTT_URL;
    const options = {
      username: import.meta.env.VITE_MQTT_USERNAME,
      password: import.meta.env.VITE_MQTT_PASSWORD,
      clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
      clean: false,
    };
    const mqttClient = mqtt.connect(brokerUrl, options);

    mqttClient.on("connect", () => {
      console.log("Connected to ChirpStack MQTT broker");
      const topic = `application/${robot.applicationId}/device/${robot.devEui}/event/up`;
      mqttClient.subscribe(topic, (err, data) => {
        if (!err) {
          console.log("Subscribed to uplink events", data?.[0]?.topic);
        } else {
          console.error("Error subscribing to topic:", err);
        }
      });
    });

    mqttClient.on("error", (err) => {
      console.error("MQTT connection error:", err);
    });

    mqttClient.on("message", (topic, payload) => {
      console.log(`Received message on topic ${topic}:`, JSON.parse(payload));
      const response = JSON.parse(payload);
      console.log(response);

      // --- MODIFIED LOGIC FOR BATTERY REPORT ---
      if (
        response?.object?.received_command === "GET_DATA" &&
        response?.object?.command_response === "CMD_SUCCESS" &&
        response?.object?.peripheral?.peripheral_name === "BMS_DATA"
      ) {
        console.log("BMS_DATA received! Opening report in a new tab.");
        PagesIndex.toasterSuccess(
          "Battery health report received. Opening in a new tab."
        );

        // Store data in localStorage for the new tab to access
        localStorage.setItem(
          "latestBmsReportData",
          JSON.stringify(response.object.peripheral)
        );

        window.open("/admin/battery-report", "_blank");
      }
      if (
        response?.object?.received_command === "RUN_DIAGNOSTICS" &&
        response?.object?.command_response === "CMD_SUCCESS"
      ) {
        console.log("Run diagnostics received! Opening report in a new tab.");
        PagesIndex.toasterSuccess(
          "Diagnostics report received. Opening in a new tab."
        );

        // Store data in localStorage for the new tab to access
        localStorage.setItem(
          "latestDiagnosticsReportData",
          JSON.stringify(response.object)
        );

        window.open("/admin/diagnostic-report", "_blank");
      }

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
      setCommandStatus(
        response?.object?.command_status === 0 ||
          response?.object?.command_response === "CMD_SUCCESS"
          ? true
          : response?.object?.command_status === 1 ||
            commandFailed.includes(response?.object?.command_response)
          ? false
          : ""
      );
      setCommandStatusMessage(
        commandFailed.includes(response?.object?.command_response)
          ? response?.object?.command_response
          : ""
      );
    });

    mqttClient.on("reconnect", () => {
      console.log("Reconnecting to ChirpStack MQTT broker...");
    });
    mqttClient.on("close", () => {
      console.log("MQTT connection closed");
    });
    mqttClient.on("offline", function () {
      console.log("offline");
    });

    setClient(mqttClient);

    return () => {
      mqttClient.end();
      console.log("Disconnected from ChirpStack MQTT broker");
    };
  }, [robot?.applicationId, robot?.devEui]); // Dependencies to re-run effect if robot changes
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
  const tabs = ["Display parameters", "Control parameters"];
  function calculatePercentage(currentValue, fixedValue) {
    if (fixedValue === 0) {
      return "Error: Fixed value cannot be zero.";
    }
    const percentage = (currentValue / fixedValue) * 100;
    return percentage > 100 ? 100 : percentage;
  }
  return (
    <Index.Box>
      <Index.Grid container>
        <Index.Grid item xs={12}>
          <DetailsField label={"Robot Name"} text={robot?.name}>
            {isRobotActive(robot?.lastSeen)}
          </DetailsField>
        </Index.Grid>
        <Index.Grid item xs={12} md={6}>
          <DetailsField label={"Dev EUI"} text={robot?.devEui} />
        </Index.Grid>
        <Index.Grid item xs={12} md={6}>
          <DetailsField label={"Device type"} text={robot?.deviceType} />
        </Index.Grid>
        <Index.Grid item xs={12} md={6}>
          <DetailsField
            label={"Hardware version"}
            text={robot?.hardwareVersion}
          />
        </Index.Grid>
        <Index.Grid item xs={12} md={6}>
          <DetailsField
            label={"Software version"}
            text={robot?.firmwareVersion}
          />
        </Index.Grid>
        <Index.Grid item xs={12}>
          <DetailsField
            label={"Running Command"}
            text={robot?.runningCommand}
          />
        </Index.Grid>
      </Index.Grid>
      <Index.Box sx={{ marginTop: "10px" }}>
        <TabLayout tabs={tabs}>
          <Index.Box>
            <Index.Button
              sx={{
                fontSize: "14px",
                right: "0",
                background: "rgba(0,0,255,0.1)",
                padding: "5px 0",
                width: "100px",
                color: "blue",
                borderRadius: "20px",
                textAlign: "center",
                float: "right",
                opacity: isRefreshing ? 0.6 : 1,
                cursor: isRefreshing ? "not-allowed" : "pointer",
              }}
              onClick={handleRefreshTelemetryData}
              disabled={isRefreshing}
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Index.Button>
            <Index.Box className="robot-progress-bar-content">
              <Index.Typography className="action-title">
                Distance Travelled
              </Index.Typography>
              <span className="admin-progress-bar-text">
                {calculatePercentage(
                  deviceDetails?.distanceTravelled,
                  deviceDetails?.table_row?.distance * 2
                ).toFixed(2)}
                %
              </span>
            </Index.Box>
            <RobotDistanceTravelled
              totalDistance={
                calculatePercentage(
                  deviceDetails?.distanceTravelled,
                  deviceDetails?.table_row?.distance * 2
                ).toFixed(2) || 0
              }
            />
            <Index.Box
              sx={{ display: "flex", flexWrap: "wrap" }}
              className="details-flex-fields-container"
            >
              <DetailsField
                label={"Current Cycle Progress"}
                text={`${(deviceDetails?.distanceTravelled || 0).toFixed(
                  2
                )} meters`}
              />
              <DetailsField
                label={"Total Cycle Travelled (direction)"}
                text={telemetryData?.robot?.direction}
              />
              <DetailsField
                label={"Distance Travelled Per Cycle (speed)"}
                text={telemetryData?.robot?.speed}
              />
            </Index.Box>
            <Index.Typography
              sx={{ marginTop: "10px", marginBottom: "10px" }}
              className="action-title"
            >
              Main Battery
            </Index.Typography>
            <Index.Grid container>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Status"}
                  text={telemetryData?.main_battery?.load_status ?? "-"}
                />
              </Index.Grid>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Source"}
                  text={telemetryData?.status_byte?.current_power_source ?? "-"}
                />
              </Index.Grid>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Charging Switch"}
                  text={telemetryData?.main_battery?.charging_switch ?? "-"}
                />
              </Index.Grid>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Discharge Switch"}
                  text={telemetryData?.main_battery?.discharging_switch ?? "-"}
                />
              </Index.Grid>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Level"}
                  text={`${telemetryData?.main_battery.level}%`}
                />
              </Index.Grid>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Temperature"}
                  text={`${telemetryData?.main_battery.temp} °C`}
                />
              </Index.Grid>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Current"}
                  text={`${telemetryData?.main_battery.current} A`}
                />
              </Index.Grid>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Voltage"}
                  text={`${telemetryData?.main_battery.voltage} V`}
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
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Direction"}
                  text={telemetryData?.status_byte?.brush_motor_direction}
                />
              </Index.Grid>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Speed"}
                  text={`${telemetryData?.brush_motor.speed} RPM`}
                />
              </Index.Grid>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Temperature"}
                  text={`${telemetryData?.brush_motor.temperature} °C`}
                />
              </Index.Grid>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Current"}
                  text={`${telemetryData?.brush_motor.current} A`}
                />
              </Index.Grid>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Voltage"}
                  text={`${telemetryData?.brush_motor.voltage} V`}
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
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Direction"}
                  text={telemetryData?.status_byte?.left_motor_direction}
                />
              </Index.Grid>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Speed"}
                  text={`${telemetryData?.left_motor.speed} RPM`}
                />
              </Index.Grid>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Temperature"}
                  text={`${telemetryData?.left_motor.temperature} °C`}
                />
              </Index.Grid>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Current"}
                  text={`${telemetryData?.left_motor.current} A`}
                />
              </Index.Grid>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Voltage"}
                  text={`${telemetryData?.left_motor.voltage} V`}
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
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Direction"}
                  text={telemetryData?.status_byte?.right_motor_direction}
                />
              </Index.Grid>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Speed"}
                  text={`${telemetryData?.right_motor.speed} RPM`}
                />
              </Index.Grid>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Temperature"}
                  text={`${telemetryData?.right_motor.temperature} °C`}
                />
              </Index.Grid>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Current"}
                  text={`${telemetryData?.right_motor.current} A`}
                />
              </Index.Grid>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Voltage"}
                  text={`${telemetryData?.right_motor.voltage} V`}
                />
              </Index.Grid>
            </Index.Grid>
            <Index.Typography
              sx={{ marginTop: "10px", marginBottom: "10px" }}
              className="action-title"
            >
              Switch status
            </Index.Typography>
            <Index.Grid container>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Left"}
                  text={telemetryData?.status_byte?.left_switch_status}
                />
              </Index.Grid>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Right"}
                  text={telemetryData?.status_byte?.right_switch_status}
                />
              </Index.Grid>
            </Index.Grid>
            <Index.Typography
              sx={{ marginTop: "10px", marginBottom: "10px" }}
              className="action-title"
            >
              Proximity status
            </Index.Typography>
            <Index.Grid container>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Left"}
                  text={telemetryData?.status_byte?.left_proximity_status}
                />
              </Index.Grid>
              <Index.Grid item xs={12} sm={6}>
                <DetailsField
                  label={"Right"}
                  text={telemetryData?.status_byte?.right_proximity_status}
                />
              </Index.Grid>
            </Index.Grid>
          </Index.Box>
          <Index.Box>
            <Index.Grid container rowGap={"15px"}>
              {permissions.includes("robottreelevelcommand_clean") && (
                <Index.Grid
                  item
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                  xs={12}
                  sm={3}
                  lg={2.4}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%" }}
                    onClick={() => {
                      handleCommands(robot?.devEui, "CLEAN_ONE_CYCLE");
                    }}
                    isDisabled={disabledButtons}
                    imgSRC={PagesIndex.Svg.powerButton}
                    imgAlt={"Clean one cycle"}
                    label={"Clean one cycle"}
                    bgColor={"rgba(55,126,34,0.1)"}
                    textColor={"rgba(55,126,34,1)"}
                    borderColor={"rgba(55,126,34,0.3)"}
                  />
                </Index.Grid>
              )}
              {permissions.includes("robottreelevelcommand_home") && (
                <Index.Grid
                  item
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                  xs={12}
                  sm={3}
                  lg={2.4}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%" }}
                    onClick={() => {
                      handleCommands(robot?.devEui, "HOME");
                    }}
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
              {permissions.includes("robottreelevelcommand_left") && (
                <Index.Grid
                  item
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                  xs={12}
                  sm={3}
                  lg={2.4}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%" }}
                    onClick={() => {
                      handleCommands(robot?.devEui, "LEFT_START");
                    }}
                    isDisabled={disabledButtons}
                    imgSRC={PagesIndex.Svg.leftArrowIcon}
                    imgAlt={"Left start"}
                    label={"Left start"}
                    bgColor={"rgba(0,0,255,0.1)"}
                    textColor={"blue"}
                    borderColor={"rgba(0,0,255,0.3)"}
                  />
                </Index.Grid>
              )}
              {permissions.includes("robottreelevelcommand_standby") && (
                <Index.Grid
                  item
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                  xs={12}
                  sm={3}
                  lg={2.4}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%", height: "100%" }}
                    onClick={() => {
                      handleCommands(robot?.devEui, "STOP_ROBOT");
                    }}
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
              {permissions.includes("robottreelevelcommand_right") && (
                <Index.Grid
                  item
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                  xs={12}
                  sm={4}
                  lg={2.4}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%" }}
                    onClick={() => {
                      handleCommands(robot?.devEui, "RIGHT_START");
                    }}
                    isDisabled={disabledButtons}
                    imgSRC={PagesIndex.Svg.rightArrowIcon}
                    imgAlt={"Right start"}
                    label={"Right start"}
                    bgColor={"rgba(0,0,255,0.1)"}
                    textColor={"blue"}
                    borderColor={"rgba(0,0,255,0.3)"}
                  />
                </Index.Grid>
              )}
            </Index.Grid>
            {/* <Index.Grid container sx={{ marginTop: "15px" }} rowGap={"15px"}>
              {permissions.includes(
                "robottreelevelcommand_enterchargingstate"
              ) && (
                <Index.Grid
                  item
                  xs={12}
                  sm={6}
                  lg={3}
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%" }}
                    onClick={() => {
                      handleCommands(robot?.devEui, "ENTER_CHARGING_STATE");
                    }}
                    isDisabled={disabledButtons}
                    imgSRC={PagesIndex.Svg.charge}
                    imgAlt={"Enter charging state"}
                    label={"Enter charging state"}
                    bgColor={"rgba(0,0,255,0.1)"}
                    textColor={"blue"}
                    borderColor={"rgba(0,0,255,0.3)"}
                  />
                </Index.Grid>
              )}
              {permissions.includes(
                "robottreelevelcommand_exitchargingstate"
              ) && (
                <Index.Grid
                  item
                  xs={12}
                  sm={6}
                  lg={3}
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%" }}
                    onClick={() => {
                      handleCommands(robot?.devEui, "EXIT_CHARGING_STATE");
                    }}
                    isDisabled={disabledButtons}
                    imgSRC={PagesIndex.Svg.chargeOff}
                    imgAlt={"Exit charging state"}
                    label={"Exit charging state"}
                    bgColor={"rgba(255,0,0,0.1)"}
                    textColor={"red"}
                    borderColor={"rgba(255,0,0,0.3)"}
                  />
                </Index.Grid>
              )}
              {permissions.includes("robottreelevelcommand_softreset") && (
                <Index.Grid
                  item
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                  xs={12}
                  sm={4}
                  lg={3}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%" }}
                    onClick={() => {
                      handleCommands(robot?.devEui, "SOFT_RESET");
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
                <Index.Grid
                  item
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                  xs={12}
                  sm={4}
                  lg={3}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%" }}
                    onClick={() => {
                      handleCommands(robot?.devEui, "HARD_RESET");
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
            <Index.Grid container sx={{ marginTop: "15px" }} rowGap={"15px"}>
              {permissions.includes(
                "robottreelevelcommand_entermaintenancestate"
              ) && (
                <Index.Grid
                  item
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                  xs={12}
                  sm={6}
                  lg={3}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%", maxWidth: "100%" }}
                    onClick={() => {
                      handleCommands(robot?.devEui, "ENTER_MAINTENANCE_STATE");
                    }}
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
                "robottreelevelcommand_exitmaintenancestate"
              ) && (
                <Index.Grid
                  item
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                  xs={12}
                  sm={6}
                  lg={3}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%", maxWidth: "100%" }}
                    onClick={() => {
                      handleCommands(robot?.devEui, "EXIT_MAINTENANCE_STATE");
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
              {permissions.includes("robottreelevelcommand_fetchbattery") && (
                <Index.Grid
                  item
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                  xs={12}
                  sm={4}
                  lg={3}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%" }}
                    onClick={() => {
                      handleCommands(robot?.devEui, "CHECK_BATTERY_STATUS");
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
              {permissions.includes("robottreelevelcommand_rundiagnostic") && (
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
            </Index.Grid>
            <Index.Grid container sx={{ marginTop: "15px" }} rowGap={"15px"}>
              {permissions.includes("robottreelevelcommand_brushmotor") && (
                <Index.Grid
                  item
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                  xs={12}
                  sm={4}
                  lg={2}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%" }}
                    onClick={() => {
                      handleCommands(robot?.devEui, "BRUSH_MOTOR_CHECK");
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
                <Index.Grid
                  item
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                  xs={12}
                  sm={4}
                  lg={2}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%" }}
                    onClick={() => {
                      handleCommands(robot?.devEui, "LEFT_MOTOR_CHECK");
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
                <Index.Grid
                  item
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                  xs={12}
                  sm={4}
                  lg={2}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%" }}
                    onClick={() => {
                      handleCommands(robot?.devEui, "RIGHT_MOTOR_CHECK");
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
                <Index.Grid
                  item
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                  xs={12}
                  sm={4}
                  lg={2}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%" }}
                    onClick={() => {
                      handleCommands(robot?.devEui, "IMU_CHECK");
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
                <Index.Grid
                  item
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                  xs={12}
                  sm={4}
                  lg={2}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%" }}
                    onClick={() => {
                      handleCommands(robot.devEui, "GPS_CHECK");
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
                <Index.Grid
                  item
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                  xs={12}
                  sm={4}
                  lg={2}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%" }}
                    onClick={() => {
                      handleCommands(robot.devEui, "BATTERY_CHECK");
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
            </Index.Grid> */}
          </Index.Box>
        </TabLayout>
      </Index.Box>
    </Index.Box>
  );
};

export default Robotinfo;
