import React, { useContext, useEffect, useState } from "react";
import PagesIndex from "../../PagesIndex";
import Index from "../../Index";

export default function Sidebar(props) {
  const { profile } = useContext(PagesIndex.ProfileContext);
  const permission = profile?.Role?.permissions || [];
  // for page redirect
  const location = PagesIndex.useLocation();
  // for submenu dropdown
  const [open, setOpen] = React.useState(false);
  const [configurationExpanded, setConfigurationExpanded] = useState(false);
  const [screen, setScreen] = useState("");
  const [reportsExpanded, setReportsExpanded] = useState(false);
  const [monitoringExpanded, setMonitoringExpanded] = useState(false);
  const [alarmExpanded, setAlarmExpanded] = useState(false);
  const handleClickAccount = () => {
    setOpen(!open);
  };
  const toggleConfiguration = () => {
    setConfigurationExpanded((prev) => !prev);
  };
  const toggleMonitoring = () => {
    setMonitoringExpanded((prev) => !prev);
  };
  const toggleReports = () => {
    setReportsExpanded((prev) => !prev);
  };
  const toggleAlarm = () => {
    setAlarmExpanded((prev) => !prev);
  };

  // for mobile menu sidebar
  useEffect(() => {
    if (window.innerWidth < 786) {
      props.setOpen(false);
    } else {
      props.setOpen(true);
    }
  }, []);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 786) {
        props.setOpen(false);
      } else {
        props.setOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    if (window.innerWidth < 786) {
      document.body.classList[props.open ? "add" : "remove"](
        "admin-body-overflow"
      );
    }
  }, [props.open]);
  return (
    <Index.Box className={`admin-sidebar-main`}>
      <Index.Box className="admin-sidebar-inner-main">
        <Index.Link className="admin-sidebar-logo-main">
          <img
            src={PagesIndex.Png.kp}
            className="admin-sidebar-logo"
            alt="logo"
          />
          <img
            src={PagesIndex.Png.kp}
            className="admin-sidebar-mini-logo"
            alt="logo"
          />
          <Index.Button
            onClick={() => {
              props.setOpen(!props.open);
            }}
            className="admin-sidebar-close-btn"
          >
            <img
              src={PagesIndex.Svg.close}
              className="admin-close-icon"
              alt="logo"
            />
          </Index.Button>
        </Index.Link>

        <Index.Box className="admin-sidebar-list-main scrollbar">
          <Index.List className="admin-sidebar-list">
            {permission?.includes("fleetdashboard_view") && (
              <Index.ListItem className="admin-sidebar-listitem">
                <Index.Tooltip
                  title="Fleet Dashboard"
                  arrow
                  placement="right"
                  className="admin-tooltip"
                >
                  <Index.Link
                    to="/admin/fleet-dashboard"
                    onClick={() => {
                      if (window.innerWidth < 786) {
                        props.setOpen(!props.open);
                      }
                    }}
                    className={
                      location?.pathname.includes("/admin/fleet-dashboard")
                        ? "admin-sidebar-link active"
                        : "admin-sidebar-link"
                    }
                  >
                    <img
                      src={PagesIndex.Svg.dashboard}
                      alt="Dashboard"
                      className="admin-sidebar-icons"
                    />
                    <span className="admin-sidebar-link-text">
                      Fleet Dashboard
                    </span>
                  </Index.Link>
                </Index.Tooltip>
              </Index.ListItem>
            )}
            {permission?.includes("dashboard_view") && (
              <Index.ListItem className="admin-sidebar-listitem">
                <Index.Tooltip
                  title="Dashboard"
                  arrow
                  placement="right"
                  className="admin-tooltip"
                >
                  <Index.Link
                    to="/admin/dashboard"
                    onClick={() => {
                      if (window.innerWidth < 786) {
                        props.setOpen(!props.open);
                      }
                    }}
                    className={
                      location?.pathname.includes("/admin/dashboard")
                        ? "admin-sidebar-link active"
                        : "admin-sidebar-link"
                    }
                  >
                    <img
                      src={PagesIndex.Svg.dashboard}
                      alt="Dashboard"
                      className="admin-sidebar-icons"
                    />
                    <span className="admin-sidebar-link-text">Dashboard</span>
                  </Index.Link>
                </Index.Tooltip>
              </Index.ListItem>
            )}
            {permission?.includes("monitoring_view") && (
              <Index.ListItem className="admin-sidebar-listitem admin-submenu-listitem-main">
                <Index.Box className="admin-submenu-link-box">
                  <Index.Tooltip
                    title="Monitoring"
                    arrow
                    placement="right"
                    className="admin-tooltip"
                  >
                    <Index.Link
                      className="admin-sidebar-link"
                      onClick={toggleMonitoring}
                    >
                      <img
                        src={PagesIndex.Svg.monitor}
                        alt="Monitoring"
                        className="admin-sidebar-icons"
                      />
                      <span className="admin-sidebar-link-text">
                        Monitoring
                      </span>
                    </Index.Link>
                  </Index.Tooltip>
                  {!monitoringExpanded ? (
                    <Index.ExpandMore className="expandmore-icon" />
                  ) : (
                    <Index.ExpandLess className="expandless-icon" />
                  )}
                  <Index.Box className="admin-submenu-main">
                    <Index.Collapse
                      in={monitoringExpanded}
                      timeout="auto"
                      unmountOnExit
                      className="admin-submenu-collapse"
                    >
                      <Index.List
                        component="div"
                        disablePadding
                        className="admin-sidebar-submenulist"
                      >
                        <Index.ListItem className="admin-sidebar-listitem">
                          <Index.Tooltip
                            title="Robot overview"
                            arrow
                            placement="right"
                            className="admin-tooltip"
                          >
                            <Index.Link
                              to="/admin/robot-overview"
                              onClick={() => {
                                if (window.innerWidth < 786) {
                                  props.setOpen(!props.open);
                                }
                              }}
                              className={
                                location?.pathname.includes(
                                  "/admin/robot-overview"
                                )
                                  ? "admin-sidebar-link active"
                                  : "admin-sidebar-link"
                              }
                            >
                              <img
                                src={PagesIndex.Svg.robotOverview}
                                alt="Robot overview"
                                className="admin-sidebar-icons"
                              />
                              <span className="admin-sidebar-link-text">
                                Robot overview
                              </span>
                            </Index.Link>
                          </Index.Tooltip>
                        </Index.ListItem>
                        <Index.ListItem className="admin-sidebar-listitem">
                          <Index.Tooltip
                            title="Weather view"
                            arrow
                            placement="right"
                            className="admin-tooltip"
                          >
                            <Index.Link
                              to="/admin/weather-view"
                              onClick={() => {
                                if (window.innerWidth < 786) {
                                  props.setOpen(!props.open);
                                }
                              }}
                              className={
                                location?.pathname.includes(
                                  "/admin/weather-view"
                                )
                                  ? "admin-sidebar-link active"
                                  : "admin-sidebar-link"
                              }
                            >
                              <img
                                src={PagesIndex.Svg.robotOverview}
                                alt="Weather view"
                                className="admin-sidebar-icons"
                              />
                              <span className="admin-sidebar-link-text">
                                Weather view
                              </span>
                            </Index.Link>
                          </Index.Tooltip>
                        </Index.ListItem>
                      </Index.List>
                    </Index.Collapse>
                  </Index.Box>
                </Index.Box>
              </Index.ListItem>
            )}

            {/* <Index.ListItem className="admin-sidebar-listitem">
              <Index.Tooltip
                title="Robot"
                arrow
                placement="right"
                className="admin-tooltip"
              >
                <Index.Link
                  to="/admin/robot-list"
                  onClick={() => {
                    if (window.innerWidth < 786) {
                      props.setOpen(!props.open);
                    }
                  }}
                  className={
                    location?.pathname.includes("/admin/robot-list")
                      ? "admin-sidebar-link active"
                      : "admin-sidebar-link"
                  }
                >
                  <img
                    src={PagesIndex.Svg.robotDashIcon}
                    alt="Robot"
                    className="admin-sidebar-icons"
                  />
                  <span className="admin-sidebar-link-text">Robot</span>
                </Index.Link>
              </Index.Tooltip>
            </Index.ListItem> */}
            <Index.ListItem className="admin-sidebar-listitem admin-submenu-listitem-main">
              <Index.Box className="admin-submenu-link-box">
                <Index.Tooltip
                  title="Configuration"
                  arrow
                  placement="right"
                  className="admin-tooltip"
                >
                  <Index.Link
                    className="admin-sidebar-link"
                    onClick={toggleConfiguration}
                  >
                    <img
                      src={PagesIndex.Svg.settingsIcon}
                      alt="Configuration"
                      className="admin-sidebar-icons"
                    />
                    <span className="admin-sidebar-link-text">
                      Configuration
                    </span>
                  </Index.Link>
                </Index.Tooltip>
                {!configurationExpanded ? (
                  <Index.ExpandMore className="expandmore-icon" />
                ) : (
                  <Index.ExpandLess className="expandless-icon" />
                )}
                <Index.Box className="admin-submenu-main">
                  <Index.Collapse
                    in={configurationExpanded}
                    timeout="auto"
                    unmountOnExit
                    className="admin-submenu-collapse"
                  >
                    <Index.List
                      component="div"
                      disablePadding
                      className="admin-sidebar-submenulist"
                    >
                      {permission?.includes("site_view") && (
                        <Index.ListItem className="admin-sidebar-listitem">
                          <Index.Tooltip
                            title="Site"
                            arrow
                            placement="right"
                            className="admin-tooltip"
                          >
                            <Index.Link
                              to="/admin/site-list"
                              onClick={() => {
                                if (window.innerWidth < 786) {
                                  props.setOpen(!props.open);
                                }
                              }}
                              className={
                                location?.pathname.includes("/admin/site-list")
                                  ? "admin-sidebar-link active"
                                  : "admin-sidebar-link"
                              }
                            >
                              <img
                                src={PagesIndex.Svg.siteDashIcon}
                                alt="Site"
                                className="admin-sidebar-icons"
                              />
                              <span className="admin-sidebar-link-text">
                                Site
                              </span>
                            </Index.Link>
                          </Index.Tooltip>
                        </Index.ListItem>
                      )}
                      {permission?.includes("gateway_view") && (
                        <Index.ListItem className="admin-sidebar-listitem">
                          <Index.Tooltip
                            title="Gateway"
                            arrow
                            placement="right"
                            className="admin-tooltip"
                          >
                            <Index.Link
                              to="/admin/gateway-list"
                              onClick={() => {
                                if (window.innerWidth < 786) {
                                  props.setOpen(!props.open);
                                }
                              }}
                              className={
                                location?.pathname.includes(
                                  "/admin/gateway-list"
                                )
                                  ? "admin-sidebar-link active"
                                  : "admin-sidebar-link"
                              }
                            >
                              <img
                                src={PagesIndex.Svg.gatewayDashIcon}
                                alt="Gateway"
                                className="admin-sidebar-icons"
                              />
                              <span className="admin-sidebar-link-text">
                                Gateway
                              </span>
                            </Index.Link>
                          </Index.Tooltip>
                        </Index.ListItem>
                      )}
                      {permission?.includes("lns_view") && (
                        <Index.ListItem className="admin-sidebar-listitem">
                          <Index.Tooltip
                            title="ChirpStack"
                            arrow
                            placement="right"
                            className="admin-tooltip"
                          >
                            <Index.Link
                              to="/admin/chirpstack-management"
                              onClick={() => {
                                if (window.innerWidth < 786) {
                                  props.setOpen(!props.open);
                                }
                              }}
                              className={
                                location?.pathname.includes(
                                  "/admin/chirpstack-management"
                                )
                                  ? "admin-sidebar-link active"
                                  : "admin-sidebar-link"
                              }
                            >
                              <img
                                src={PagesIndex.Svg.chirpstack}
                                alt="Gateway"
                                className="admin-sidebar-icons"
                              />
                              <span className="admin-sidebar-link-text">
                                LNS
                              </span>
                            </Index.Link>
                          </Index.Tooltip>
                        </Index.ListItem>
                      )}
                      <Index.ListItem className="admin-sidebar-listitem">
                        <Index.Tooltip
                          title="Row"
                          arrow
                          placement="right"
                          className="admin-tooltip"
                        >
                          <Index.Link
                            to="/admin/row-management"
                            onClick={() => {
                              if (window.innerWidth < 786) {
                                props.setOpen(!props.open);
                              }
                            }}
                            className={
                              location?.pathname.includes(
                                "/admin/row-management"
                              )
                                ? "admin-sidebar-link active"
                                : "admin-sidebar-link"
                            }
                          >
                            <img
                              src={PagesIndex.Svg.row}
                              alt="Other"
                              className="admin-sidebar-icons"
                            />
                            <span className="admin-sidebar-link-text">Row</span>
                          </Index.Link>
                        </Index.Tooltip>
                      </Index.ListItem>
                      {permission?.includes("robot_view") && (
                        <Index.ListItem className="admin-sidebar-listitem">
                          <Index.Tooltip
                            title="Robot"
                            arrow
                            placement="right"
                            className="admin-tooltip"
                          >
                            <Index.Link
                              to="/admin/robot-list"
                              onClick={() => {
                                if (window.innerWidth < 786) {
                                  props.setOpen(!props.open);
                                }
                              }}
                              className={
                                ["/admin/control-flow", "/admin/robot-list"].some(path => location?.pathname?.includes(path))
                                  ? "admin-sidebar-link active"
                                  : "admin-sidebar-link"
                              }
                            >
                              <img
                                src={PagesIndex.Svg.robotDashIcon}
                                alt="Robot"
                                className="admin-sidebar-icons"
                              />
                              <span className="admin-sidebar-link-text">
                                Robot
                              </span>
                            </Index.Link>
                          </Index.Tooltip>
                        </Index.ListItem>
                      )}

                      {permission?.includes("block_view") && (
                        <Index.ListItem className="admin-sidebar-listitem">
                          <Index.Tooltip
                            title="Block"
                            arrow
                            placement="right"
                            className="admin-tooltip"
                          >
                            <Index.Link
                              to="/admin/block-list"
                              onClick={() => {
                                if (window.innerWidth < 786) {
                                  props.setOpen(!props.open);
                                }
                              }}
                              className={
                                location?.pathname.includes("/admin/block-list")
                                  ? "admin-sidebar-link active"
                                  : "admin-sidebar-link"
                              }
                            >
                              <img
                                src={PagesIndex.Svg.box}
                                alt="Block"
                                className="admin-sidebar-icons"
                              />
                              <span className="admin-sidebar-link-text">
                                Block
                              </span>
                            </Index.Link>
                          </Index.Tooltip>
                        </Index.ListItem>
                      )}
                      {permission?.includes("firmware_view") && (
                        <Index.ListItem className="admin-sidebar-listitem">
                          <Index.Tooltip
                            title="Firmware Update"
                            arrow
                            placement="right"
                            className="admin-tooltip"
                          >
                            <Index.Link
                              to="/admin/firmware-update"
                              onClick={() => {
                                if (window.innerWidth < 786) {
                                  props.setOpen(!props.open);
                                }
                              }}
                              className={
                                location?.pathname.includes(
                                  "/admin/firmware-update"
                                )
                                  ? "admin-sidebar-link active"
                                  : "admin-sidebar-link"
                              }
                            >
                              <img
                                src={PagesIndex.Svg.update}
                                alt="Block"
                                className="admin-sidebar-icons"
                              />
                              <span className="admin-sidebar-link-text">
                                Firmware Update
                              </span>
                            </Index.Link>
                          </Index.Tooltip>
                        </Index.ListItem>
                      )}
                      {permission?.includes("multifirmware_view") && (
                        <Index.ListItem className="admin-sidebar-listitem">
                          <Index.Tooltip
                            title="Multi Firmware Update"
                            arrow
                            placement="right"
                            className="admin-tooltip"
                          >
                            <Index.Link
                              to="/admin/multi-firmware-update"
                              onClick={() => {
                                if (window.innerWidth < 786) {
                                  props.setOpen(!props.open);
                                }
                              }}
                              className={
                                location?.pathname.includes(
                                  "/admin/multi-firmware-update"
                                )
                                  ? "admin-sidebar-link active"
                                  : "admin-sidebar-link"
                              }
                            >
                              <img
                                src={PagesIndex.Svg.update}
                                alt="Block"
                                className="admin-sidebar-icons"
                              />
                              <span className="admin-sidebar-link-text">
                                Multi Firmware Update
                              </span>
                            </Index.Link>
                          </Index.Tooltip>
                        </Index.ListItem>
                      )}
                    </Index.List>
                  </Index.Collapse>
                </Index.Box>
              </Index.Box>
            </Index.ListItem>
            {(permission?.includes("login_view") ||
              permission?.includes("task_view") ||
              permission?.includes("operational_view") ||
              permission?.includes("motor_view") ||
              permission?.includes("other_view")) && (
              <Index.ListItem className="admin-sidebar-listitem admin-submenu-listitem-main">
                <Index.Box className="admin-submenu-link-box">
                  <Index.Tooltip
                    title="Query Reports"
                    arrow
                    placement="right"
                    className="admin-tooltip"
                  >
                    <Index.Link
                      className="admin-sidebar-link"
                      onClick={toggleReports}
                    >
                      <img
                        src={PagesIndex.Svg.reportIcon}
                        alt="Reports"
                        className="admin-sidebar-icons"
                      />
                      <span className="admin-sidebar-link-text">
                        Query Reports
                      </span>
                    </Index.Link>
                  </Index.Tooltip>
                  {!reportsExpanded ? (
                    <Index.ExpandMore className="expandmore-icon" />
                  ) : (
                    <Index.ExpandLess className="expandless-icon" />
                  )}
                  <Index.Box className="admin-submenu-main">
                    <Index.Collapse
                      in={reportsExpanded}
                      timeout="auto"
                      unmountOnExit
                      className="admin-submenu-collapse"
                    >
                      <Index.List
                        component="div"
                        disablePadding
                        className="admin-sidebar-submenulist"
                      >
                        {permission?.includes("task_view") && (
                          <Index.ListItem className="admin-sidebar-listitem">
                            <Index.Tooltip
                              title="Task Report"
                              arrow
                              placement="right"
                              className="admin-tooltip"
                            >
                              <Index.Link
                                to="/admin/task-report"
                                onClick={() => {
                                  if (window.innerWidth < 786) {
                                    props.setOpen(!props.open);
                                  }
                                }}
                                className={
                                  location?.pathname.includes(
                                    "/admin/task-report"
                                  )
                                    ? "admin-sidebar-link active"
                                    : "admin-sidebar-link"
                                }
                              >
                                <img
                                  src={PagesIndex.Svg.reportIcon}
                                  alt="Task report"
                                  className="admin-sidebar-icons"
                                />
                                <span className="admin-sidebar-link-text">
                                  Task Report
                                </span>
                              </Index.Link>
                            </Index.Tooltip>
                          </Index.ListItem>
                        )}
                        {permission?.includes("login_view") && (
                          <Index.ListItem className="admin-sidebar-listitem">
                            <Index.Tooltip
                              title="Login Log"
                              arrow
                              placement="right"
                              className="admin-tooltip"
                            >
                              <Index.Link
                                to="/admin/login-log"
                                onClick={() => {
                                  if (window.innerWidth < 786) {
                                    props.setOpen(!props.open);
                                  }
                                }}
                                className={
                                  location?.pathname.includes(
                                    "/admin/login-log"
                                  )
                                    ? "admin-sidebar-link active"
                                    : "admin-sidebar-link"
                                }
                              >
                                <img
                                  src={PagesIndex.Svg.reportIcon}
                                  alt="Report 2"
                                  className="admin-sidebar-icons"
                                />
                                <span className="admin-sidebar-link-text">
                                  Login Log
                                </span>
                              </Index.Link>
                            </Index.Tooltip>
                          </Index.ListItem>
                        )}
                        {permission?.includes("operational_view") && (
                          <Index.ListItem className="admin-sidebar-listitem">
                            <Index.Tooltip
                              title="Operational Log"
                              arrow
                              placement="right"
                              className="admin-tooltip"
                            >
                              <Index.Link
                                to="/admin/operation-log"
                                onClick={() => {
                                  if (window.innerWidth < 786) {
                                    props.setOpen(!props.open);
                                  }
                                }}
                                className={
                                  location?.pathname.includes(
                                    "/admin/operation-log"
                                  )
                                    ? "admin-sidebar-link active"
                                    : "admin-sidebar-link"
                                }
                              >
                                <img
                                  src={PagesIndex.Svg.reportIcon}
                                  alt="Report 2"
                                  className="admin-sidebar-icons"
                                />
                                <span className="admin-sidebar-link-text">
                                  Operational Log
                                </span>
                              </Index.Link>
                            </Index.Tooltip>
                          </Index.ListItem>
                        )}
                        {permission?.includes("motor_view") && (
                          <Index.ListItem className="admin-sidebar-listitem">
                            <Index.Tooltip
                              title="Motors Check Report"
                              arrow
                              placement="right"
                              className="admin-tooltip"
                            >
                              <Index.Link
                                to="/admin/motor-report"
                                onClick={() => {
                                  if (window.innerWidth < 786) {
                                    props.setOpen(!props.open);
                                  }
                                }}
                                className={
                                  location?.pathname.includes(
                                    "/admin/motor-report"
                                  )
                                    ? "admin-sidebar-link active"
                                    : "admin-sidebar-link"
                                }
                              >
                                <img
                                  src={PagesIndex.Svg.reportIcon}
                                  alt="Report 3"
                                  className="admin-sidebar-icons"
                                />
                                <span className="admin-sidebar-link-text">
                                  Motors Check Report
                                </span>
                              </Index.Link>
                            </Index.Tooltip>
                          </Index.ListItem>
                        )}
                        {permission?.includes("other_view") && (
                          <Index.ListItem className="admin-sidebar-listitem">
                            <Index.Tooltip
                              title="Other Check Report"
                              arrow
                              placement="right"
                              className="admin-tooltip"
                            >
                              <Index.Link
                                to="/admin/other-report"
                                onClick={() => {
                                  if (window.innerWidth < 786) {
                                    props.setOpen(!props.open);
                                  }
                                }}
                                className={
                                  location?.pathname.includes(
                                    "/admin/other-report"
                                  )
                                    ? "admin-sidebar-link active"
                                    : "admin-sidebar-link"
                                }
                              >
                                <img
                                  src={PagesIndex.Svg.reportIcon}
                                  alt="Report 3"
                                  className="admin-sidebar-icons"
                                />
                                <span className="admin-sidebar-link-text">
                                  Other Check Report
                                </span>
                              </Index.Link>
                            </Index.Tooltip>
                          </Index.ListItem>
                        )}
                      </Index.List>
                    </Index.Collapse>
                  </Index.Box>
                </Index.Box>
              </Index.ListItem>
            )}
            {(permission?.includes("alarm_view") ||
              permission?.includes("processed_view")) && (
              <Index.ListItem className="admin-sidebar-listitem admin-submenu-listitem-main">
                <Index.Box className="admin-submenu-link-box">
                  <Index.Tooltip
                    title="System Alarms"
                    arrow
                    placement="right"
                    className="admin-tooltip"
                  >
                    <Index.Link
                      className="admin-sidebar-link"
                      onClick={toggleAlarm}
                    >
                      <img
                        src={PagesIndex.Svg.clockWhite}
                        alt="System Alarms"
                        className="admin-sidebar-icons"
                      />
                      <span className="admin-sidebar-link-text">
                        System Alarms
                      </span>
                    </Index.Link>
                  </Index.Tooltip>
                  {!alarmExpanded ? (
                    <Index.ExpandMore className="expandmore-icon" />
                  ) : (
                    <Index.ExpandLess className="expandless-icon" />
                  )}
                  <Index.Box className="admin-submenu-main">
                    <Index.Collapse
                      in={alarmExpanded}
                      timeout="auto"
                      unmountOnExit
                      className="admin-submenu-collapse"
                    >
                      <Index.List
                        component="div"
                        disablePadding
                        className="admin-sidebar-submenulist"
                      >
                        {permission?.includes("alarm_view") && (
                          <Index.ListItem className="admin-sidebar-listitem">
                            <Index.Tooltip
                              title="Robot Alarm"
                              arrow
                              placement="right"
                              className="admin-tooltip"
                            >
                              <Index.Link
                                to="/admin/robot-alarm"
                                onClick={() => {
                                  if (window.innerWidth < 786) {
                                    props.setOpen(!props.open);
                                  }
                                }}
                                className={
                                  location?.pathname.includes(
                                    "/admin/robot-alarm"
                                  )
                                    ? "admin-sidebar-link active"
                                    : "admin-sidebar-link"
                                }
                              >
                                <img
                                  src={PagesIndex.Svg.clockWhite}
                                  alt="Robot Alarm"
                                  className="admin-sidebar-icons"
                                />
                                <span className="admin-sidebar-link-text">
                                  Robot Alarm
                                </span>
                              </Index.Link>
                            </Index.Tooltip>
                          </Index.ListItem>
                        )}
                        {permission?.includes("processed_view") && (
                          <Index.ListItem className="admin-sidebar-listitem">
                            <Index.Tooltip
                              title="Processed Alarm"
                              arrow
                              placement="right"
                              className="admin-tooltip"
                            >
                              <Index.Link
                                to="/admin/processed-alarm"
                                onClick={() => {
                                  if (window.innerWidth < 786) {
                                    props.setOpen(!props.open);
                                  }
                                }}
                                className={
                                  location?.pathname.includes(
                                    "/admin/processed-alarm"
                                  )
                                    ? "admin-sidebar-link active"
                                    : "admin-sidebar-link"
                                }
                              >
                                <img
                                  src={PagesIndex.Svg.clockWhite}
                                  alt="Processed Alarm"
                                  className="admin-sidebar-icons"
                                />
                                <span className="admin-sidebar-link-text">
                                  Processed Alarm
                                </span>
                              </Index.Link>
                            </Index.Tooltip>
                          </Index.ListItem>
                        )}
                      </Index.List>
                    </Index.Collapse>
                  </Index.Box>
                </Index.Box>
              </Index.ListItem>
            )}
            {(permission?.includes("user_view") ||
              permission?.includes("role_view")) && (
              <Index.ListItem className="admin-sidebar-listitem admin-submenu-listitem-main">
                <Index.Box className="admin-submenu-link-box">
                  <Index.Tooltip
                    title="IAM"
                    arrow
                    placement="right"
                    className="admin-tooltip"
                  >
                    <Index.Link
                      className="admin-sidebar-link"
                      onClick={handleClickAccount}
                    >
                      <img
                        src={PagesIndex.Svg.changepassword}
                        alt="IAM"
                        className="admin-sidebar-icons"
                      />
                      <span className="admin-sidebar-link-text">IAM</span>
                    </Index.Link>
                  </Index.Tooltip>
                  {!open ? (
                    <Index.ExpandMore className="expandmore-icon" />
                  ) : (
                    <Index.ExpandLess className="expandless-icon" />
                  )}
                  <Index.Box className="admin-submenu-main">
                    <Index.Collapse
                      in={open}
                      timeout="auto"
                      unmountOnExit
                      className="admin-submenu-collapse"
                    >
                      <Index.List
                        component="div"
                        disablePadding
                        className="admin-sidebar-submenulist"
                      >
                        {permission?.includes("user_view") && (
                          <Index.ListItem className="admin-sidebar-listitem">
                            <Index.Tooltip
                              title="User"
                              arrow
                              placement="right"
                              className="admin-tooltip"
                            >
                              <Index.Link
                                to="/admin/user-list"
                                onClick={() => {
                                  if (window.innerWidth < 786) {
                                    props.setOpen(!props.open);
                                  }
                                }}
                                className={
                                  location?.pathname.includes(
                                    "/admin/user-list"
                                  )
                                    ? "admin-sidebar-link active"
                                    : "admin-sidebar-link"
                                }
                              >
                                <img
                                  src={PagesIndex.Svg.userlist}
                                  alt="User"
                                  className="admin-sidebar-icons"
                                />
                                <span className="admin-sidebar-link-text">
                                  User
                                </span>
                              </Index.Link>
                            </Index.Tooltip>
                          </Index.ListItem>
                        )}
                        {/* <Index.ListItem className="admin-sidebar-listitem">
                        <Index.Tooltip
                          title="Permission"
                          arrow
                          placement="right"
                          className="admin-tooltip"
                        >
                          <Index.Link
                            to="/admin/permission-list"
                            onClick={() => {
                              if (window.innerWidth < 786) {
                                props.setOpen(!props.open);
                              }
                            }}
                            className={
                              location?.pathname.includes(
                                "/admin/permission-list"
                              )
                                ? "admin-sidebar-link active"
                                : "admin-sidebar-link"
                            }
                          >
                            <img
                              src={PagesIndex.Svg.permissionDashIcon}
                              alt="Permission"
                              className="admin-sidebar-icons"
                            />
                            <span className="admin-sidebar-link-text">
                              Permission
                            </span>
                          </Index.Link>
                        </Index.Tooltip>
                      </Index.ListItem> */}
                        {permission?.includes("role_view") && (
                          <Index.ListItem className="admin-sidebar-listitem">
                            <Index.Tooltip
                              title="Role"
                              arrow
                              placement="right"
                              className="admin-tooltip"
                            >
                              <Index.Link
                                to="/admin/role"
                                onClick={() => {
                                  if (window.innerWidth < 786) {
                                    props.setOpen(!props.open);
                                  }
                                }}
                                className={
                                  location?.pathname.includes("/admin/role")
                                    ? "admin-sidebar-link active"
                                    : "admin-sidebar-link"
                                }
                              >
                                <img
                                  src={PagesIndex.Svg.roleDashIcon}
                                  alt="Role"
                                  className="admin-sidebar-icons"
                                />
                                <span className="admin-sidebar-link-text">
                                  Role
                                </span>
                              </Index.Link>
                            </Index.Tooltip>
                          </Index.ListItem>
                        )}
                      </Index.List>
                    </Index.Collapse>
                  </Index.Box>
                </Index.Box>
              </Index.ListItem>
            )}
            {profile?._id == "67ef940212a74d43f99b4c84" ? (
              <Index.ListItem className="admin-sidebar-listitem">
                <Index.Tooltip
                  title="GSM Fuota"
                  arrow
                  placement="right"
                  className="admin-tooltip"
                >
                  <Index.Link
                    to="/admin/gsm-fuota-list"
                    onClick={() => {
                      if (window.innerWidth < 786) {
                        props.setOpen(!props.open);
                      }
                    }}
                    className={
                      location?.pathname.includes("/admin/gsm-fuota-list")
                        ? "admin-sidebar-link active"
                        : "admin-sidebar-link"
                    }
                  >
                    <img
                      src={PagesIndex.Svg.otaIcon}
                      alt="GSM Fuota"
                      className="admin-sidebar-icons"
                    />
                    <span className="admin-sidebar-link-text">GSM Fuota</span>
                  </Index.Link>
                </Index.Tooltip>
              </Index.ListItem>
            ) : (
              ""
            )}

            {/* <Index.ListItem className="admin-sidebar-listitem">
              <Index.Tooltip
                title="User Card"
                arrow
                placement="right"
                className="admin-tooltip"
              >
                <Index.Link
                  to="/admin/user-card"
                  onClick={() => {
                    if (window.innerWidth < 786) {
                      props.setOpen(!props.open);
                    }
                  }}
                  className={
                    location?.pathname.includes("/admin/user-card")
                      ? "admin-sidebar-link active"
                      : "admin-sidebar-link"
                  }
                >
                  <img
                    src={PagesIndex.Svg.usercard}
                    alt="User Card"
                    className="admin-sidebar-icons"
                  />
                  <span className="admin-sidebar-link-text">Robots</span>
                </Index.Link>
              </Index.Tooltip>
            </Index.ListItem> */}
            {/* <Index.ListItem
              className="admin-sidebar-listitem admin-submenu-listitem-main"
              onClick={handleClickAccount}
            >
              <Index.Box className="admin-submenu-link-box">
                <Index.Tooltip
                  title="CMS"
                  arrow
                  placement="right"
                  className="admin-tooltip"
                >
                  <Index.Link className="admin-sidebar-link">
                    <img
                      src={PagesIndex.Svg.changepassword}
                      alt="CMS"
                      className="admin-sidebar-icons"
                    />
                    <span className="admin-sidebar-link-text">CMS</span>
                  </Index.Link>
                </Index.Tooltip>
                {open ? (
                  <Index.ExpandMore className="expandmore-icon" />
                ) : (
                  <Index.ExpandLess className="expandless-icon" />
                )}
                <Index.Box className="admin-submenu-main">
                  <Index.Collapse
                    in={open}
                    timeout="auto"
                    unmountOnExit
                    className="admin-submenu-collapse"
                  >
                    <Index.List
                      component="div"
                      disablePadding
                      className="admin-sidebar-submenulist"
                    >
                      <Index.ListItem className="admin-sidebar-listitem">
                        <Index.Tooltip
                          title="About"
                          arrow
                          placement="right"
                          className="admin-tooltip"
                        >
                          <Index.Link
                            className="admin-sidebar-link"
                            onClick={() => {
                              if (window.innerWidth < 786) {
                                props.setOpen(!props.open);
                              }
                            }}
                          >
                            <img
                              src={PagesIndex.Svg.abouticon}
                              alt="About"
                              className="admin-sidebar-icons"
                            />
                            <span className="admin-sidebar-link-text">
                              About
                            </span>
                          </Index.Link>
                        </Index.Tooltip>
                      </Index.ListItem>
                      <Index.ListItem className="admin-sidebar-listitem">
                        <Index.Tooltip
                          title="Terms & Conditions"
                          arrow
                          placement="right"
                          className="admin-tooltip"
                        >
                          <Index.Link
                            to="/admin/terms-and-condition"
                            onClick={() => {
                              if (window.innerWidth < 786) {
                                props.setOpen(!props.open);
                              }
                            }}
                            className={
                              location?.pathname.includes(
                                "/admin/terms-and-condition"
                              )
                                ? "admin-sidebar-link active"
                                : "admin-sidebar-link"
                            }
                          >
                            <img
                              src={PagesIndex.Svg.termsandconditionicon}
                              alt="Terms & Conditions"
                              className="admin-sidebar-icons"
                            />
                            <span className="admin-sidebar-link-text">
                              Terms & Conditions
                            </span>
                          </Index.Link>
                        </Index.Tooltip>
                      </Index.ListItem>
                      <Index.ListItem className="admin-sidebar-listitem">
                        <Index.Tooltip
                          title="Privacy Policy"
                          arrow
                          placement="right"
                          className="admin-tooltip"
                        >
                          <Index.Link
                            to="/admin/privacy-policy"
                            onClick={() => {
                              if (window.innerWidth < 786) {
                                props.setOpen(!props.open);
                              }
                            }}
                            className={
                              location?.pathname.includes(
                                "/admin/privacy-policy"
                              )
                                ? "admin-sidebar-link active"
                                : "admin-sidebar-link"
                            }
                          >
                            <img
                              src={PagesIndex.Svg.policyicon}
                              alt="Privacy Policy"
                              className="admin-sidebar-icons"
                            />
                            <span className="admin-sidebar-link-text">
                              Privacy Policy
                            </span>
                          </Index.Link>
                        </Index.Tooltip>
                      </Index.ListItem>
                    </Index.List>
                  </Index.Collapse>
                </Index.Box>
              </Index.Box>
            </Index.ListItem> */}
          </Index.List>
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
}
