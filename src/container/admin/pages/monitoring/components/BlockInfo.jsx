import React, { useContext, useState } from "react";
import Index from "../../../../Index";
import TabLayout from "../../../../../component/common/tabs/TabLayout";
import ActionButton from "../../../../../component/common/Button/ActionButton";
import PagesIndex from "../../../../PagesIndex";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import PageIndex from "../../../../../component/PagesIndex";

import {
  Card,
  CardActionArea,
  CardContent,
  IconButton,
  Chip,
  Tooltip,
  Grid,
  Box,
  Typography,
  Paper,
  Avatar,
} from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import {
  Place as LocationIcon,
  ContentCopy as CopyIcon,
  Person as PersonIcon,
  Devices as DevicesIcon,
  Alarm as AlarmIcon,
  Error as ErrorIcon,
  Build as MaintIcon,
  Update as UpdateIcon,
  PauseCircleOutline as IdleIcon,
  ChargingStation as ChargingStationIcon,
  CleaningServices as CleaningIcon,
} from "@mui/icons-material";

// --- STATE & BATTERY HELPERS --- //
const stateBadgeMap = {
  IDLE_STATE: {
    icon: <IdleIcon fontSize="small" />,
    color: "info",
    label: "Idle",
  },
  CLEANING_STATE: {
    icon: <CleaningIcon fontSize="small" />,
    color: "success",
    label: "Cleaning",
  },
  CHARGING_STATE: {
    icon: <ChargingStationIcon fontSize="small" />,
    color: "primary",
    label: "Charging",
  },
  MAINTENANCE_STATE: {
    icon: <MaintIcon fontSize="small" />,
    color: "warning",
    label: "Maintenance",
  },
  UPDATE_STATE: {
    icon: <UpdateIcon fontSize="small" />,
    color: "secondary",
    label: "Updating",
  },
  STAW_STATE: {
    icon: <AlarmIcon fontSize="small" />,
    color: "error",
    label: "Staw",
  },
  ERROR_STATE: {
    icon: <ErrorIcon fontSize="small" />,
    color: "error",
    label: "Error",
  },
};

function getStateBadge(robot) {
  const info = stateBadgeMap[robot.state] || {
    icon: <IdleIcon fontSize="small" />,
    color: "default",
    label: robot.state || "Unknown",
  };
  return (
    <Chip
      icon={info.icon}
      label={info.label}
      color={info.color}
      size="small"
      sx={{ fontWeight: 600, fontSize: 12, minWidth: 0 }}
    />
  );
}

function getBatteryIcon(robot) {
  const level = robot.battery || 0;
  let iconColor = "success.main";
  if (level < 25) iconColor = "error.main";
  else if (level < 75) iconColor = "warning.main";
  return (
    <Tooltip title={`Battery: ${level}%`}>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 52 }}
      >
        <ChargingStationIcon sx={{ color: iconColor, fontSize: 18 }} />
        <Typography
          variant="caption"
          sx={{
            color: iconColor,
            fontWeight: 600,
            minWidth: 20,
            textAlign: "right",
          }}
        >
          {level}%
        </Typography>
      </Box>
    </Tooltip>
  );
}

