import Index from "../../../Index";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import PagesIndex from "../../../PagesIndex";
import { useCallback, useEffect, useRef, useState } from "react";
import DataTable from "../../../../component/common/dataTable/DataTable";
import mqtt from "mqtt";
import { useParams } from "react-router-dom";
import axios from "axios";
import * as THREE from "three";
import TabLayout from "../../../../component/common/tabs/TabLayout";
import DetailsField from "../../../../component/common/detailsField/DetailsField";
// for custom progressbar design

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === "light" ? "#1a90ff" : "#308fe8",
  },
}));

export default function RobotControl() {
  const [filterData, setFilterData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalHistoricalCount, setTotalHistoricalCount] = useState(0);
  const [historicalCurrentPage, setHistoricalCurrentPage] = useState(1);
  const [client, setClient] = useState(null);
  const { appId, devEui } = useParams();
  const [deviceData, setDeviceData] = useState();
  const [cubeRotation, setCubeRotation] = useState({ x: 0, y: 0, z: 0 });

  const [disabledButtons, setDisabledButtons] = useState(false);
  const [commandStatus, setCommandStatus] = useState(undefined);

  const handleDisabledButtonAction = (buttonKey) => {
    setDisabledButtons(true);
    // setDisabledButtons((prev) => ({ ...prev, [buttonKey]: true }));

    // // Re-enable button after 15 seconds
    setTimeout(() => {
      setDisabledButtons(false);
      // setDisabledButtons((prev) => ({ ...prev, [buttonKey]: false }));
    }, 15000);
  };

  const handlePowerStart = async (devEui, buttonKey) => {
    const res = await axios.post(
      `${import.meta.env.VITE_CHIRPSTACK_BASE_URL}/${
        PagesIndex.Api.SEND_COMMANDS
      }/${devEui}/queue`,
      {
        queueItem: {
          confirmed: true,
          fPort: 8,
          data: "XAMBAAA=",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_CHIRPSTACK_TOKEN}`,
        },
      }
    );
    if (res?.status) {
      PagesIndex.toasterSuccess("Robot starting in progress");
      handleDisabledButtonAction(buttonKey);
    } else {
      PagesIndex.toasterError(res?.message);
    }
  };
  const handlePowerStop = async (devEui, buttonKey) => {
    const res = await axios.post(
      `${import.meta.env.VITE_CHIRPSTACK_BASE_URL}/${
        PagesIndex.Api.SEND_COMMANDS
      }/${devEui}/queue`,
      {
        queueItem: {
          confirmed: true,
          fPort: 8,
          data: "XQYAAA==",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_CHIRPSTACK_TOKEN}`,
        },
      }
    );
    if (res?.status) {
      PagesIndex.toasterSuccess("Robot stopping in progress");
      handleDisabledButtonAction(buttonKey);
    } else {
      PagesIndex.toasterError(res?.message);
    }
  };

  const handleHomeButton = async (devEui, buttonKey) => {
    const res = await axios.post(
      `${import.meta.env.VITE_CHIRPSTACK_BASE_URL}/${
        PagesIndex.Api.SEND_COMMANDS
      }/${devEui}/queue`,
      {
        queueItem: {
          confirmed: true,
          fPort: 8,
          data: "XgMBAAA=",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_CHIRPSTACK_TOKEN}`,
        },
      }
    );
    if (res?.status) {
      PagesIndex.toasterSuccess("Robot moving to home position in progress");
      handleDisabledButtonAction(buttonKey);
    } else {
      PagesIndex.toasterError(res?.message);
    }
  };
  const handleForward = async (devEui, buttonKey) => {
    const res = await axios.post(
      `${import.meta.env.VITE_CHIRPSTACK_BASE_URL}/${
        PagesIndex.Api.SEND_COMMANDS
      }/${devEui}/queue`,
      {
        queueItem: {
          confirmed: true,
          fPort: 8,
          data: "XAMBAQE=",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_CHIRPSTACK_TOKEN}`,
        },
      }
    );
    if (res?.status) {
      PagesIndex.toasterSuccess("Robot moving forward in progress");
      handleDisabledButtonAction(buttonKey);
    } else {
      PagesIndex.toasterError(res?.message);
    }
  };
  const handleBackward = async (devEui, buttonKey) => {
    const res = await axios.post(
      `${import.meta.env.VITE_CHIRPSTACK_BASE_URL}/${
        PagesIndex.Api.SEND_COMMANDS
      }/${devEui}/queue`,
      {
        queueItem: {
          confirmed: true,
          fPort: 8,
          data: "XAMBAgI=",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_CHIRPSTACK_TOKEN}`,
        },
      }
    );
    if (res?.status) {
      apiData(devEui);
      PagesIndex.toasterSuccess("Robot moving backward in progress");
      handleDisabledButtonAction(buttonKey);
    } else {
      PagesIndex.toasterError(res?.message);
    }
  };
  const apiData = async (devEui) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_LOCAL_BASE_URL}/${
          PagesIndex.Api.GET_MQTT_DATA
        }/${devEui}`
      );
      if (res?.status) {
        setDeviceData(res?.data?.data);
        setCubeRotation({
          x: res?.data?.data?.object.imu.gyro_x
            ? (res?.data?.data?.object.imu.gyro_x / 16.4).toFixed(2)
            : 0,
          y: res?.data?.data?.object.imu.gyro_y
            ? (res?.data?.data?.object.imu.gyro_y / 16.4).toFixed(2)
            : 0,
          z: res?.data?.data?.object.imu.gyro_z
            ? (res?.data?.data?.object.imu.gyro_z / 16.4).toFixed(2)
            : 0,
        });
      } else {
        PagesIndex.toasterError(res?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getHistoricalList = useCallback(
    async (devEui) => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_LOCAL_BASE_URL}/${
            PagesIndex.Api.GET_MQTT_DATA
          }/${devEui}/${PagesIndex.Api.GET_HISTORICAL_DATA}`,
          {
            params: {
              limit: 10,
              offset: historicalCurrentPage,
              applicationId: "cbffb1de-fbae-44d8-9b39-fe4ec4489e87",
            },
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_CHIRPSTACK_TOKEN}`,
            },
          }
        );

        if (res?.status) {
          setHistoricalData(res.data?.data?.data);
          setTotalHistoricalCount(res?.data?.data?.pagination?.totalCount);
          // setHistoricalCurrentPage(res?.data?.data?.pagination?.currentPage)
        } else {
          PagesIndex.toasterError(res?.message);
        }
      } catch (error) {
        console.log(error);
      }
    },
    [historicalCurrentPage]
  );
  useEffect(() => {
    setDisabledButtons(false);
    if (typeof commandStatus === "boolean" && commandStatus) {
      PagesIndex.toasterSuccess("Command executed succesfully");
      setCommandStatus(undefined);
    } else if (typeof commandStatus === "boolean" && !commandStatus) {
      PagesIndex.toasterError("Command execution failed");
      setCommandStatus(undefined);
    }
  }, [commandStatus]);
  useEffect(() => {
    apiData(devEui);
    const brokerUrl = import.meta.env.VITE_MQTT_URL;

    const options = {
      username: import.meta.env.VITE_MQTT_USERNAME,
      password: import.meta.env.VITE_MQTT_PASSWORD,
      clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
      clean: false,
    };

    const mqttClient = mqtt.connect(brokerUrl, options);

    // Debugging logs
    mqttClient.on("connect", () => {
      apiData(devEui);
      console.log("Connected to ChirpStack MQTT broker");
      mqttClient.subscribe(
        `application/${appId}/device/${devEui}/event/up`,
        (err, data) => {
          if (!err) {
            console.log("Subscribed to uplink events", data?.[0]?.topic);
          } else {
            apiData(devEui);
            getHistoricalList(devEui);
            console.error("Error subscribing to topic:", err);
          }
        }
      );
    });

    mqttClient.on("error", (err) => {
      apiData(devEui);
      getHistoricalList(devEui);
      console.error("MQTT connection error:", err); // This will capture any errors during connection
    });

    mqttClient.on("message", (topic, payload) => {
      console.log(`Received message on topic ${topic}:`, JSON.parse(payload));
      setCommandStatus(
        JSON.parse(payload)?.object?.command_status === 0
          ? true
          : JSON.parse(payload)?.object?.command_status === 1
          ? false
          : ""
      );
      let message = JSON.parse(payload.toString());
      getHistoricalList(devEui);
      if (message?.object?.system_status == 160) {
        setDeviceData(message);
        setCubeRotation({
          x:
            Number(
              JSON.parse(payload.toString())?.object?.imu?.gyro_x / 16.4
            ).toFixed(2) ?? 0,
          y:
            Number(
              JSON.parse(payload.toString())?.object?.imu?.gyro_y / 16.4
            ).toFixed(2) ?? 0,
          z:
            Number(
              JSON.parse(payload.toString())?.object?.imu?.gyro_z / 16.4
            ).toFixed(2) ?? 0,
        });
      }
    });

    mqttClient.on("reconnect", () => {
      getHistoricalList(devEui);
      console.log("Reconnecting to ChirpStack MQTT broker...");
    });

    mqttClient.on("close", () => {
      console.log("MQTT connection closed");
    });

    mqttClient.on("offline", function () {
      console.log("offline");
    });

    // Store client in state
    setClient(mqttClient);

    // Cleanup when the component unmounts
    return () => {
      mqttClient.end();
      console.log("Disconnected from ChirpStack MQTT broker");
    };
  }, []);
  useEffect(() => {
    getHistoricalList(devEui);
  }, [getHistoricalList]);
  const containerRef = useRef(null);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const cubeRef = useRef(null);

  useEffect(() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    // if (gl) {
    // Initialize 3D scene only once when the component mounts
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.offsetWidth / containerRef.current.offsetHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.offsetWidth - 30,
      containerRef.current.offsetHeight
    );
    containerRef.current.appendChild(renderer.domElement);

    // Create a geometry and materials
    const geometry = new THREE.BoxGeometry(5, 1, 4);
    const cubeMaterials = [
      new THREE.MeshBasicMaterial({ color: 0x03045e }), // Front
      new THREE.MeshBasicMaterial({ color: 0x023e8a }), // Back
      new THREE.MeshBasicMaterial({ color: 0x0077b6 }), // Top
      new THREE.MeshBasicMaterial({ color: 0x03045e }), // Bottom
      new THREE.MeshBasicMaterial({ color: 0x023e8a }), // Left
      new THREE.MeshBasicMaterial({ color: 0x0077b6 }), // Right
    ];

    // Apply materials directly to the cube
    const cube = new THREE.Mesh(geometry, cubeMaterials);
    scene.add(cube);

    // Store objects in refs
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    cubeRef.current = cube;

    // Animation loop to render scene continuously
    const animate = () => {
      requestAnimationFrame(animate);

      renderer.render(scene, camera);
    };

    animate();
    // }else{
    //   console.log("WebGL2 is not supported");
    // }
    // Clean up on component unmount
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      geometry.dispose();
      cubeMaterials.forEach((material) => material.dispose());
    };
  }, []);

  useEffect(() => {
    if (cubeRef.current) {
      cubeRef.current.rotation.x = cubeRotation.x;
      cubeRef.current.rotation.y = cubeRotation.y;
      cubeRef.current.rotation.z = cubeRotation.z;
    }
  }, [cubeRotation]);

  // check the Robot device is active or inActive
  const isRobotActive = (lastSeenAt) => {
    const lastSeenDate = new Date(lastSeenAt);
    const currentDate = new Date();
    // Calculate the difference in milliseconds
    const diffMs = currentDate - lastSeenDate;

    // Define the threshold (5 minutes and 20 seconds in milliseconds)
    const thresholdMs = (720 * 60 + 100) * 1000;

    return diffMs <= thresholdMs ? (
      <span className={"class-online status"}>Online</span>
    ) : (
      <span className={"class-offline status"}>Offline</span>
    );
  };
  const tabs = ["Display parameters", "Control instruction"];
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
            // className="admin-page-title"
            component="h2"
            // variant="h2"
          >
            {isRobotActive(deviceData?.time)}
          </Index.Typography>
        </Index.Box>
        <Index.Box className="common-card" sx={{ marginBottom: "20px" }}>
          <DetailsField label={"Name"} text={""} />
          <Index.Box
            sx={{ display: "flex", flexWrap: "wrap" }}
            className="details-flex-fields-container"
          >
            <DetailsField label={"Robot ID"} text={""} />
            <DetailsField label={"Configure Distance"} text={""} />
            <DetailsField label={"Hardware Version"} text={""} />
            <DetailsField label={"Firmware Version"} text={""} />
            <DetailsField label={"Run Status"} text={""} />
            <DetailsField label={"Fault Status"} text={""} />
          </Index.Box>
        </Index.Box>
        <TabLayout tabs={tabs}>
          {/* ---- Display Parameters ---- */}
          <Index.Box>
            <Index.Box className="robot-progress-bar-content">
              <Index.Typography className="progress-lable">
                Distance Travelled
              </Index.Typography>
              <Index.Box className="admin-progress-bar-main">
                <BorderLinearProgress
                  variant="determinate"
                  value={50}
                  className="admin-progress-bar"
                />
              </Index.Box>
              <span className="admin-progress-bar-text">50%</span>
            </Index.Box>
            <Index.Box
              sx={{ display: "flex", flexWrap: "wrap" }}
              className="details-flex-fields-container"
            >
              <DetailsField
                label={"Total Distance Travelled"}
                text={deviceData?.object?.robot?.distance_traveled || 0}
              />
              <DetailsField
                label={"Total Cycle Travelled (direction)"}
                text={deviceData?.object?.robot?.direction || 0}
              />
              <DetailsField
                label={"Distance Travelled Per Cycle (speed)"}
                text={deviceData?.object?.robot?.speed || 0}
              />
            </Index.Box>
          </Index.Box>
          {/* ---- Control Instruction ---- */}
          <p>child 2</p>
        </TabLayout>
        {/* <Index.Box className="common-card">
          <Index.Box className="robot-progress-bar-content">
            <Index.Typography className="progress-lable">
              Distance Travelled
            </Index.Typography>
            <Index.Box className="admin-progress-bar-main">
              <BorderLinearProgress
                variant="determinate"
                value={50}
                className="admin-progress-bar"
              />
              <span className="admin-progress-bar-text">50%</span>
            </Index.Box>
          </Index.Box>
          <Index.Box className="admin-dash-card-row">
            <Index.Box className="grid-column">
              <Index.Box className="admin-dashboard-box common-card">
                <Index.Box className="admin-dashboard-inner-box">
                  <Index.Box className="admin-dash-left">
                    <Index.Typography className="admin-dash-text" component="p">
                      Total Distance Travelled
                    </Index.Typography>
                    <Index.Typography
                      className="admin-dash-price"
                      variant="h1"
                      component="h1"
                    >
                      {deviceData?.object?.robot?.distance_traveled || 0}
                    </Index.Typography>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Box>
            <Index.Box className="grid-column">
              <Index.Box className="admin-dashboard-box common-card">
                <Index.Box className="admin-dashboard-inner-box">
                  <Index.Box className="admin-dash-left">
                    <Index.Typography className="admin-dash-text" component="p">
                      Total Cycle Travelled (direction)
                    </Index.Typography>
                    <Index.Typography
                      className="admin-dash-price"
                      variant="h1"
                      component="h1"
                    >
                      {deviceData?.object?.robot?.direction || 0}
                    </Index.Typography>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Box>
            <Index.Box className="grid-column">
              <Index.Box className="admin-dashboard-box common-card">
                <Index.Box className="admin-dashboard-inner-box">
                  <Index.Box className="admin-dash-left">
                    <Index.Typography className="admin-dash-text" component="p">
                      Distance Travelled Per Cycle (speed)
                    </Index.Typography>
                    <Index.Typography
                      className="admin-dash-price"
                      variant="h1"
                      component="h1"
                    >
                      {deviceData?.object?.robot?.speed || 0}
                    </Index.Typography>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box> */}

        <Index.Box className="common-card round-btn-card">
          <Index.Box sx={{ width: 1 }} className="grid-main">
            <Index.Box
              display="grid"
              gridTemplateColumns="repeat(12, 1fr)"
              gap={{ xs: 2, sm: 2, md: 2, lg: 2 }}
            >
              <Index.Box
                gridColumn={{
                  xs: "span 12",
                  sm: "span 1",
                  md: "span 1",
                  lg: "span 1",
                }}
                className="grid-column"
              >
                <div className="round-btn-content-card">
                  <Index.Box className="admin-sub-title-main">
                    <Index.Typography className="admin-sub-title">
                      Clean
                    </Index.Typography>
                  </Index.Box>
                  <Index.Box className="round-btn-content-flex">
                    <Index.Box className="round-button-main">
                      <Index.Button
                        className="round-button"
                        onClick={() => handlePowerStart(devEui, "powerOn")}
                        // disabled={disabledButtons["powerOn"]}
                        disabled={disabledButtons}
                      >
                        <img
                          src={PagesIndex.Svg.powerButton}
                          className="round-btn-icons"
                          alt="add icon"
                        />
                      </Index.Button>
                    </Index.Box>
                  </Index.Box>
                </div>
              </Index.Box>

              <Index.Box
                gridColumn={{
                  xs: "span 12",
                  sm: "span 4",
                  md: "span 4",
                  lg: "span 4",
                }}
                className="grid-column"
              >
                <div className="round-btn-content-card">
                  <Index.Box className="admin-sub-title-main">
                    <Index.Typography className="admin-sub-title">
                      Main Command
                    </Index.Typography>
                  </Index.Box>
                  <Index.Box className="round-btn-content-flex">
                    <Index.Box className="round-btn-flex">
                      <Index.Box className="round-button-main">
                        <Index.Button
                          className="round-button"
                          onClick={() =>
                            handleForward(devEui, "mainCommandForwardBtn")
                          }
                          // disabled={disabledButtons["mainCommandForwardBtn"]}
                          disabled={disabledButtons}
                        >
                          <img
                            src={PagesIndex.Svg.left}
                            className="round-btn-icons"
                            alt="add icon"
                          />
                        </Index.Button>
                      </Index.Box>
                      <Index.Box className="round-button-main">
                        <Index.Button
                          className="round-button"
                          onClick={() =>
                            handlePowerStop(devEui, "mainCommandPowerStopBtn")
                          }
                          // disabled={disabledButtons["mainCommandPowerStopBtn"]}
                          disabled={disabledButtons}
                        >
                          <img
                            src={PagesIndex.Svg.powerButton2}
                            className="round-btn-icons"
                            alt="add icon"
                          />
                        </Index.Button>
                      </Index.Box>
                      <Index.Box className="round-button-main">
                        <Index.Button
                          className="round-button"
                          onClick={() =>
                            handleBackward(devEui, "mainCommandBackwardBtn")
                          }
                          // disabled={disabledButtons["mainCommandBackwardBtn"]}
                          disabled={disabledButtons}
                        >
                          <img
                            src={PagesIndex.Svg.right}
                            className="round-btn-icons"
                            alt="add icon"
                          />
                        </Index.Button>
                      </Index.Box>
                      <Index.Box className="round-button-main">
                        <Index.Button
                          className="round-button"
                          onClick={() =>
                            handleHomeButton(devEui, "mainCommandHomeBtn")
                          }
                          // disabled={disabledButtons["mainCommandHomeBtn"]}
                          disabled={disabledButtons}
                        >
                          <img
                            src={PagesIndex.Svg.home}
                            className="round-btn-icons"
                            alt="add icon"
                          />
                        </Index.Button>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                </div>
              </Index.Box>
              <Index.Box
                gridColumn={{
                  xs: "span 12",
                  sm: "span 3",
                  md: "span 3",
                  lg: "span 3",
                }}
                className="grid-column"
              >
                <div className="round-btn-content-card">
                  <Index.Box className="admin-sub-title-main">
                    <Index.Typography className="admin-sub-title">
                      Speed
                    </Index.Typography>
                  </Index.Box>
                  <Index.Box className="round-btn-content-flex">
                    <Index.Box className="round-plus-minus-flex">
                      <Index.Button
                        className="round-plus-minus-btn round-plus-btn"
                        disabled={disabledButtons}
                      >
                        <img
                          src={PagesIndex.Svg.plus}
                          className="round-plus-minus-icons"
                          alt="add icon"
                        />
                      </Index.Button>
                      <Index.Box className="round-plus-minus-box">
                        <Index.Typography className="round-plus-minus-text">
                          {deviceData?.object?.robot?.speed || 0}
                        </Index.Typography>
                      </Index.Box>
                      <Index.Button
                        className="round-plus-minus-btn round-plus-btn"
                        disabled={disabledButtons}
                      >
                        <img
                          src={PagesIndex.Svg.minus}
                          className="round-plus-minus-icons"
                          alt="add icon"
                        />
                      </Index.Button>
                    </Index.Box>
                  </Index.Box>
                </div>
              </Index.Box>
              <Index.Box
                gridColumn={{
                  xs: "span 12",
                  sm: "span 4",
                  md: "span 4",
                  lg: "span 4",
                }}
                className="grid-column"
              >
                <div
                  className="round-btn-content-card"
                  ref={containerRef}
                ></div>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
        <Index.Box className="common-card bat-card round-btn-card">
          <Index.Box sx={{ width: 1 }} className="grid-main">
            <Index.Box className="admin-sub-title-main">
              <Index.Typography className="sub-title-battery">
                Battery
              </Index.Typography>
            </Index.Box>
            <Index.Box
              display="grid"
              gridTemplateColumns="repeat(12, 1fr)"
              gap={{ xs: 2, sm: 2, md: 2, lg: 2 }}
            >
              <Index.Box
                gridColumn={{
                  xs: "span 12",
                  sm: "span 4",
                  md: "span 4",
                  lg: "span 4",
                }}
                className="grid-column"
              >
                <Index.Box className="bat-card-main">
                  <Index.Box className="bat-card-title-main">
                    <Index.Typography className="bat-card-title">
                      Secondary
                    </Index.Typography>
                  </Index.Box>
                  <Index.Box className="bat-card-flex">
                    <Index.Box className="bat-card-box">
                      <div style={{ width: 70, height: 70 }}>
                        <CircularProgressbar
                          value={deviceData?.object?.aux_battery?.level || 0}
                          text={`${
                            deviceData?.object?.aux_battery?.level || 0
                          }%`}
                        />
                      </div>
                    </Index.Box>
                    <Index.Box className="bat-card-box">
                      <Index.Box className="bat-card-box-flex">
                        <Index.Box className="bat-card-value-main">
                          <Index.Typography className="bat-card-value-text">
                            Temp.
                          </Index.Typography>
                          <Index.Box className="bat-card-value-box">
                            <Index.Typography className="bat-card-value-text">
                              {deviceData?.object?.aux_battery?.temp / 10 || 0}
                            </Index.Typography>
                          </Index.Box>
                        </Index.Box>
                        <Index.Box className="bat-card-value-main">
                          <Index.Typography className="bat-card-value-text">
                            Current
                          </Index.Typography>
                          <Index.Box className="bat-card-value-box">
                            <Index.Typography className="bat-card-value-text">
                              {deviceData?.object?.aux_battery?.current /
                                1000 || 0}
                            </Index.Typography>
                          </Index.Box>
                        </Index.Box>
                        <Index.Box className="bat-card-value-main">
                          <Index.Typography className="bat-card-value-text">
                            Voltage
                          </Index.Typography>
                          <Index.Box className="bat-card-value-box">
                            <Index.Typography className="bat-card-value-text">
                              {deviceData?.object?.aux_battery?.voltage /
                                1000 || 0}
                            </Index.Typography>
                          </Index.Box>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
              <Index.Box
                gridColumn={{
                  xs: "span 12",
                  sm: "span 4",
                  md: "span 4",
                  lg: "span 4",
                }}
                className="grid-column"
              >
                <Index.Box className="bat-card-main">
                  <Index.Box className="bat-card-title-main">
                    <Index.Typography className="bat-card-title">
                      Main
                    </Index.Typography>
                  </Index.Box>
                  <Index.Box className="bat-card-flex">
                    <Index.Box className="bat-card-box">
                      <div style={{ width: 70, height: 70 }}>
                        <CircularProgressbar
                          value={deviceData?.object?.main_battery?.level || 0}
                          text={`${
                            deviceData?.object?.main_battery?.level || 0
                          }%`}
                        />
                      </div>
                    </Index.Box>
                    <Index.Box className="bat-card-box">
                      <Index.Box className="bat-card-box-flex">
                        <Index.Box className="bat-card-value-main">
                          <Index.Typography className="bat-card-value-text">
                            Temp.
                          </Index.Typography>
                          <Index.Box className="bat-card-value-box">
                            <Index.Typography className="bat-card-value-text">
                              {deviceData?.object?.main_battery?.temp / 10 || 0}
                            </Index.Typography>
                          </Index.Box>
                        </Index.Box>
                        <Index.Box className="bat-card-value-main">
                          <Index.Typography className="bat-card-value-text">
                            Current
                          </Index.Typography>
                          <Index.Box className="bat-card-value-box">
                            <Index.Typography className="bat-card-value-text">
                              {deviceData?.object?.main_battery?.current /
                                1000 || 0}
                            </Index.Typography>
                          </Index.Box>
                        </Index.Box>
                        <Index.Box className="bat-card-value-main">
                          <Index.Typography className="bat-card-value-text">
                            Voltage
                          </Index.Typography>
                          <Index.Box className="bat-card-value-box">
                            <Index.Typography className="bat-card-value-text">
                              {deviceData?.object?.main_battery?.voltage /
                                1000 || 0}
                            </Index.Typography>
                          </Index.Box>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Box>

              <Index.Box
                gridColumn={{
                  xs: "span 12",
                  sm: "span 4",
                  md: "span 4",
                  lg: "span 4",
                }}
                className="grid-column"
              ></Index.Box>

              <Index.Box
                gridColumn={{
                  xs: "span 12",
                  sm: "span 4",
                  md: "span 4",
                  lg: "span 4",
                }}
                className="grid-column"
              ></Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
        <Index.Box className="common-card bat-card round-btn-card">
          <Index.Box sx={{ width: 1 }} className="grid-main">
            <Index.Box className="admin-sub-title-main">
              <Index.Typography className="sub-title-battery">
                Motors
              </Index.Typography>
            </Index.Box>
            <Index.Box
              display="grid"
              gridTemplateColumns="repeat(12, 1fr)"
              gap={{ xs: 2, sm: 2, md: 2, lg: 2 }}
            >
              <Index.Box
                gridColumn={{
                  xs: "span 12",
                  sm: "span 4",
                  md: "span 4",
                  lg: "span 4",
                }}
                className="grid-column"
              >
                <Index.Box className="bat-card-main">
                  <Index.Box className="bat-card-title-main">
                    <Index.Typography className="bat-card-title">
                      Brush
                    </Index.Typography>
                  </Index.Box>
                  <Index.Box className="round-btn-flex m1-round-btn-flex">
                    <Index.Box className="round-button-main">
                      <Index.Button
                        className="round-button"
                        onClick={() =>
                          handleForward(devEui, "motorsForwardBtn")
                        }
                        // disabled={disabledButtons["motorsForwardBtn"]}
                        disabled={disabledButtons}
                      >
                        <img
                          src={PagesIndex.Svg.anticlockwise}
                          className="round-btn-icons"
                          alt="add icon"
                        />
                      </Index.Button>
                    </Index.Box>
                    <Index.Box className="round-button-main">
                      <Index.Button
                        className="round-button"
                        onClick={() =>
                          handlePowerStop(devEui, "motorsPowerStopBtn")
                        }
                        // disabled={disabledButtons["motorsPowerStopBtn"]}
                        disabled={disabledButtons}
                      >
                        <img
                          src={PagesIndex.Svg.powerButton2}
                          className="round-btn-icons"
                          alt="add icon"
                        />
                      </Index.Button>
                    </Index.Box>
                    <Index.Box className="round-button-main">
                      <Index.Button
                        className="round-button"
                        onClick={() =>
                          handleBackward(devEui, "motorsBackwardBtn")
                        }
                        // disabled={disabledButtons["motorsBackwardBtn"]}
                        disabled={disabledButtons}
                      >
                        <img
                          src={PagesIndex.Svg.clockwise}
                          className="round-btn-icons"
                          alt="add icon"
                        />
                      </Index.Button>
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="bat-card-flex">
                    <Index.Box className="round-btn-content-flex">
                      <Index.Box className="round-plus-minus-flex">
                        <Index.Button
                          className="round-plus-minus-btn round-plus-btn"
                          disabled={disabledButtons}
                        >
                          <img
                            src={PagesIndex.Svg.plus}
                            className="round-plus-minus-icons"
                            alt="add icon"
                          />
                        </Index.Button>
                        <Index.Box className="round-plus-minus-box">
                          <Index.Typography className="round-plus-minus-text">
                            {deviceData?.object?.motor1?.speed || 0}
                          </Index.Typography>
                        </Index.Box>
                        <Index.Button
                          className="round-plus-minus-btn round-plus-btn"
                          disabled={disabledButtons}
                        >
                          <img
                            src={PagesIndex.Svg.minus}
                            className="round-plus-minus-icons"
                            alt="add icon"
                          />
                        </Index.Button>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="bat-card-box">
                    <Index.Box className="bat-card-box-flex mo-card">
                      <Index.Box className="bat-card-value-main">
                        <Index.Typography className="bat-card-value-text">
                          Voltage
                        </Index.Typography>
                        <Index.Box className="bat-card-value-box">
                          <Index.Typography className="bat-card-value-text">
                            {deviceData?.object?.motor1?.voltage / 1000 || 0}
                          </Index.Typography>
                        </Index.Box>
                      </Index.Box>
                      <Index.Box className="bat-card-value-main">
                        <Index.Typography className="bat-card-value-text">
                          Current
                        </Index.Typography>
                        <Index.Box className="bat-card-value-box">
                          <Index.Typography className="bat-card-value-text">
                            {deviceData?.object?.motor1?.current / 1000 || 0}
                          </Index.Typography>
                        </Index.Box>
                      </Index.Box>
                      <Index.Box className="bat-card-value-main">
                        <Index.Typography className="bat-card-value-text">
                          Temp.
                        </Index.Typography>
                        <Index.Box className="bat-card-value-box">
                          <Index.Typography className="bat-card-value-text">
                            {deviceData?.object?.motor1?.temp / 10 || 0}
                          </Index.Typography>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
              <Index.Box
                gridColumn={{
                  xs: "span 12",
                  sm: "span 4",
                  md: "span 4",
                  lg: "span 4",
                }}
                className="grid-column"
              >
                <Index.Box className="bat-card-main">
                  <Index.Box className="bat-card-title-main">
                    <Index.Typography className="bat-card-title">
                      Left
                    </Index.Typography>
                  </Index.Box>
                  <Index.Box className="round-btn-flex m1-round-btn-flex">
                    <Index.Box className="round-button-main">
                      <Index.Button
                        className="round-button"
                        onClick={() => handleForward(devEui, "leftForwardBtn")}
                        // disabled={disabledButtons["leftForwardBtn"]}
                        disabled={disabledButtons}
                      >
                        <img
                          src={PagesIndex.Svg.anticlockwise}
                          className="round-btn-icons"
                          alt="add icon"
                        />
                      </Index.Button>
                    </Index.Box>
                    <Index.Box className="round-button-main">
                      <Index.Button
                        className="round-button"
                        onClick={() =>
                          handlePowerStop(devEui, "leftPowerStopBtn")
                        }
                        // disabled={disabledButtons["leftPowerStopBtn"]}
                        disabled={disabledButtons}
                      >
                        <img
                          src={PagesIndex.Svg.powerButton2}
                          className="round-btn-icons"
                          alt="add icon"
                        />
                      </Index.Button>
                    </Index.Box>
                    <Index.Box className="round-button-main">
                      <Index.Button
                        className="round-button"
                        onClick={() =>
                          handleBackward(devEui, "leftBackwardBtn")
                        }
                        // disabled={disabledButtons["leftBackwardBtn"]}
                        disabled={disabledButtons}
                      >
                        <img
                          src={PagesIndex.Svg.clockwise}
                          className="round-btn-icons"
                          alt="add icon"
                        />
                      </Index.Button>
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="bat-card-flex">
                    <Index.Box className="round-btn-content-flex">
                      <Index.Box className="round-plus-minus-flex">
                        <Index.Button
                          className="round-plus-minus-btn round-plus-btn"
                          disabled={disabledButtons}
                        >
                          <img
                            src={PagesIndex.Svg.plus}
                            className="round-plus-minus-icons"
                            alt="add icon"
                          />
                        </Index.Button>
                        <Index.Box className="round-plus-minus-box">
                          <Index.Typography className="round-plus-minus-text">
                            {deviceData?.object?.motor2?.speed || 0}
                          </Index.Typography>
                        </Index.Box>
                        <Index.Button
                          className="round-plus-minus-btn round-plus-btn"
                          disabled={disabledButtons}
                        >
                          <img
                            src={PagesIndex.Svg.minus}
                            className="round-plus-minus-icons"
                            alt="add icon"
                          />
                        </Index.Button>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="bat-card-box">
                    <Index.Box className="bat-card-box-flex mo-card">
                      <Index.Box className="bat-card-value-main">
                        <Index.Typography className="bat-card-value-text">
                          Voltage
                        </Index.Typography>
                        <Index.Box className="bat-card-value-box">
                          <Index.Typography className="bat-card-value-text">
                            {deviceData?.object?.motor2?.voltage / 1000 || 0}
                          </Index.Typography>
                        </Index.Box>
                      </Index.Box>
                      <Index.Box className="bat-card-value-main">
                        <Index.Typography className="bat-card-value-text">
                          Current
                        </Index.Typography>
                        <Index.Box className="bat-card-value-box">
                          <Index.Typography className="bat-card-value-text">
                            {deviceData?.object?.motor2?.current / 1000 || 0}
                          </Index.Typography>
                        </Index.Box>
                      </Index.Box>
                      <Index.Box className="bat-card-value-main">
                        <Index.Typography className="bat-card-value-text">
                          Temp.
                        </Index.Typography>
                        <Index.Box className="bat-card-value-box">
                          <Index.Typography className="bat-card-value-text">
                            {deviceData?.object?.motor2?.temp / 10 || 0}
                          </Index.Typography>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
              <Index.Box
                gridColumn={{
                  xs: "span 12",
                  sm: "span 4",
                  md: "span 4",
                  lg: "span 4",
                }}
                className="grid-column"
              >
                <Index.Box className="bat-card-main">
                  <Index.Box className="bat-card-title-main">
                    <Index.Typography className="bat-card-title">
                      Right
                    </Index.Typography>
                  </Index.Box>
                  <Index.Box className="round-btn-flex m1-round-btn-flex">
                    <Index.Box className="round-button-main">
                      <Index.Button
                        className="round-button"
                        onClick={() => handleForward(devEui, "rightForwardBtn")}
                        // disabled={disabledButtons["rightForwardBtn"]}
                        disabled={disabledButtons}
                      >
                        <img
                          src={PagesIndex.Svg.anticlockwise}
                          className="round-btn-icons"
                          alt="add icon"
                        />
                      </Index.Button>
                    </Index.Box>
                    <Index.Box className="round-button-main">
                      <Index.Button
                        className="round-button"
                        onClick={() =>
                          handlePowerStop(devEui, "rightPowerStopBtn")
                        }
                        // disabled={disabledButtons["rightPowerStopBtn"]}
                        disabled={disabledButtons}
                      >
                        <img
                          src={PagesIndex.Svg.powerButton2}
                          className="round-btn-icons"
                          alt="add icon"
                        />
                      </Index.Button>
                    </Index.Box>
                    <Index.Box className="round-button-main">
                      <Index.Button
                        className="round-button"
                        onClick={() =>
                          handleBackward(devEui, "rightBackwardBtn")
                        }
                        // disabled={disabledButtons["rightBackwardBtn"]}
                        disabled={disabledButtons}
                      >
                        <img
                          src={PagesIndex.Svg.clockwise}
                          className="round-btn-icons"
                          alt="add icon"
                        />
                      </Index.Button>
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="bat-card-flex">
                    <Index.Box className="round-btn-content-flex">
                      <Index.Box className="round-plus-minus-flex">
                        <Index.Button
                          className="round-plus-minus-btn round-plus-btn"
                          disabled={disabledButtons}
                        >
                          <img
                            src={PagesIndex.Svg.plus}
                            className="round-plus-minus-icons"
                            alt="add icon"
                          />
                        </Index.Button>
                        <Index.Box className="round-plus-minus-box">
                          <Index.Typography className="round-plus-minus-text">
                            {deviceData?.object?.motor3?.speed || 0}
                          </Index.Typography>
                        </Index.Box>
                        <Index.Button
                          className="round-plus-minus-btn round-plus-btn"
                          disabled={disabledButtons}
                        >
                          <img
                            src={PagesIndex.Svg.minus}
                            className="round-plus-minus-icons"
                            alt="add icon"
                          />
                        </Index.Button>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="bat-card-box">
                    <Index.Box className="bat-card-box-flex mo-card">
                      <Index.Box className="bat-card-value-main">
                        <Index.Typography className="bat-card-value-text">
                          Voltage
                        </Index.Typography>
                        <Index.Box className="bat-card-value-box">
                          <Index.Typography className="bat-card-value-text">
                            {deviceData?.object?.motor3?.voltage / 1000 || 0}
                          </Index.Typography>
                        </Index.Box>
                      </Index.Box>
                      <Index.Box className="bat-card-value-main">
                        <Index.Typography className="bat-card-value-text">
                          Current
                        </Index.Typography>
                        <Index.Box className="bat-card-value-box">
                          <Index.Typography className="bat-card-value-text">
                            {deviceData?.object?.motor3?.current / 1000 || 0}
                          </Index.Typography>
                        </Index.Box>
                      </Index.Box>
                      <Index.Box className="bat-card-value-main">
                        <Index.Typography className="bat-card-value-text">
                          Temp.
                        </Index.Typography>
                        <Index.Box className="bat-card-value-box">
                          <Index.Typography className="bat-card-value-text">
                            {deviceData?.object?.motor3?.temp / 10 || 0}
                          </Index.Typography>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
              <Index.Box
                gridColumn={{
                  xs: "span 12",
                  sm: "span 4",
                  md: "span 4",
                  lg: "span 4",
                }}
                className="grid-column"
              ></Index.Box>

              <Index.Box
                gridColumn={{
                  xs: "span 12",
                  sm: "span 4",
                  md: "span 4",
                  lg: "span 4",
                }}
                className="grid-column"
              ></Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
        <Index.Box className="common-card bat-card">
          <Index.Box className="admin-sub-title-main">
            <Index.Typography className="admin-sub-title">
              Alarm List
            </Index.Typography>
          </Index.Box>
          <DataTable
            headerData={[
              { field: "Alarm code" },
              { field: "Description" },
              { field: "Trigger Date" },
            ]}
            filterData={filterData.length}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          >
            {filterData
              ?.slice((currentPage - 1) * 10, (currentPage - 1) * 10 + 10)
              ?.map((data) => {
                return (
                  <Index.TableRow
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                    key={data?._id}
                  >
                    <Index.TableCell
                      component="td"
                      variant="td"
                      scope="row"
                      className="table-td"
                    >
                      <Index.Box className="admin-table-data-flex">
                        <Index.Typography className="admin-table-data-text">
                          {data?.name}
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
                          {data?.email}
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
                          {data?.role?.name}
                        </Index.Typography>
                      </Index.Box>
                    </Index.TableCell>
                  </Index.TableRow>
                );
              })}
          </DataTable>
        </Index.Box>
        <Index.Box className="common-card bat-card">
          <Index.Box className="admin-sub-title-main">
            <Index.Typography className="admin-sub-title">
              Historical Data
            </Index.Typography>
          </Index.Box>
          <DataTable
            headerData={[
              { field: "Time" },
              { field: "Motor (Brush)", colSpan: 4 },
              { field: "Motor (Left)", colSpan: 4 },
              { field: "Motor (Right)", colSpan: 4 },
              { field: "Battery (AUX)", colSpan: 4 },
              { field: "Battery (Main)", colSpan: 4 },
              { field: "IMU Sensor", colSpan: 3 },
            ]}
            subHeaderData={[
              { field: "" },
              { field: "Temp" },
              { field: "Current" },
              { field: "Voltage" },
              { field: "Speed" },
              { field: "Temp" },
              { field: "Current" },
              { field: "Voltage" },
              { field: "Speed" },
              { field: "Temp" },
              { field: "Current" },
              { field: "Voltage" },
              { field: "Speed" },
              { field: "Temp" },
              { field: "Current" },
              { field: "Voltage" },
              { field: "Level" },
              { field: "Temp" },
              { field: "Current" },
              { field: "Voltage" },
              { field: "Level" },
              { field: "X" },
              { field: "Y" },
              { field: "Z" },
            ]}
            filterData={totalHistoricalCount}
            currentPage={historicalCurrentPage}
            setCurrentPage={setHistoricalCurrentPage}
          >
            {historicalData?.map((data) => {
              const { motor1, motor2, motor3, aux_battery, main_battery, imu } =
                data?.object;
              return (
                <Index.TableRow
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                  key={data?._id}
                >
                  <Index.TableCell
                    component="td"
                    variant="td"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {PagesIndex.moment(data?.time)?.format(
                          "DD/MM/YYYY HH:mm:ss A"
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
                        {motor1?.temp / 10}
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
                        {motor1?.current / 1000}
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
                        {motor1?.voltage / 1000}
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
                        {motor1?.speed}
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
                        {motor2?.temp / 10}
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
                        {motor2?.current / 1000}
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
                        {motor2?.voltage / 1000}
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
                        {motor2?.speed}
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
                        {motor3?.temp / 10}
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
                        {motor3?.current / 1000}
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
                        {motor3?.voltage / 1000}
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
                        {motor3?.speed}
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
                        {aux_battery?.temp / 10}
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
                        {aux_battery?.current / 1000}
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
                        {aux_battery?.voltage / 1000}
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
                        {aux_battery?.level}
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
                        {main_battery?.temp / 10}
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
                        {main_battery?.current / 1000}
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
                        {main_battery?.voltage / 1000}
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
                  <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {(imu?.gyro_x / 16.4).toFixed(2)}
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
                        {(imu?.gyro_y / 16.4).toFixed(2)}
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
                        {(imu?.gyro_z / 16.4).toFixed(2)}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                </Index.TableRow>
              );
            })}
          </DataTable>
        </Index.Box>
      </Index.Box>
    </>
  );
}
