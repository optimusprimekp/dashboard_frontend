import { CircularProgress } from "@mui/material";
import React, { useCallback, useContext, useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import DataTable from "../../../../component/common/dataTable/DataTable";
import { useNavigate } from "react-router-dom";
import PageIndex from "../../../../component/PagesIndex";

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

export default function SiteManagementList() {
  const { profile } = useContext(PageIndex.ProfileContext);
  const permissions = profile?.Role?.permissions || [];
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [id, setId] = useState("");
  const [selectedData, setSelectedData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);

  const initialValues = {
    name: id ? selectedData?.name : "",
    mwp: id ? selectedData?.mwp : "",
    client_name: id ? selectedData?.clientName : "",
    location: id ? selectedData?.location : "",
    latitude: id ? selectedData?.latitude : "",
    longitude: id ? selectedData?.longitude : "",
    om_name: id ? selectedData?.omName : "",
    om_contact: id ? selectedData?.omMobile : "",
    om_email: id ? selectedData?.omEmail : "",
    om_employee_id: id ? selectedData?.omEmpId : "",
    maintenance_name: id ? selectedData?.maintenanceName : "",
    maintenance_contact: id ? selectedData?.maintenanceMobile : "",
    maintenance_email: id ? selectedData?.maintenanceEmail : "",
    maintenance_employee_id: id ? selectedData?.maintenanceEmpId : "",
    total_inverter: id ? selectedData?.totalInverters : "",
    total_blocks: id ? selectedData?.totalBlocks : "",
  };

  // add user modal
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setId("");
    setOpen(false);
  };

  // delete modal
  const [openDelete, setOpenDelete] = useState(false);
  const handleOpenDelete = () => setOpenDelete(true);
  const handleCloseDelete = () => setOpenDelete(false);

  // filter
  const [state, setState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const getList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_ADD_EDIT_SITE
      );
      if (res.status === 200) {
        setData(res?.data);
        setFilterData(res?.data);
      } else {
        PagesIndex.toasterError(res?.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    getList();
  }, [getList]);

  const handleSubmit = async (values) => {
    const urlencoded = new URLSearchParams();
    urlencoded.append("name", values?.name);
    urlencoded.append("mwp", values?.mwp);
    urlencoded.append("clientName", values?.client_name);
    urlencoded.append("location", values?.location);
    urlencoded.append("latitude", values?.latitude);
    urlencoded.append("longitude", values?.longitude);
    urlencoded.append("omName", values?.om_name);
    urlencoded.append("omMobile", values?.om_contact);
    urlencoded.append("omEmail", values?.om_email);
    urlencoded.append("omEmpId", values?.om_employee_id);
    urlencoded.append("maintenanceName", values?.maintenance_name);
    urlencoded.append("maintenanceMobile", values?.maintenance_contact);
    urlencoded.append("maintenanceEmail", values?.maintenance_email);
    urlencoded.append("maintenanceEmpId", values?.maintenance_employee_id);
    urlencoded.append("totalInverters", values?.total_inverter);
    urlencoded.append("totalBlocks", values?.total_blocks);
    if (id) {
      urlencoded.append("id", id);
    }
    setButtonSpinner(true);
    try {
      const res = await PagesIndex.apiPostHandler(
        PagesIndex.Api.GET_ADD_EDIT_SITE,
        urlencoded
      );
      setButtonSpinner(false);
      if (res.status === 200 || res.status === 201) {
        getList();
        handleClose();
        PagesIndex.toasterSuccess(res?.message);
      } else {
        PagesIndex.toasterError(res?.message);
        setButtonSpinner(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleDelete = async () => {
    setButtonSpinner(true);
    try {
      const res = await PagesIndex.apiDeleteHandler(
        PagesIndex.Api.GET_ADD_EDIT_SITE,
        id
      );

      setButtonSpinner(false);
      if (res.status === 200) {
        getList();
        handleCloseDelete();
        PagesIndex.toasterSuccess(res?.message);
      } else {
        PagesIndex.toasterError(res?.message);
        setButtonSpinner(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const requestSearch = (e) => {
    const value = e?.target?.value ?? "";
    setSearchValue(value);
    const lower = value.toLowerCase();
    const result = data.filter(
      (row) =>
        row?.name?.toLowerCase().includes(lower) ||
        row?.email?.toLowerCase().includes(lower)
    );
    setCurrentPage(1);
    setFilterData(result);
  };

  const handleViewSiteData = (siteData) => {
    navigate("/admin/view-site", {
      state: siteData,
    });
  };
  return (
    <>
      {loading ? (
        <Index.Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px", // Adjust as needed
          }}
        >
          <CircularProgress />
        </Index.Box>
      ) : (
        <Index.Box className="admin-dashboard-content admin-user-list-content">
          <Index.Box className="admin-user-list-flex admin-page-title-main">
            <Index.Typography
              className="admin-page-title admin-user-list-page-title"
              component="h2"
              variant="h2"
            >
              Site List
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
              <Index.Box className="admin-userlist-inner-btn-flex">
                <Index.Box className="admin-export-btn-main border-btn-main">
                  <Index.Button
                    className="admin-export-btn border-btn"
                    onClick={handleOpenDelete}
                  >
                    <img
                      src={PagesIndex.Svg.down}
                      className="admin-down-icon admin-icon"
                      alt="download"
                    />
                    Export
                  </Index.Button>
                </Index.Box>
                {permissions?.includes("site_add") && (
                  <Index.Box className="admin-adduser-btn-main btn-main-primary">
                    <Index.Button
                      className="admin-adduser-btn btn-primary"
                      onClick={handleOpen}
                    >
                      <img
                        src={PagesIndex.Svg.plus}
                        className="admin-plus-icon"
                        alt="plus"
                      />
                      Add Site
                    </Index.Button>
                  </Index.Box>
                )}
              </Index.Box>
            </Index.Box>
          </Index.Box>

          <Index.Box className="card-border common-card">
            <DataTable
              headerData={[
                { field: "Sr. No." },
                { field: "Site Name" },
                { field: "MWp" },
                { field: "Client Name" },
                { field: "Location" },
                { field: "GPS Coordinates" },
                { field: "O&M Contact" },
                { field: "Maintenance Contact" },
                { field: "Action", align: "center" },
              ]}
              filterData={filterData.length}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            >
              {filterData
                ?.slice((currentPage - 1) * 10, (currentPage - 1) * 10 + 10)
                ?.map((data, i) => {
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
                        scope="row"
                        className="table-td"
                      >
                        <Index.Box className="admin-table-data-flex">
                          <Index.Typography className="admin-table-data-text">
                            {data?.mwp}
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
                            {data?.clientName}
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
                            {data?.location}
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
                            {data?.latitude} ,{data?.longitude}
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
                            {data?.omName} - {data?.omMobile}
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
                            {data?.maintenanceName} - {data?.maintenanceMobile}
                          </Index.Typography>
                        </Index.Box>
                      </Index.TableCell>
                      <Index.TableCell
                        component="td"
                        variant="td"
                        className="table-td"
                      >
                        <Index.Box
                          className="admin-table-data-btn-flex"
                          sx={{ justifyContent: "center" }}
                        >
                          {permissions?.includes("site_edit") && (
                            <Index.Tooltip
                              title="Edit"
                              arrow
                              placement="bottom"
                              className="admin-tooltip"
                            >
                              <Index.Button
                                className="admin-table-data-btn"
                                onClick={() => {
                                  handleOpen();
                                  setId(data?.id);
                                  setSelectedData(data);
                                }}
                              >
                                <img
                                  src={PagesIndex.Svg.blueedit}
                                  className="admin-icon"
                                  alt="Edit"
                                />
                              </Index.Button>
                            </Index.Tooltip>
                          )}

                          {permissions?.includes("site_view") && (
                            <Index.Tooltip
                              title="View"
                              arrow
                              placement="bottom"
                              className="admin-tooltip"
                            >
                              <Index.Button
                                className="admin-table-data-btn"
                                onClick={() => {
                                  handleViewSiteData(data);
                                }}
                              >
                                <img
                                  src={PagesIndex.Svg.yelloweye}
                                  className="admin-icon"
                                  alt="View"
                                />
                              </Index.Button>
                            </Index.Tooltip>
                          )}

                          {permissions?.includes("site_delete") && (
                            <Index.Tooltip
                              title="Delete"
                              arrow
                              placement="bottom"
                              className="admin-tooltip"
                            >
                              <Index.Button
                                className="admin-table-data-btn"
                                onClick={() => {
                                  handleOpenDelete();
                                  setId(data?.id);
                                }}
                              >
                                <img
                                  src={PagesIndex.Svg.trash}
                                  className="admin-icon"
                                  alt="Trash"
                                />
                              </Index.Button>
                            </Index.Tooltip>
                          )}
                        </Index.Box>
                      </Index.TableCell>
                    </Index.TableRow>
                  );
                })}
            </DataTable>
          </Index.Box>
        </Index.Box>
      )}

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
              {id ? "Edit" : "Add"} Site
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
            initialValues={initialValues}
            validationSchema={PagesIndex.siteSchema}
            onSubmit={handleSubmit}
          >
            {({
              values,
              errors,
              touched,
              setFieldValue,
              handleChange,
              handleSubmit,
            }) => (
              <PagesIndex.Form onSubmit={handleSubmit}>
                <Index.Box className="modal-body">
                  <Index.Box className="admin-modal-hgt-scroll cus-scrollbar">
                    {/* Site Info */}
                    <div className="form-row">
                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Name
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="name"
                            name="name"
                            value={values?.name}
                            placeholder="Enter Name"
                            onChange={handleChange}
                            inputProps={{ maxLength: 30 }}
                          />
                          <Index.FormHelperText error>
                            {touched.name && errors.name ? errors.name : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>

                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          MWP
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="mwp"
                            name="mwp"
                            value={values?.mwp}
                            placeholder="Enter MWP"
                            onChange={(event) => {
                              const { value } = event.target;
                              const numericPattern =
                                /^(?!0(\.0{1,2})?$)(\d+(\.\d{0,2})?)?$/;
                              if (numericPattern.test(value)) {
                                const numericValue = parseFloat(value);
                                if (numericValue >= 1 || value === "") {
                                  setFieldValue("mwp", value);
                                }
                              } else if (value === "") {
                                setFieldValue("mwp", "");
                              }
                            }}
                            inputProps={{ maxLength: 8 }}
                          />
                          <Index.FormHelperText error>
                            {touched.mwp && errors.mwp ? errors.mwp : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    </div>
                    <div className="form-row">
                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Client Name
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="client_name"
                            name="client_name"
                            value={values?.client_name}
                            placeholder="Enter Client Name"
                            onChange={handleChange}
                            inputProps={{ maxLength: 30 }}
                          />
                          <Index.FormHelperText error>
                            {touched.client_name && errors.client_name
                              ? errors.client_name
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>

                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Location
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="location"
                            name="location"
                            value={values?.location}
                            placeholder="Enter Location"
                            onChange={handleChange}
                            inputProps={{ maxLength: 50 }}
                          />
                          <Index.FormHelperText error>
                            {touched.location && errors.location
                              ? errors.location
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    </div>
                    <div className="form-row">
                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Latitude
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="latitude"
                            name="latitude"
                            value={values?.latitude}
                            placeholder="Enter Latitude"
                            onChange={(event) => {
                              const { value } = event.target;
                              const numericPattern =
                                /^[-+]?([1-8]?\d(\.\d{0,6})?|90(\.0{0,6})?)?,?\s*[-+]?((1[0-7]\d|1[0-7]|[1-9]?\d)(\.\d{0,6})?|180(\.0{0,6})?)?$/;
                              if (numericPattern.test(value)) {
                                setFieldValue("latitude", value);
                              }
                            }}
                            inputProps={{ maxLength: 10 }}
                          />
                          <Index.FormHelperText error>
                            {touched.latitude && errors.latitude
                              ? errors.latitude
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>

                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Longitude
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="longitude"
                            name="longitude"
                            value={values?.longitude}
                            placeholder="Enter Longitude"
                            onChange={(event) => {
                              const { value } = event.target;
                              const numericPattern =
                                /^[-+]?([1-8]?\d(\.\d{0,6})?|90(\.0{0,6})?)?,?\s*[-+]?((1[0-7]\d|1[0-7]|[1-9]?\d)(\.\d{0,6})?|180(\.0{0,6})?)?$/;
                              if (numericPattern.test(value)) {
                                setFieldValue("longitude", value);
                              }
                            }}
                            inputProps={{ maxLength: 10 }}
                          />
                          <Index.FormHelperText error>
                            {touched.longitude && errors.longitude
                              ? errors.longitude
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    </div>
                    {/* Other Info */}
                    <div className="form-row">
                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Total Invertors
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="total_inverter"
                            name="total_inverter"
                            value={values?.total_inverter}
                            placeholder="Enter Total Invertors"
                            onChange={(event) => {
                              const { value } = event.target;
                              const numericPattern =
                                /^(?!0(\.0{1,2})?$)(\d+(\.\d{0,2})?)?$/;
                              if (numericPattern.test(value)) {
                                const numericValue = parseFloat(value);
                                if (numericValue >= 1 || value === "") {
                                  setFieldValue("total_inverter", value);
                                }
                              } else if (value === "") {
                                setFieldValue("total_inverter", "");
                              }
                            }}
                            inputProps={{ maxLength: 5 }}
                          />
                          <Index.FormHelperText error>
                            {touched.total_inverter && errors.total_inverter
                              ? errors.total_inverter
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>

                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Total Blocks
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="total_blocks"
                            name="total_blocks"
                            value={values?.total_blocks}
                            placeholder="Enter Total Blocks"
                            onChange={(event) => {
                              const { value } = event.target;
                              const numericPattern =
                                /^(?!0(\.0{1,2})?$)(\d+(\.\d{0,2})?)?$/;
                              if (numericPattern.test(value)) {
                                const numericValue = parseFloat(value);
                                if (numericValue >= 1 || value === "") {
                                  setFieldValue("total_blocks", value);
                                }
                              } else if (value === "") {
                                setFieldValue("total_blocks", "");
                              }
                            }}
                            inputProps={{ maxLength: 5 }}
                          />
                          <Index.FormHelperText error>
                            {touched.total_blocks && errors.total_blocks
                              ? errors.total_blocks
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    </div>

                    {/* O&M Section */}
                    <div className="section-title">O&amp;M Contact</div>
                    <div className="form-row">
                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Name
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="om_name"
                            name="om_name"
                            value={values?.om_name}
                            placeholder="Enter Name"
                            onChange={handleChange}
                            inputProps={{ maxLength: 30 }}
                          />
                          <Index.FormHelperText error>
                            {touched.om_name && errors.om_name
                              ? errors.om_name
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>

                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Mobile No.
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="om_contact"
                            name="om_contact"
                            value={values?.om_contact}
                            placeholder="Enter Mobile No."
                            onChange={(e) => {
                              const onlyNums = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                              handleChange({
                                target: {
                                  name: "om_contact",
                                  value: onlyNums,
                                },
                              });
                            }}
                            inputProps={{ maxLength: 10 }}
                          />
                          <Index.FormHelperText error>
                            {touched.om_contact && errors.om_contact
                              ? errors.om_contact
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    </div>
                    <div className="form-row">
                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Email
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="om_email"
                            name="om_email"
                            value={values?.om_email}
                            placeholder="Enter Email"
                            onChange={handleChange}
                          />
                          <Index.FormHelperText error>
                            {touched.om_email && errors.om_email
                              ? errors.om_email
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>

                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Employee ID.
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="om_employee_id"
                            name="om_employee_id"
                            value={values?.om_employee_id}
                            placeholder="Enter Employee ID."
                            onChange={handleChange}
                            inputProps={{ maxLength: 10 }}
                          />
                          <Index.FormHelperText error>
                            {touched.om_employee_id && errors.om_employee_id
                              ? errors.om_employee_id
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    </div>

                    {/* Maintenance Section */}
                    <div className="section-title">Maintenance Contact</div>
                    <div className="form-row">
                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Name
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="maintenance_name"
                            name="maintenance_name"
                            value={values?.maintenance_name}
                            placeholder="Enter Name"
                            onChange={handleChange}
                            inputProps={{ maxLength: 30 }}
                          />
                          <Index.FormHelperText error>
                            {touched.maintenance_name && errors.maintenance_name
                              ? errors.maintenance_name
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>

                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Mobile No.
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="maintenance_contact"
                            name="maintenance_contact"
                            value={values?.maintenance_contact}
                            placeholder="Enter Mobile No."
                            onChange={(e) => {
                              const onlyNums = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                              handleChange({
                                target: {
                                  name: "maintenance_contact",
                                  value: onlyNums,
                                },
                              });
                            }}
                            inputProps={{ maxLength: 10 }}
                          />
                          <Index.FormHelperText error>
                            {touched.maintenance_contact &&
                            errors.maintenance_contact
                              ? errors.maintenance_contact
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    </div>
                    <div className="form-row">
                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Email
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="maintenance_email"
                            name="maintenance_email"
                            value={values?.maintenance_email}
                            placeholder="Enter Email"
                            onChange={handleChange}
                          />
                          <Index.FormHelperText error>
                            {touched.maintenance_email &&
                            errors.maintenance_email
                              ? errors.maintenance_email
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>

                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Employee ID
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="maintenance_employee_id"
                            name="maintenance_employee_id"
                            value={values?.maintenance_employee_id}
                            placeholder="Enter Employee ID"
                            onChange={handleChange}
                            inputProps={{ maxLength: 10 }}
                          />
                          <Index.FormHelperText error>
                            {touched.maintenance_employee_id &&
                            errors.maintenance_employee_id
                              ? errors.maintenance_employee_id
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    </div>
                  </Index.Box>
                </Index.Box>
                <Index.Box className="admin-modal-footer">
                  <Index.Box className="admin-modal-user-btn-flex">
                    <Index.Box className="admin-discard-btn-main border-btn-main">
                      <Index.Button
                        className="admin-discard-user-btn border-btn"
                        onClick={handleClose}
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
                                ></img>
                                <span>Save</span>
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

      <PagesIndex.PopupModal
        open={openDelete}
        handleClose={handleCloseDelete}
        handleFunction={handleDelete}
        buttonSpinner={buttonSpinner}
      />
    </>
  );
}
