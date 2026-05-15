import { styled, SwipeableDrawer } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import DataTable from "../../../../component/common/dataTable/DataTable";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// for modal design

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
};

// for table data
const BpIcon = styled("span")(({ theme }) => ({
  borderRadius: 0,
  border: "1px solid #114A65",
  width: 16,
  height: 16,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  boxShadow: "none",
  backgroundColor: theme.palette.mode === "dark" ? "#394b59" : "transparent",
}));

const BpCheckedIcon = styled(BpIcon)({
  backgroundColor: "transparent",
  "&:before": {
    display: "block",
    width: 12,
    height: 12,
    backgroundImage:
      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
      " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
      "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23114A65'/%3E%3C/svg%3E\")",
    content: '""',
  },
  "input:hover ~ &": {
    backgroundColor: "transparent",
  },
});
function BpCheckbox(props) {
  return (
    <Index.Checkbox
      sx={{ "&:hover": { bgcolor: "transparent" } }}
      disableRipple
      color="default"
      checkedIcon={<BpCheckedIcon />}
      icon={<BpIcon />}
      inputProps={{ "aria-label": "Checkbox demo" }}
      {...props}
    />
  );
}

export default function FuotaManagementList() {
  const [data, setData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [selectedRobots, setSelectedRobots] = useState([]);
  const [groupId, setGroupId] = useState("");

  const initialValues = {
    devEui: "",
    file: "",
  };
  const initialValuesMulti = {
    file: "",
  };
  // upload modal
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [openSingle, setOpenSingle] = useState(false);
  const handleOpenSingle = () => setOpenSingle(true);
  const handleCloseSingle = () => setOpenSingle(false);

  const handleSelectRobot = (id) => {
    if (selectedRobots.includes(id)) {
      setSelectedRobots((prev) => prev.filter((robot) => robot !== id));
    } else if (selectedRobots?.length < 50) {
      setSelectedRobots((prev) => [...prev, id]);
    } else if (selectedRobots?.length === 50 && !selectedRobots.includes(id)) {
      PagesIndex.toasterError("You can select only 50 robots at a time");
    }
  };

  const getList = useCallback(async () => {
    // try {
    //   // const res = await PagesIndex.apiGetHandler(PagesIndex.Api.GET_USERS);
    //   const res = await axios.get(
    //     `${import.meta.env.VITE_CHIRPSTACK_BASE_URL}/${
    //       PagesIndex.Api.GET_CHIRP_STACK_DEVICE
    //     }`,
    //     {
    //       params: {
    //         limit: 20,
    //         offset: (currentPage - 1) * 20,
    //         applicationId: import.meta.env.VITE_ROBOT_APPLICATION_ID,
    //       },
    //       headers: {
    //         Authorization: `Bearer ${import.meta.env.VITE_CHIRPSTACK_TOKEN}`,
    //       },
    //     }
    //   );
    //   if (res?.status) {
    //     const deviceData = await PagesIndex.apiGetHandler(
    //       PagesIndex.Api.GET_CHIRP_STACK_DEVICE
    //     );
    //     const mergedDevices = res?.data?.result.map((device) => {
    //       const matchingDevice = deviceData?.data.find(
    //         (d) => d.devEui === device.devEui
    //       );
    //       return matchingDevice ? { ...device, ...matchingDevice } : device;
    //     });
    //     setData(mergedDevices);
    //     setFilterData(mergedDevices);
    //     setTotalCount(res?.data?.totalCount);
    //   } else {
    //     PagesIndex.toasterError(res?.message);
    //   }
    // } catch (error) {
    //   console.log(error);
    // }
  }, [currentPage]);

  useEffect(() => {
    getList();
  }, [getList]);

  const handleSubmitSingle = async (values) => {
    setButtonSpinner(true);
    const formData = new FormData();
    formData.append("deviceId", values?.devEui);
    formData.append("file", values?.file);
    try {
      const res = await PagesIndex.apiPostHandler(
        PagesIndex.Api.UNICAST_FUOTA,
        formData
      );
      if (res?.status) {
        getList();
        handleCloseSingle();
        PagesIndex.toasterSuccess("New device added successfully");
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
  const handleSubmitGroup = async (values) => {
    setButtonSpinner(true);
    const formData = new FormData();
    formData.append("file", values?.file);
    formData.append("multicastGroupId", groupId);
    try {
      const res = await PagesIndex.apiPostHandler(
        PagesIndex.Api.MULTICAST_FUOTA,
        formData
      );
      if (res?.status) {
        getList();
        handleCloseSingle();
        PagesIndex.toasterSuccess("New device added successfully");
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
      const res = await axios.get(
        `${import.meta.env.VITE_CHIRPSTACK_BASE_URL}/${
          PagesIndex.Api.MULTICAST_GROUPS
        }?limit=1&offset=0&serach=&applicationId=${
          import.meta.env.VITE_ROBOT_APPLICATION_ID
        }`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_CHIRPSTACK_TOKEN}`,
          },
        }
      );
      if (res?.status) {
        setGroupId(res?.data?.result?.[0]?.id);
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
  return (
    <>
      <Index.Box className="admin-dashboard-content admin-user-list-content">
        <Index.Box className="admin-user-list-flex admin-page-title-main">
          <Index.Typography
            className="admin-page-title admin-user-list-page-title"
            component="h2"
            variant="h2"
          >
            Fuota List
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
                Upload Single
              </Index.Button>
            </Index.Box>
          </Index.Box>
        </Index.Box>

        <Index.Box className="card-border common-card">
          <DataTable
            headerData={[{ field: "MAC Address" }, { field: "Last Update" }]}
            filterData={(totalCount * 1) / 2}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          >
            {filterData?.map((data) => {
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
                      <BpCheckbox
                        color="primary"
                        checked={selectedRobots.includes(data?.devEui)}
                        onChange={() => {
                          handleSelectRobot(data?.devEui);
                        }}
                        inputProps={{
                          "aria-label": "select all desserts",
                        }}
                      />
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
                        {data?.devEui}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                </Index.TableRow>
              );
            })}
          </DataTable>
        </Index.Box>
      </Index.Box>
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
            validationSchema={PagesIndex.uploadFuotaValidationSchema}
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
                    <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        Dev EUI
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          fullWidth
                          className="admin-form-control"
                          id="devEui"
                          name="devEui"
                          value={values?.devEui}
                          placeholder="Enter MAC Address"
                          onChange={handleChange}
                        />
                        <Index.FormHelperText error>
                          {touched.devEui && errors.devEui
                            ? errors.devEui
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="admin-file-upload-btn-main">
                      <Index.Box className="">
                        <input
                          accept=".bin"
                          type="file"
                          className="custome-file-control"
                          onChange={(e) => {
                            const file = e.currentTarget.files?.[0];
                            if (file) {
                              console.log(file);
                              setFieldValue("file", file);
                              setFieldTouched("file", false);
                            }
                          }}
                        />
                        {/* </Index.Button> */}
                        <Index.FormHelperText error>
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
                      <Index.Box className="">
                        <input
                          accept=".bin"
                          type="file"
                          className="custome-file-control"
                          onChange={(e) => {
                            const file = e.currentTarget.files?.[0];
                            if (file) {
                              console.log(file);
                              setFieldValue("file", file);
                              setFieldTouched("file", false);
                            }
                          }}
                        />
                        {/* </Index.Button> */}
                        <Index.FormHelperText error>
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
