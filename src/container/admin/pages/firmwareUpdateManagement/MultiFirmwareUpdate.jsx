import { Drawer, IconButton, TextField as MuiTextField } from "@mui/material"; // Added Autocomplete, MuiTextField, and FormHelperText
import { useCallback, useContext, useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import PageIndex from "../../../../component/PagesIndex";
import DataTable from "../../../../component/common/dataTable/DataTable";
import moment from "moment";
import CloseIcon from "@mui/icons-material/Close";

// for modal design

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  width: 500, // Giving the modal a fixed width for better layout consistency
};

const FuotaStatusStepper = ({ data: historyData = [] }) => {
  const [expandedSteps, setExpandedSteps] = useState({});

  if (!Array.isArray(historyData) || historyData.length === 0) {
    return (
      <Index.Box sx={{ p: 4, textAlign: "center" }}>
        <Index.Typography color="text.secondary">
          No status history available for this update.
        </Index.Typography>
      </Index.Box>
    );
  }

  // --- FILTER LOGIC: Keep only the latest entry for each unique status ---
  const uniqueHistory = historyData;

  // The last step in the filtered array is the current "active" step
  const activeIndex = uniqueHistory.length - 1;
  const getStepIcon = (index) => {
    const isActive = index === activeIndex;
    const isCompleted = index < activeIndex;
    const isFailed =
      uniqueHistory[index]?.status.toLowerCase().includes("fail") && isActive;
    const iconBaseStyle = {
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
      backgroundColor: "#fff",
    };

    if (isCompleted) {
      return (
        <Index.Box sx={{ ...iconBaseStyle, backgroundColor: "#4F46E5" }}>
          <Index.Box
            sx={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#fff",
            }}
          />
        </Index.Box>
      );
    }
    if (isActive) {
      return (
        <Index.Box sx={{ ...iconBaseStyle, border: "2px solid #4F46E5" }}>
          <Index.Box
            sx={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: isFailed ? "#EF4444" : "#4F46E5",
            }}
          />
        </Index.Box>
      );
    }
    return (
      <Index.Box sx={{ ...iconBaseStyle, border: "2px solid #D1D5DB" }}>
        <Index.Box
          sx={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "#D1D5DB",
          }}
        />
      </Index.Box>
    );
  };

  return (
    <Index.Box sx={{ p: 4, fontFamily: "sans-serif" }}>
      {uniqueHistory.map((step, index) => {
        const isCompleted = index < activeIndex;
        const isActive = index === activeIndex;

        return (
          <Index.Box
            key={index}
            sx={{
              display: "flex",
              position: "relative",
              mb: index === uniqueHistory.length - 1 ? 0 : 4,
            }}
          >
            {index < uniqueHistory.length - 1 && (
              <Index.Box
                sx={{
                  position: "absolute",
                  left: "11px",
                  top: "24px",
                  width: "2px",
                  height: "100%",
                  backgroundColor: isCompleted ? "#4F46E5" : "#E5E7EB",
                }}
              />
            )}

            <Index.Box sx={{ mr: 2 }}>{getStepIcon(index)}</Index.Box>

            <Index.Box
              sx={{
                backgroundColor: isActive
                  ? "rgba(79, 70, 229, 0.05)"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(79, 70, 229, 0.1)"
                  : "1px solid transparent",
                borderRadius: "12px",
                p: isActive ? 2 : "2px 0",
                flex: 1,
              }}
            >
              <Index.Typography
                variant="body1"
                sx={{ fontWeight: "bold", color: "#111827" }}
              >
                {step.status}
                {step.devices && (
                  <Index.Box sx={{ mt: 1 }}>
                    {(expandedSteps[index]
                      ? step.devices
                      : step.devices.slice(0, 3)
                    ).map((d, i) => (
                      <Index.Typography
                        key={i}
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", lineHeight: "18px" }}
                      >
                        • {d.name} ({d.devEui})
                      </Index.Typography>
                    ))}

                    {/* Show more / less */}
                    {step.devices.length > 3 && (
                      <Index.Typography
                        variant="caption"
                        sx={{
                          color: "#4F46E5",
                          cursor: "pointer",
                          mt: 0.5,
                          display: "inline-block",
                          fontWeight: 500,
                        }}
                        onClick={() =>
                          setExpandedSteps((prev) => ({
                            ...prev,
                            [index]: !prev[index],
                          }))
                        }
                      >
                        {expandedSteps[index]
                          ? "Show less"
                          : `+ ${step.devices.length - 3} more...`}
                      </Index.Typography>
                    )}
                  </Index.Box>
                )}
              </Index.Typography>
              <Index.Typography variant="body2" color="text.secondary">
                {isActive ? "Current status" : "Completed"}
              </Index.Typography>
              {step.date && (
                <Index.Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  {moment(step.date).format("DD/MM/YYYY hh:mm:ss A")}
                </Index.Typography>
              )}
            </Index.Box>
          </Index.Box>
        );
      })}
    </Index.Box>
  );
};

