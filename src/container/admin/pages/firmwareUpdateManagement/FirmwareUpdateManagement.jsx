import {
  styled,
  Drawer,
  IconButton,
  Autocomplete,
  TextField as MuiTextField,
  FormHelperText,
} from "@mui/material"; // Added Autocomplete, MuiTextField, and FormHelperText
import React, { useCallback, useContext, useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import PageIndex from "../../../../component/PagesIndex";
import DataTable from "../../../../component/common/dataTable/DataTable";
import moment from "moment";
import CloseIcon from "@mui/icons-material/Close";
import * as Yup from "yup"; // Imported Yup for validation schema

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
  if (!Array.isArray(historyData) || historyData.length === 0) {
    return (
      <Index.Box sx={{ p: 4, textAlign: "center" }}>
        <Index.Typography color="text.secondary">
          No status history available for this update.
        </Index.Typography>
      </Index.Box>
    );
  }

  // The last step in the history array is the current "active" step
  const activeIndex = historyData.length - 1;

  const getStepIcon = (index) => {
    const isActive = index === activeIndex;
    const isCompleted = index < activeIndex;

    // Check if the active step indicates a failure
    const isFailed =
      historyData[index]?.status.toLowerCase().includes("fail") && isActive;

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
          {" "}
          {/* Completed Color */}
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
      {historyData.map((step, index) => {
        const isCompleted = index < activeIndex;
        const isActive = index === activeIndex;

        return (
          <Index.Box
            key={index}
            sx={{
              display: "flex",
              position: "relative",
              mb: index === historyData.length - 1 ? 0 : 4,
            }}
          >
            {index < historyData.length - 1 && (
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

export default function FuotaManagementList() {
  const { profile } = useContext(PageIndex.ProfileContext);
  const permissions = profile?.Role?.permissions || [];
  const [data, setData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [selectedRobots, setSelectedRobots] = useState([]);
  const [lastoffset, setLastoffset] = useState(0);

  // --- NEW: State for the side drawer ---
  const [drawerState, setDrawerState] = useState({
    open: false,
    data: null,
  });

  // --- NEW: State for the device list dropdown ---
  const [deviceList, setDeviceList] = useState([]);

  // --- MODIFIED: Initial values for the single/multi-upload modal form ---
  const initialValues = {
    deviceIds: [],
    file: null,
    percentage: "",
  };

  // --- NEW: Validation schema for the multi-device upload ---
  const uploadFuotaValidationSchemaSingle = Yup.object({
    deviceIds: Yup.array()
      .of(Yup.string().required())
      .min(1, "Please select at least one device")
      .max(5, "You can select a maximum of 5 devices")
      .required("Device selection is required"),
    file: Yup.mixed().required("A file is required").nullable(),
    percentage: Yup.number()
      .required("Value is required")
      .positive("Must be greater than 0")
      .max(99, "Must be less than 100")
      .typeError("Must be a number"),
  });
  // upload modal
  const [openSingle, setOpenSingle] = useState(false);
  const handleOpenSingle = () => setOpenSingle(true);
  const handleCloseSingle = () => setOpenSingle(false);

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
        PagesIndex.Api.GET_ADD_EDIT_DEVICES + "/fuota/history"
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

  // --- NEW: Function to fetch the list of devices for the dropdown ---
  const getDeviceList = useCallback(async () => {
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_ADD_EDIT_DEVICES + "/multicast"
      );
      if (res?.status === 200 && Array.isArray(res?.data)) {
        setDeviceList(res?.data);
      } else {
        setDeviceList([]);
        PagesIndex.toasterError("Could not load the device list.");
      }
    } catch (error) {
      console.error("Error fetching device list:", error);
      PagesIndex.toasterError("An error occurred while fetching devices.");
    }
  }, []);

  useEffect(() => {
    getList();
    getDeviceList(); // Fetch devices on component mount

    const intervalId = setInterval(() => {
      getList();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [getList, getDeviceList]); // Added getDeviceList to dependency array

  // --- MODIFIED: Handles submission for one or more devices (up to 5) ---
  const handleSubmitSingle = async (values) => {
    setButtonSpinner(true);

    const uploadPromises = values.deviceIds.map((deviceId) => {
      const formData = new FormData();
      formData.append("deviceId", deviceId);
      formData.append("file", values.file);
      formData.append("chunkSize", values.percentage);

      return PagesIndex.apiPostHandler(
        PagesIndex.Api.GET_ADD_EDIT_DEVICES + "/fuota",
        formData
      );
    });

    try {
      const results = await Promise.allSettled(uploadPromises);
      let successCount = 0;
      const errorMessages = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value?.status) {
          successCount++;
        } else {
          const deviceId = values.deviceIds[index];
          const deviceName =
            deviceList.find((d) => d.devEui === deviceId)?.name || deviceId;
          const errorMessage =
            result.reason?.response?.data?.message ||
            result.value?.message ||
            "Upload failed";
          errorMessages.push(`Device ${deviceName}: ${errorMessage}`);
        }
      });

      if (successCount > 0) {
        PagesIndex.toasterSuccess(
          `${successCount} FUOTA process(es) started successfully.`
        );
        getList();
        handleCloseSingle();
      }

      if (errorMessages.length > 0) {
        // Display multiple errors in a more readable format
        const errorContent = (
          <div style={{ textAlign: "left" }}>
            <strong>
              Failed to start updates for {errorMessages.length} device(s):
            </strong>
            <ul style={{ paddingLeft: "20px", margin: "5px 0 0 0" }}>
              {errorMessages.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        );
        PagesIndex.toasterError(errorContent);
      }
    } catch (error) {
      PagesIndex.toasterError(
        "An unexpected error occurred during the bulk submission."
      );
      console.error(error);
    } finally {
      setButtonSpinner(false);
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
            Unicast FUOTA List
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
            {permissions.includes("firmware_add") && (
              <Index.Box className="admin-adduser-btn-main btn-main-primary">
                <Index.Button
                  className="admin-adduser-btn btn-primary"
                  onClick={handleOpenSingle}
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
              { field: "Device Name" },
              { field: "Site Name" },
              { field: "Device Id" },
              { field: "File Name" },
              { field: "Progress" },
              { field: "File Size" },
              { field: "Status" },
              { field: "Start On" },
              { field: "Completed On" },
              { field: "Duration" },
              { field: "Last Update On" },
              { field: "Actions" }, // <-- MODIFIED: Added Actions header
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
                        {data?.device?.name}
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
                        {data?.device?.site?.name}
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
                        {data.deviceId}
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
                        {data.filename}
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
                          data.totalChunks > 0
                            ? (data.lastOffset * 100) / data.totalChunks + 1
                            : 0
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
                          ? `${(data.fileSize / 1024).toFixed(2)} KB`
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
                        {data.status}
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
                        {data.completedAt
                          ? moment(data?.completedAt).format(
                              "DD/MM/YYYY hh:mm A"
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
                        {moment(data?.lastUpdatedAt).format(
                          "DD/MM/YYYY hh:mm A"
                        )}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  {/* --- NEW: This is the new cell for the view action --- */}
                  <Index.TableCell
                    className="table-td"
                    sx={{ justifyContent: "center" }}
                  >
                    {permissions?.includes("firmware_view") && (
                      <Index.Box className="admin-table-data-btn-flex">
                        <Index.Tooltip
                          title="Edit"
                          arrow
                          placement="bottom"
                          className="admin-tooltip"
                        >
                          <Index.Button
                            className="admin-table-data-btn"
                            onClick={() => {
                              handleDrawerOpen(data?.history); // Open drawer with the first history item
                            }}
                          >
                            <img
                              src={PagesIndex.Svg.yelloweye}
                              className="admin-icon"
                              alt="Edit"
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

      {/* --- MODIFIED MODAL FOR SINGLE/MULTI-DEVICE UPLOAD --- */}
      <Index.Modal
        open={openSingle}
        onClose={handleCloseSingle}
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
            <Index.Button
              className="modal-close-btn"
              onClick={handleCloseSingle}
            >
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
            initialValues={initialValues}
            validationSchema={uploadFuotaValidationSchemaSingle}
            onSubmit={handleSubmitSingle}
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
                    {/* --- REDESIGNED Device Selector --- */}
                    <Index.Box
                      className="admin-input-box admin-modal-input-box"
                      sx={{ mb: 3 }}
                    >
                      <FormHelperText className="admin-form-lable">
                        Select Devices (up to 5)
                      </FormHelperText>
                      <Autocomplete
                        multiple
                        id="device-selection"
                        options={deviceList}
                        getOptionLabel={(option) =>
                          `${option.name || "Unnamed Device"} (${
                            option.devEui
                          })`
                        }
                        value={values.deviceIds
                          .map((id) => deviceList.find((d) => d.devEui === id))
                          .filter(Boolean)}
                        onChange={(event, newValue) => {
                          if (newValue.length <= 5) {
                            setFieldValue(
                              "deviceIds",
                              newValue.map((item) => item.devEui)
                            );
                          }
                        }}
                        getOptionDisabled={(option) =>
                          values.deviceIds.length >= 5 &&
                          !values.deviceIds.includes(option.devEui)
                        }
                        renderTags={(value, getTagProps) =>
                          value
                            .map((option) => option.name || "Unnamed Device")
                            .join(", ")
                        }
                        renderInput={(params) => (
                          <MuiTextField
                            {...params}
                            // Removed conflicting className to restore default border
                            error={
                              touched.deviceIds && Boolean(errors.deviceIds)
                            }
                            helperText={touched.deviceIds && errors.deviceIds}
                          />
                        )}
                      />
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
                    {/* --- REDESIGNED File Input with Border --- */}
                    <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.Box
                        sx={{
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          padding: "6px 12px",
                          display: "inline-block",
                        }}
                      >
                        <input
                          accept=".bin"
                          type="file"
                          onChange={(e) => {
                            const file = e.currentTarget.files?.[0];
                            setFieldValue("file", file || null);
                            setFieldTouched("file", true);
                          }}
                        />
                      </Index.Box>
                      <FormHelperText error sx={{ mt: 1 }}>
                        {touched.file && errors.file ? errors.file : null}
                      </FormHelperText>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
                <Index.Box className="admin-modal-footer">
                  <Index.Box className="admin-modal-user-btn-flex">
                    <Index.Box className="admin-discard-btn-main border-btn-main">
                      <Index.Button
                        type="button"
                        onClick={handleCloseSingle}
                        className="admin-discard-user-btn border-btn"
                      >
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
                                />
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