const BlockInfo = ({ block }) => {
  const { profile } = useContext(PageIndex.ProfileContext);
  const permissions = profile?.Role?.permissions || [];
  const tabs = ["Robots View", "Control Commands"];
  const navigate = useNavigate();

  const [blockData, setBlockData] = useState(block);
  const [loading, setLoading] = useState(false);
  const [resendModalOpen, setResendModalOpen] = useState(false);
  const [selectedRobot, setSelectedRobot] = useState(null);

  const isRobotOfline = (status) => {
    const online = status == "OFFLINE" ? true : false;
    return online;
  };

  // Data fetch actions
  const fetchBlockData = async () => {
    setLoading(true);
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_ADD_EDIT_BLOCKS + `/overview/${block.id}`,
      );
      if (res.status === 200 && res.data) {
        setBlockData(res.data);
        PagesIndex.toasterSuccess("Refreshed successfully");
      }
    } catch (err) {
      PagesIndex.toasterError("Error refreshing data");
    } finally {
      setLoading(false);
    }
  };

  const successCommands = [
    "CMD_SUCCESS",
    "MOTOR_ALREADY_STARTED",
    "MOTOR_ALREADY_STOPPED",
  ];
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
  const sendCommands = async (id, type) => {
    try {
      const res = await PagesIndex.apiPostHandler(
        PagesIndex.Api.GET_ADD_EDIT_BLOCKS + "/queue",
        { id, type },
      );
      if (res.status === 200) {
        PagesIndex.toasterSuccess(res.message);
        await addCommandHistory(id, type);
      }
    } catch (error) {
      PagesIndex.toasterError("Error executing commands");
    }
  };

  const sendDeviceCommands = async (id, type) => {
    try {
      const res = await PagesIndex.apiPostHandler(
        PagesIndex.Api.GET_ADD_EDIT_DEVICES + "/queue",
        { devEui: id, type },
      );
      if (res.status === 200) {
        PagesIndex.toasterSuccess(res.message);
        await addCommandHistory(id, type);
      }
    } catch (error) {
      PagesIndex.toasterError("Error executing device commands");
    }
  };

  const robotsWithIssues = (blockData.devices || []).filter(
    (robot) => !successCommands.includes(robot.command_status),
  );

  const offlineRobots = (blockData.devices || []).filter((robot) =>
    isRobotOfline(robot.status),
  );

  const lowBatteryRobots = (blockData.devices || []).filter(
    (robot) => (robot.battery || 0) < 25,
  );

  const controlCommands = [
    { type: "CLEAN_ONE_CYCLE", label: "Clean one cycle" },
    { type: "HOME", label: "Home" },
    { type: "LEFT_START", label: "Left start" },
    { type: "RIGHT_START", label: "Right start" },
    { type: "STOP_ROBOT", label: "Stop" },
    { type: "ENTER_CHARGING_STATE", label: "Enter Charging" },
    { type: "EXIT_CHARGING_STATE", label: "Exit Charging" },
    { type: "ENTER_MAINTENANCE_STATE", label: "Enter Maintenance" },
    { type: "EXIT_MAINTENANCE_STATE", label: "Exit Maintenance" },
    { type: "SOFT_RESET", label: "Soft Reset" },
  ];

  const handleCopy = (value) => {
    navigator.clipboard.writeText(value ?? "");
    PagesIndex.toasterSuccess("Copied!");
  };

  const InteractiveDetail = ({ icon, label, value, clickable }) => (
    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
      <Avatar sx={{ bgcolor: "primary.light", width: 28, height: 28, mr: 1 }}>
        {icon}
      </Avatar>
      <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 88 }}>
        {label}:
      </Typography>
      <Typography
        variant="body2"
        sx={{
          ml: 1,
          mr: 2,
          textDecoration: clickable ? "underline dotted" : "none",
          cursor: clickable ? "copy" : "default",
        }}
        onClick={clickable ? () => handleCopy(value) : undefined}
      >
        {value}
      </Typography>
      {clickable && (
        <IconButton onClick={() => handleCopy(value)} size="small">
          <CopyIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );

  return (
    <Index.Box>
      {/* Resend Command Modal */}
      {resendModalOpen && selectedRobot && (
        <Index.Modal
          open={resendModalOpen}
          onClose={() => {
            setSelectedRobot(null);
            setResendModalOpen(false);
          }}
        >
          <Index.Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              minWidth: "300px",
              boxShadow: 24,
            }}
          >
            <Index.Typography sx={{ fontWeight: "bold", marginBottom: "10px" }}>
              Resend Command to{" "}
              {selectedRobot === "__ALL__"
                ? "All Problematic Robots"
                : selectedRobot.name}
            </Index.Typography>
            {controlCommands.map((cmd) => (
              <Index.Box
                key={cmd.type}
                sx={{
                  marginBottom: "10px",
                  background: "rgba(0,0,255,0.1)",
                  width: "100%",
                  padding: "5px",
                  borderRadius: "10px",
                }}
              >
                <ActionButton
                  label={cmd.label}
                  onClick={async () => {
                    if (selectedRobot === "__ALL__") {
                      for (const robot of robotsWithIssues) {
                        await sendDeviceCommands(robot.devEui, cmd.type);
                      }
                    } else {
                      await sendDeviceCommands(selectedRobot.devEui, cmd.type);
                    }
                    setResendModalOpen(false);
                  }}
                  btnSx={{ width: "100%" }}
                />
              </Index.Box>
            ))}
          </Index.Box>
        </Index.Modal>
      )}

      <Box
        sx={{
          py: 1,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <Typography
            variant="h4"
            sx={{ mb: 2, fontWeight: 700, letterSpacing: 0.5 }}
          >
            Block Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <InteractiveDetail
                icon={<PersonIcon />}
                label="Block Name"
                value={block.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InteractiveDetail
                icon={<DevicesIcon />}
                label="Total Robots"
                value={block.devices.length}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InteractiveDetail
                icon={<LocationIcon />}
                label="Multicast Address"
                value={block.mcAddr}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InteractiveDetail
                icon={<AlarmIcon />}
                label="Auto Start Time"
                value={block.startTime}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Index.Box
        sx={{
          margin: "20px 0",
          padding: "10px",
          backgroundColor: "#f7f7f7",
          borderRadius: "10px",
        }}
      >
        <Index.Typography
          sx={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}
        >
          ⚠️ Robot Summary:
        </Index.Typography>
        <Index.Typography sx={{ fontSize: "14px" }}>
          🔌 Offline: <strong>{offlineRobots.length}</strong> | 🔋 Low Battery:{" "}
          <strong>{lowBatteryRobots.length}</strong>
        </Index.Typography>
      </Index.Box>

      {robotsWithIssues.length > 0 && (
        <Index.Box
          sx={{
            marginBottom: "20px",
            backgroundColor: "#fff2f2",
            padding: "10px",
            borderRadius: "10px",
            position: "relative",
          }}
        >
          <Index.Typography
            sx={{
              fontWeight: "bold",
              marginBottom: "8px",
              fontSize: "14px",
              color: "red",
            }}
          >
            ⚠️ Robots Not in Success State
          </Index.Typography>
          🔧 Not Operational: <strong>{robotsWithIssues.length}</strong>
          {robotsWithIssues.map((robot) => (
            <Index.Box
              key={robot.id}
              sx={{ fontSize: "13px", padding: "4px 0" }}
            ></Index.Box>
          ))}
          <Index.Box
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
            }}
          >
            {permissions?.includes("robottreelevelcommand_clean") && (
              <ActionButton
                label="Resend All"
                onClick={() => {
                  setSelectedRobot("__ALL__");
                  setResendModalOpen(true);
                }}
                btnSx={{
                  fontSize: "11px",
                  padding: "4px 10px",
                  minWidth: "auto",
                  backgroundColor: "rgba(255,0,0,0.1)",
                  color: "red",
                  border: "1px solid rgba(255,0,0,0.3)",
                }}
              />
            )}
          </Index.Box>
        </Index.Box>
      )}

      <Index.Box sx={{ marginTop: "10px" }}>
        <TabLayout tabs={tabs}>
          <Index.Box sx={{ position: "relative" }}>
            <Index.Box
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
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
              }}
              onClick={fetchBlockData}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </Index.Box>

            {/* ===  ROBOT CARDS: Responsive Layout  === */}
            <Grid container sx={{ marginTop: "30px" }} spacing={2}>
              {(blockData?.devices || []).map((robot) => (
                <Grid item key={robot.id} xs={12} sm={6} md={4} lg={3}>
                  <Card
                    sx={{
                      position: "relative",
                      border: !successCommands.includes(robot.command_status)
                        ? "2px solid #ffb3b3"
                        : "1px solid #e0e0e0",
                      boxShadow: 3,
                      backgroundColor: !successCommands.includes(
                        robot.command_status,
                      )
                        ? "#ffe8e8"
                        : "#fff",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardActionArea
                      onClick={() =>
                        navigate(
                          `/admin/control-flow/${blockData.applicationId}/${robot.devEui}`,
                          { state: { data: robot } },
                        )
                      }
                    >
                      {/* === Responsive Robot Card === */}
                      <CardContent
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1.5,
                          p: { xs: 1, md: 2 },
                        }}
                      >
                        {/* Top section: Name | Battery | State | Online/Offline */}
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: { xs: "wrap", sm: "nowrap" },
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          {/* Name */}
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              flexBasis: { xs: "100%", sm: "auto" },
                              flexGrow: 1,
                              mb: { xs: 0.5, sm: 0 },
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              minWidth: 0,
                            }}
                          >
                            {robot.name}
                          </Typography>
                          <Tooltip
                            title={
                              robot.lastSeen
                                ? `Last seen: ${moment(
                                    robot.lastSeen,
                                  ).fromNow()}`
                                : "Never seen"
                            }
                          >
                            <Box sx={{ ml: 0.5 }}>
                              {robot?.status == "ONLINE" ? (
                                <img
                                  src={PagesIndex.Svg.online}
                                  alt="Online"
                                  style={{
                                    height: 20,
                                    width: 20,
                                    verticalAlign: "middle",
                                  }}
                                />
                              ) : (
                                <img
                                  src={PagesIndex.Svg.offline}
                                  alt="Offline"
                                  style={{
                                    height: 20,
                                    width: 20,
                                    verticalAlign: "middle",
                                  }}
                                />
                              )}
                            </Box>
                          </Tooltip>
                          {/* Battery */}
                          {getBatteryIcon(robot)}
                          {/* State Badge */}
                          {getStateBadge(robot)}
                          {/* Online / Offline (icon) */}

                          {/* Resend button if needed - right align, wrapped on mobile */}
                          {!successCommands.includes(robot.command_status) && (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: {
                                  xs: "flex-start",
                                  sm: "flex-end",
                                },
                              }}
                            >
                              {permissions?.includes(
                                "robottreelevelcommand_clean",
                              ) && (
                                <Tooltip title="Resend Command">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedRobot(robot);
                                      setResendModalOpen(true);
                                    }}
                                  >
                                    <ReplayIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          )}
                        </Box>
                        {/* Details */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: 13,
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography sx={{ fontWeight: 500, fontSize: 12 }}>
                            Current Command
                          </Typography>
                          <Typography sx={{ fontSize: 12 }}>
                            {robot.runningCommand}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: 13,
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography sx={{ fontWeight: 500, fontSize: 12 }}>
                            Command Status
                          </Typography>
                          <Typography sx={{ fontSize: 12 }}>
                            {robot.command_status}
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Index.Box>

          {/* --- Controls code stays same as before --- */}
          <Index.Box>
            <Index.Grid container rowGap={"15px"}>
              {permissions?.includes("blockcommand_settime") && (
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
                      sendCommands(block.id, "CLEAN_ONE_CYCLE");
                    }}
                    isDisabled={false}
                    imgSRC={PagesIndex.Svg.clock}
                    imgAlt={"Set start time"}
                    label={"Set start time"}
                    bgColor={"rgba(0,0,255,0.1)"}
                    textColor={"blue"}
                    borderColor={"rgba(0,0,255,0.3)"}
                  />
                </Index.Grid>
              )}
              {permissions?.includes("blockcommand_clean") && (
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
                      sendCommands(block.id, "CLEAN_ONE_CYCLE");
                    }}
                    isDisabled={false}
                    imgSRC={PagesIndex.Svg.powerButton}
                    imgAlt={"Clean one cycle"}
                    label={"Clean one cycle"}
                    bgColor={"rgba(55,126,34,0.1)"}
                    textColor={"rgba(55,126,34,1)"}
                    borderColor={"rgba(55,126,34,0.3)"}
                  />
                </Index.Grid>
              )}
              {permissions?.includes("blockcommand_home") && (
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
                      sendCommands(block.id, "HOME");
                    }}
                    isDisabled={false}
                    imgSRC={PagesIndex.Svg.homeIcon}
                    imgAlt={"Home"}
                    label={"Home"}
                    bgColor={"rgba(0,0,255,0.1)"}
                    textColor={"blue"}
                    borderColor={"rgba(0,0,255,0.3)"}
                  />
                </Index.Grid>
              )}
              {permissions?.includes("blockcommand_left") && (
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
                      sendCommands(block.id, "LEFT_START");
                    }}
                    isDisabled={false}
                    imgSRC={PagesIndex.Svg.leftArrowIcon}
                    imgAlt={"Left start"}
                    label={"Left start"}
                    bgColor={"rgba(0,0,255,0.1)"}
                    textColor={"blue"}
                    borderColor={"rgba(0,0,255,0.3)"}
                  />
                </Index.Grid>
              )}
              {permissions?.includes("blockcommand_standby") && (
                <Index.Grid
                  item
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                  xs={12}
                  sm={4}
                  lg={2}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%", height: "100%" }}
                    onClick={() => {
                      sendCommands(block.id, "STOP_ROBOT");
                    }}
                    isDisabled={false}
                    imgSRC={PagesIndex.Svg.stopIcon}
                    imgAlt={"Stop"}
                    label={"Stop"}
                    bgColor={"rgba(255,0,0,0.1)"}
                    textColor={"red"}
                    borderColor={"rgba(255,0,0,0.3)"}
                  />
                </Index.Grid>
              )}
              {permissions?.includes("blockcommand_right") && (
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
                      sendCommands(block.id, "RIGHT_START");
                    }}
                    isDisabled={false}
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
            <Index.Grid container sx={{ marginTop: "15px" }} rowGap={"15px"}>
              {permissions?.includes("blockcommand_enterchargingstate") && (
                <Index.Grid
                  item
                  xs={12}
                  sm={6}
                  lg={2.4}
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%" }}
                    onClick={() => {
                      sendCommands(block.id, "ENTER_CHARGING_STATE");
                    }}
                    isDisabled={false}
                    imgSRC={PagesIndex.Svg.charge}
                    imgAlt={"Enter charging state"}
                    label={"Enter charging state"}
                    bgColor={"rgba(0,0,255,0.1)"}
                    textColor={"blue"}
                    borderColor={"rgba(0,0,255,0.3)"}
                  />
                </Index.Grid>
              )}
              {permissions?.includes("blockcommand_exitchargingstate") && (
                <Index.Grid
                  item
                  xs={12}
                  sm={6}
                  lg={2.4}
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%" }}
                    onClick={() => {
                      sendCommands(block.id, "EXIT_CHARGING_STATE");
                    }}
                    isDisabled={false}
                    imgSRC={PagesIndex.Svg.chargeOff}
                    imgAlt={"Exit charging state"}
                    label={"Exit charging state"}
                    bgColor={"rgba(255,0,0,0.1)"}
                    textColor={"red"}
                    borderColor={"rgba(255,0,0,0.3)"}
                  />
                </Index.Grid>
              )}
              {permissions?.includes("blockcommand_entermaintenancestate") && (
                <Index.Grid
                  item
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                  xs={12}
                  sm={6}
                  lg={2.4}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%", maxWidth: "100%" }}
                    onClick={() => {
                      sendCommands(block.id, "ENTER_MAINTENANCE_STATE");
                    }}
                    isDisabled={false}
                    imgSRC={PagesIndex.Svg.tool}
                    imgAlt={"Enter maintenance state"}
                    label={"Enter maintenance state"}
                    bgColor={"rgba(0,0,255,0.1)"}
                    textColor={"blue"}
                    borderColor={"rgba(0,0,255,0.3)"}
                  />
                </Index.Grid>
              )}
              {permissions?.includes("blockcommand_exitmaintenancestate") && (
                <Index.Grid
                  item
                  sx={{ paddingRight: { sm: "10px", xs: 0 } }}
                  xs={12}
                  sm={6}
                  lg={2.4}
                >
                  <ActionButton
                    btnSx={{ minWidth: "100%", maxWidth: "100%" }}
                    onClick={() => {
                      sendCommands(block.id, "EXIT_MAINTENANCE_STATE");
                    }}
                    isDisabled={false}
                    imgSRC={PagesIndex.Svg.toolOff}
                    imgAlt={"Exit maintenance state"}
                    label={"Exit maintenance state"}
                    bgColor={"rgba(255,0,0,0.1)"}
                    textColor={"red"}
                    borderColor={"rgba(255,0,0,0.3)"}
                  />
                </Index.Grid>
              )}
              {permissions?.includes("blockcommand_softreset") && (
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
                      sendCommands(block.id, "SOFT_RESET");
                    }}
                    isDisabled={false}
                    imgSRC={PagesIndex.Svg.rotate}
                    imgAlt={"Soft reset"}
                    label={"Soft reset"}
                    bgColor={"rgba(255,0,0,0.1)"}
                    textColor={"red"}
                    borderColor={"rgba(255,0,0,0.3)"}
                  />
                </Index.Grid>
              )}
            </Index.Grid>
          </Index.Box>
        </TabLayout>
      </Index.Box>
    </Index.Box>
  );
};

export default BlockInfo;