export default function MultiFuotaManagementList() {
  const { profile } = useContext(PageIndex.ProfileContext);
  const permissions = profile?.Role?.permissions || [];
  const [data, setData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [group, setGroup] = useState([]);
  const [deviceMap, setDeviceMap] = useState({});
  // --- NEW: State for the side drawer ---
  const [drawerState, setDrawerState] = useState({
    open: false,
    data: null,
  });

  const initialValuesMulti = {
    file: "",
    block: "",
    percentage: "",
  };
  // upload modal
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // --- NEW: Handlers for the side drawer ---
  const handleDrawerOpen = (rowData) => {
    setDrawerState({ open: true, data: rowData });
  };
  const handleDrawerClose = () => {
    setDrawerState({ open: false, data: null });
  };

  const getList = useCallback(async () => {
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_ADD_EDIT_DEVICES + "/multi-fuota/history",
      );
      if (res?.status == 200) {
        setData(res?.data);
        setFilterData(res?.data);
      } else {
        PagesIndex.toasterError(res?.message);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);
  const getDevices = async () => {
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_ADD_EDIT_DEVICES + "/multicast",
      );
      if (res?.status === 200) {
        const map = {};
        res.data.forEach((d) => {
          map[d.devEui] = d.name; // adjust if needed
        });
        setDeviceMap(map);
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getList();
    getDevices(); // ✅ added

    const intervalId = setInterval(() => {
      getList();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [getList]);

  const handleSubmitGroup = async (values) => {
    setButtonSpinner(true);
    const formData = new FormData();
    formData.append("file", values?.file);
    formData.append("multicastGroupId", values?.block);
    formData.append("chunkSize", values?.percentage);
    try {
      const res = await PagesIndex.apiPostHandler(
        PagesIndex.Api.GET_ADD_EDIT_DEVICES + "/multi-fuota",
        formData,
      );
      if (res?.status == 200) {
        getList();
        handleClose();
        PagesIndex.toasterSuccess("Mutli FUOTA process started successfully");
      } else {
        PagesIndex.toasterError(res?.message);
      }
      setButtonSpinner(false);
    } catch (error) {
      setButtonSpinner(false);
      PagesIndex.toasterError(error?.response?.data?.message);
      console.log(error);
    }
  };

  const requestSearch = (e) => {
    setSearchValue(e.target.value);
    let result = data.filter((data) => {
      let name = data?.name
        ?.toLowerCase()
        .includes(e?.target?.value?.toLowerCase());
      let email = data?.email
        ?.toLowerCase()
        .includes(e?.target?.value?.toLowerCase());
      return name || email;
    });
    setCurrentPage(1);
    setFilterData(result);
  };
  const getMulticastFuota = async (id) => {
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_ADD_EDIT_BLOCKS,
      );
      if (res?.status == 200) {
        setGroup(res?.data);
        handleOpen();
      } else {
        PagesIndex.toasterError(res?.message);
      }
    } catch (error) {
      setButtonSpinner(false);
      PagesIndex.toasterError(error?.response?.data?.message);
      console.log(error);
    }
  };

  const handleStop = async (id) => {
    try {
      const res = await PagesIndex.apiPostHandler(
        PagesIndex.Api.GET_ADD_EDIT_DEVICES + "/multi-fuota/stop",
        { id },
      );
      if (res?.status == 200) {
        getList();
        PagesIndex.toasterSuccess(res?.message);
      } else {
        PagesIndex.toasterError(res?.message);
      }
    } catch (error) {
      PagesIndex.toasterError(error?.response?.data?.message);
      console.log(error);
    }
  };
  const transformHistory = (row) => {
    let result = [];

    if (row?.fwStartDevices?.length) {
      result.push({
        status: "Processing Firmware update",
        label: "Completed", // 👈 add this
        date: row.fwStartDevices.at(-1)?.date,
        devices: row.fwStartDevices.map((item) => ({
          name: deviceMap[item.devEui] || item.devEui,
          devEui: item.devEui,
        })),
      });
    }

    if (row?.fwCheckDevices?.length) {
      result.push({
        status: "Validating Firmware",
        label: "Completed",
        date: row.fwCheckDevices.at(-1)?.date,
        devices: row.fwCheckDevices.map((item) => ({
          name: deviceMap[item.devEui] || item.devEui,
          devEui: item.devEui,
        })),
      });
    }

    if (row?.fwUpdateDevices?.length) {
      result.push({
        status: "Updating Firmware",
        label: "Current status", // 👈 active one
        date: row.fwUpdateDevices.at(-1)?.date,
        devices: row.fwUpdateDevices.map((item) => ({
          name: deviceMap[item.devEui] || item.devEui,
          devEui: item.devEui,
        })),
      });
    }

    return result;
  };
  // Calculate progress value
  return (
    <>
      <Index.Box className="admin-dashboard-content admin-user-list-content">
        <Index.Box className="admin-user-list-flex admin-page-title-main">
          <Index.Typography
            className="admin-page-title admin-user-list-page-title"
            component="h2"
            variant="h2"
          >
            Multicast FUOTA List
          </Index.Typography>
          <Index.Box className="admin-userlist-btn-flex">
            <Index.Box className="admin-search-main">
              <Index.Box className="admin-search-box">
                <Index.Box className="admin-form-group">
                  <Index.TextField
                    fullWidth
                    id="fullWidth"
                    className="admin-form-control"
                    placeholder="Search"
                    value={searchValue}
                    onChange={requestSearch}
                  />
                  <img
                    src={PagesIndex.Svg.search}
                    className="admin-search-grey-img admin-icon"
                    alt="search"
                  ></img>
                </Index.Box>
              </Index.Box>
            </Index.Box>
            {permissions?.includes("multifirmware_add") && (
              <Index.Box className="admin-adduser-btn-main btn-main-primary">
                <Index.Button
                  className="admin-adduser-btn btn-primary"
                  onClick={getMulticastFuota}
                >
                  <img
                    src={PagesIndex.Svg.down}
                    className="admin-plus-icon"
                    alt="plus"
                  />
                  Upload
                </Index.Button>
              </Index.Box>
            )}
          </Index.Box>
        </Index.Box>

        <Index.Box className="card-border common-card">
          <DataTable
            headerData={[
              { field: "Sr. No." },
              { field: "Block Name" },
              { field: "Site Name" },
              { field: "File Name" },
              { field: "Progress" },
              { field: "File Size" },
              { field: "Status" },
              { field: "Start On" },
              { field: "Completed On" },
              { field: "Duration" },
              { field: "Last Update On" },
              { field: "Action", align: "center" }, // <-- MODIFIED: Added Actions header
            ]}
            filterData={filterData}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          >
            {filterData?.map((data, i) => {
              // Using filterData to respect search functionality
              const startDate = moment(data?.createdAt);
              const endDate = moment(data?.completedAt);
              const duration = moment.duration(endDate.diff(startDate));
              const formattedDuration = data?.completedAt
                ? `${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`
                : "Running";
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
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {i + 1 + (currentPage - 1) * 10}{" "}
                        {/* Correct Sr. No. with pagination */}
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
                        {data?.block?.name}
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
                        {data?.block?.site?.name}
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
                        {data?.filename}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    className="table-td"
                  >
                    <Index.Box
                      sx={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <span style={{ whiteSpace: "nowrap" }}>
                        {Math.floor(
                          data?.totalChunks > 0
                            ? (data?.lastOffset * 100) / data?.totalChunks + 1
                            : 0,
                        )}
                        %
                      </span>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {data.fileSize
                          ? `${(data?.fileSize / 1024).toFixed(2)} KB`
                          : "N/A"}
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
                        {data?.status}
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
                        {moment(data?.createdAt).format("DD/MM/YYYY hh:mm A")}
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
                        {data?.completedAt
                          ? moment(data?.completedAt).format(
                              "DD/MM/YYYY hh:mm A",
                            )
                          : "-"}
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
                        {formattedDuration ? formattedDuration : "Running"}
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
                        {data?.lastUpdatedAt
                          ? moment(data?.lastUpdatedAt).format(
                              "DD/MM/YYYY hh:mm A",
                            )
                          : "-"}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  {/* --- NEW: This is the new cell for the view action --- */}
                  <Index.TableCell
                    className="table-td"
                    sx={{ justifyContent: "center" }}
                  >
                    {permissions?.includes("multifirmware_view") && (
                      <Index.Box className="admin-table-data-btn-flex">
                        <Index.Tooltip
                          title="View"
                          arrow
                          placement="bottom"
                          className="admin-tooltip"
                        >
                          <Index.Button
                            className="admin-table-data-btn"
                            onClick={() => {
                              handleDrawerOpen(transformHistory(data)); // Open drawer with the first history item
                            }}
                          >
                            <img
                              src={PagesIndex.Svg.yelloweye}
                              className="admin-icon"
                              alt="View"
                            />
                          </Index.Button>
                        </Index.Tooltip>
                        <Index.Tooltip
                          title="Stop"
                          arrow
                          placement="bottom"
                          className="admin-tooltip"
                        >
                          <Index.Button
                            className="admin-table-data-btn"
                            disabled={
                              data?.status.includes("Completed") ||
                              data?.status.includes("Failed") ||
                              data?.status.includes("Stopped")
                            }
                            onClick={() => {
                              handleStop(data?.id); // Open drawer with the first history item
                            }}
                          >
                            <img
                              src={PagesIndex.Svg.stop}
                              className="admin-icon"
                              alt="Stop"
                            />
                          </Index.Button>
                        </Index.Tooltip>
                      </Index.Box>
                    )}
                  </Index.TableCell>
                </Index.TableRow>
              );
            })}
          </DataTable>
        </Index.Box>
      </Index.Box>

      {/* --- NEW: This is the new Drawer component for viewing status --- */}
      <Drawer
        anchor="right"
        open={drawerState.open}
        onClose={handleDrawerClose}
        sx={{
          "& .MuiDrawer-paper": {
            width: "100%",
            maxWidth: "450px",
            background: "linear-gradient(to bottom, #f0f4f8, #ffffff)",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            borderLeft: "1px solid #E5E7EB",
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            overflowY: "auto",
          },
        }}
      >
        <Index.Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          <Index.Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: "bold" }}
          >
            Update Status
          </Index.Typography>
          <IconButton onClick={handleDrawerClose} aria-label="close drawer">
            <CloseIcon />
          </IconButton>
        </Index.Box>
        <FuotaStatusStepper data={drawerState.data} />
      </Drawer>

      <Index.Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className="admin-modal"
      >
        <Index.Box
          sx={style}
          className="admin-add-user-modal-inner-main admin-modal-inner"
        >
          <Index.Box className="admin-modal-header">
            <Index.Typography
              id="modal-modal-title"
              className="admin-modal-title"
              variant="h6"
              component="h2"
            >
              Upload For Fuota
            </Index.Typography>
            <Index.Button className="modal-close-btn" onClick={handleClose}>
              <span>
                <img
                  src={PagesIndex.Svg.closeblack}
                  className="admin-modal-close-icon"
                  alt="Close"
                />
              </span>
            </Index.Button>
          </Index.Box>
          <PagesIndex.Formik
            enableReinitialize
            initialValues={initialValuesMulti}
            validationSchema={PagesIndex.uploadFuotaValidationSchema}
            onSubmit={handleSubmitGroup}
          >
            {({
              values,
              errors,
              touched,
              setFieldValue,
              setFieldTouched,
              handleChange,
              handleSubmit,
            }) => (
              <PagesIndex.Form onSubmit={handleSubmit}>
                <Index.Box className="modal-body">
                  <Index.Box className="admin-modal-hgt-scroll cus-scrollbar">
                    <Index.Box className="admin-file-upload-btn-main">
                      <Index.Box className="admin-input-box admin-add-user-input">
                        <Index.FormHelperText className="admin-form-lable">
                          Select Block
                        </Index.FormHelperText>
                        <Index.Box className="admin-dropdown-box">
                          <Index.FormControl className="admin-form-control admin-drop-form-control">
                            <Index.Select
                              className="admin-dropdown-select admin-drop-select"
                              name="block"
                              value={values?.block}
                              onChange={(e) => {
                                handleChange(e);
                              }}
                              displayEmpty
                              inputProps={{ "aria-label": "Without label" }}
                              renderValue={
                                values?.block ? undefined : () => "Select Block"
                              }
                            >
                              {group?.map((data) => {
                                return (
                                  <Index.MenuItem
                                    value={data?.id}
                                    className="admin-drop-menuitem"
                                  >
                                    {data?.name}
                                  </Index.MenuItem>
                                );
                              })}
                            </Index.Select>
                          </Index.FormControl>
                          <Index.FormHelperText error>
                            {touched.block && errors.block
                              ? errors.block
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                      <Index.Box
                        className="admin-input-box admin-add-user-input"
                        style={{ marginBottom: "10px" }}
                      >
                        <Index.FormHelperText className="admin-form-lable">
                          Chunk Size
                        </Index.FormHelperText>
                        <Index.Box className="admin-dropdown-box">
                          <Index.TextField
                            fullWidth
                            type="number"
                            name="percentage"
                            placeholder="Enter number"
                            variant="outlined"
                            value={values?.percentage}
                            onChange={handleChange}
                            onBlur={(e) => {
                              let val = parseInt(e.target.value, 10);
                              if (val > 99) setFieldValue("percentage", 99);
                              if (val < 1 && val !== "")
                                setFieldValue("percentage", 1);
                            }}
                            // Inline styling to match the Select box appearance
                            InputProps={{
                              style: {
                                height: "38px", // Standardize height
                              },
                            }}
                            inputProps={{
                              min: 1,
                              max: 99,
                              style: {
                                padding: "10px 14px", // Ensure text isn't cramped
                                fontSize: "14px",
                              },
                            }}
                            error={
                              touched.percentage && Boolean(errors.percentage)
                            }
                          />
                        </Index.Box>

                        <Index.FormHelperText
                          error
                          style={{ marginTop: "4px" }}
                        >
                          {touched.percentage && errors.percentage
                            ? errors.percentage
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                      <Index.Box
                        className="admin-input-box admin-add-user-input"
                        style={{ marginBottom: "5px" }}
                      >
                        <Index.FormHelperText className="admin-form-lable">
                          Select File
                        </Index.FormHelperText>

                        <Index.Box
                          className="admin-dropdown-box"
                          style={{
                            border: "1px solid #ced4da",
                            borderRadius: "8px",
                            padding: "8px 14px",
                            backgroundColor: "#fff",
                            display: "flex",
                            alignItems: "center",
                            height: "40px", // Matches the height of your Select and Number inputs
                            position: "relative",
                            cursor: "pointer",
                          }}
                        >
                          {/* Hidden native input, but covers the entire box area */}
                          <input
                            accept=".bin"
                            type="file"
                            id="file-upload"
                            onChange={(e) => {
                              const file = e.currentTarget.files?.[0];
                              if (file) {
                                setFieldValue("file", file);
                                setFieldTouched("file", false);
                              }
                            }}
                          />

                          {/* Display Area for Selected Filename */}
                          <Index.Box
                            style={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                            }}
                          ></Index.Box>
                        </Index.Box>

                        <Index.FormHelperText
                          error
                          style={{ marginTop: "4px" }}
                        >
                          {errors?.file &&
                          touched?.file &&
                          typeof errors.file === "string"
                            ? errors?.file
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
                <Index.Box className="admin-modal-footer">
                  <Index.Box className="admin-modal-user-btn-flex">
                    <Index.Box className="admin-discard-btn-main border-btn-main">
                      <Index.Button className="admin-discard-user-btn border-btn">
                        Discard
                      </Index.Button>
                    </Index.Box>
                    <Index.Box className="admin-save-btn-main btn-main-primary">
                      <PagesIndex.PrimaryButton
                        type="submit"
                        className="admin-save-user-btn btn-primary"
                        btnLabel={
                          <>
                            {buttonSpinner ? (
                              <PagesIndex.Spinner />
                            ) : (
                              <>
                                <img
                                  src={PagesIndex.Svg.save}
                                  className="admin-user-save-icon"
                                  alt="Save"
                                ></img>
                                <span>Upload</span>
                              </>
                            )}
                          </>
                        }
                      />
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </PagesIndex.Form>
            )}
          </PagesIndex.Formik>
        </Index.Box>
      </Index.Modal>
    </>
  );
}
