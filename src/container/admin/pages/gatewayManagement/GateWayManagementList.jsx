import { CircularProgress, SwipeableDrawer } from "@mui/material";
import React, { useCallback, useContext, useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import DataTable from "../../../../component/common/dataTable/DataTable";
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

export default function GateWayManagementList() {
  const { profile } = useContext(PageIndex.ProfileContext);
  const permissions = profile?.Role?.permissions || [];
  const [data, setData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [siteListData, setSiteListData] = useState([]);
  const [tenant, setTenant] = useState([]);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [id, setId] = useState("");
  const [selectedData, setSelectedData] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);

  const initialValues = {
    gateway_eui: id ? selectedData?.gatewayEui : "",
    confirm_gateway_eui: id ? selectedData?.gatewayEui : "",
    gateway_name: id ? selectedData?.name : "",
    gateway_details: id ? selectedData?.description : "",
    site: id ? selectedData?.siteId : "",
    rf_region: id ? selectedData?.rfRegion : "IN865",
    model: id ? selectedData?.model : "",
    location: id ? selectedData?.location : "",
    latitude: id ? selectedData?.latitude : "",
    longitude: id ? selectedData?.longitude : "",
    commissioning_date: id ? selectedData?.commissioningDate : "",
    tenant_id: "", // Always empty initially
  };

  // add user modal
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = (resetForm) => {
    setOpen(false);
    setId("");
    setTenant({}); // Clear tenant object
    if (typeof resetForm === "function") {
      resetForm(); // Reset Formik form to initial values
    }
  };

  // delete modal
  const [openDelete, setOpenDelete] = useState(false);
  const handleOpenDelete = () => setOpenDelete(true);
  const handleCloseDelete = () => setOpenDelete(false);
  const [openDownload, setOpenDownload] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState({});
  // const handleOpenDownload = () => setOpenDownload(true);
  const handleCloseDownload = () => {
    setDownloadLinks({});
    setOpenDownload(false);
  };

  const getList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_ADD_EDIT_GATEWAYS
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
  const getSiteList = useCallback(async () => {
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_ADD_EDIT_SITE
      );
      if (res.status === 200) {
        setSiteListData(res?.data);
      } else {
        PagesIndex.toasterError(res?.message);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);
  const getTenant = useCallback(async (siteId, setFieldValue) => {
    if (!siteId) return;
    try {
      const res = await PagesIndex.apiGetHandler(
        `${PagesIndex.Api.CHIRPSTACK}/site/${siteId}`
      );
      if (res.status === 200) {
        setTenant(res?.data);
        // Auto-select if only one tenant
        if (res?.data?.length === 1) {
          setFieldValue("tenant_id", res.data.tenantId);
        }
      } else {
        PagesIndex.toasterError(res?.message);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);
  useEffect(() => {
    getList();
    getSiteList();
  }, [getList, getSiteList]);
  useEffect(() => {
    const intervalCall = setInterval(() => {
      getList();
    }, 30000);
    return () => {
      clearInterval(intervalCall);
    };
  }, [getList]);

  const handleSubmit = async (values) => {
    const payload = {
      siteId: values.site,
      name: values.gateway_name,
      description: values.gateway_details,
      gatewayEui: values.gateway_eui,
      rfRegion: values.rf_region,
      commissioningDate: values.commissioning_date,
      model: values.model,
      tenantId: values.tenant_id,
      location: values.location,
      latitude: values.latitude,
      longitude: values.longitude,
      status: "OFFLINE", // or values.status if you have a field for it
    };
    if (id) {
      payload.id = id; // Include id only if editing
    }
    setButtonSpinner(true);
    try {
      const res = await PagesIndex.apiPostHandler(
        PagesIndex.Api.GET_ADD_EDIT_GATEWAYS,
        payload
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
      setButtonSpinner(false);
      console.log(error);
    }
  };

  const handleDelete = async () => {
    setButtonSpinner(true);
    try {
      const res = await PagesIndex.apiDeleteHandler(
        PagesIndex.Api.GET_ADD_EDIT_GATEWAYS,
        id
      );
      setButtonSpinner(false);
      if (res.status === 200) {
        setId("");
        getList();
        handleCloseDelete();
        PagesIndex.toasterSuccess(res?.message);
      } else {
        PagesIndex.toasterError(res?.message);
        setButtonSpinner(false);
      }
    } catch (error) {
      setButtonSpinner(false);
      console.log(error);
    }
  };
  const requestSearch = useCallback(
    (e) => {
      const value = e?.target?.value ?? "";
      setSearchValue(value);
      const lower = value.toLowerCase();
      const result = data.filter(
        (row) =>
          row?.name?.toLowerCase().includes(lower) ||
          row?.gatewayId?.toLowerCase().includes(lower)
      );
      setCurrentPage(1);
      setFilterData(result);
    },
    [data]
  );
  return (
    <>
      <Index.Box className="admin-dashboard-content admin-user-list-content">
        <Index.Box className="admin-user-list-flex admin-page-title-main">
          <Index.Typography
            className="admin-page-title admin-user-list-page-title"
            component="h2"
            variant="h2"
          >
            Gateway List
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
              {permissions?.includes("gateway_add") && (
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
                    Add Gateway
                  </Index.Button>
                </Index.Box>
              )}
            </Index.Box>
          </Index.Box>
        </Index.Box>

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
          <Index.Box className="card-border common-card">
            <DataTable
              headerData={[
                { field: "Sr. No." },
                { field: "Gateway Name" },
                { field: "Gateway EUI" },
                { field: "Site Name" },
                { field: "Created  Date & Time" },
                { field: "Last Seen  Date & Time" },
                { field: "Model" },
                { field: "Status", align: "center" },
                { field: "Action", align: "center" },
              ]}
              filterData={filterData.length}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            >
              {filterData?.map((data, i) => {
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
                      className="table-td"
                    >
                      <Index.Box className="admin-table-data-flex">
                        <Index.Typography className="admin-table-data-text">
                          {data?.gatewayEui}
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
                          {siteListData.find((site) => site.id === data.siteId)
                            ?.name || "-"}
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
                          {PagesIndex.moment(data?.createdAt).format(
                            "DD/MM/YYYY hh:mm A"
                          )}
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
                          {PagesIndex.moment(data?.lastSeenAt).format(
                            "DD/MM/YYYY hh:mm A"
                          )}
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
                          {data?.model || "-"}
                        </Index.Typography>
                      </Index.Box>
                    </Index.TableCell>
                    <Index.TableCell
                      component="td"
                      variant="td"
                      className="table-td"
                    >
                      <Index.Box
                        className="admin-table-data-flex"
                        sx={{ justifyContent: "center" }}
                      >
                        <Index.Typography className="admin-table-data-text">
                          {data?.status === "ONLINE" ? (
                            <img
                              src={PagesIndex.Svg.online}
                              className="admin-status-icon"
                              alt="View"
                            />
                          ) : (
                            <img
                              src={PagesIndex.Svg.offline}
                              className="admin-status-icon"
                              alt="View"
                            />
                          )}
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
                        {/* <Index.Tooltip
                          title="Download"
                          arrow
                          placement="bottom"
                          className="admin-tooltip"
                        >
                          <Index.Button
                            className="admin-table-data-btn"
                            onClick={() => {
                              handleOpenDownload();
                              handleDownload(data?._id);
                            }}
                          >
                            <img
                              src={PagesIndex.Svg.down}
                              className="admin-icon"
                              alt="donwload"
                            />
                          </Index.Button>
                        </Index.Tooltip> */}

                        {/* <Index.Tooltip
                          title="View"
                          arrow
                          placement="bottom"
                          className="admin-tooltip"
                        >
                          <Index.Button className="admin-table-data-btn">
                            <img
                              src={PagesIndex.Svg.yelloweye}
                              className="admin-icon"
                              alt="View"
                            />
                          </Index.Button>
                        </Index.Tooltip> */}
                        {/* <Index.Tooltip
                        title="Edit"
                        arrow
                        placement="bottom"
                        className="admin-tooltip"
                      >
                        <Index.Button
                          className="admin-table-data-btn"
                          onClick={() => {
                            handleOpen();
                            setId(data?.gatewayId);
                            setSelectedData(data);
                          }}
                        >
                          <img
                            src={PagesIndex.Svg.blueedit}
                            className="admin-icon"
                            alt="Edit"
                          />
                        </Index.Button>
                      </Index.Tooltip> */}
                        {permissions?.includes("gateway_delete") && (
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
        )}
      </Index.Box>

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
              {id ? "Edit" : "Add"} Gateway
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
            validationSchema={PagesIndex.gatewaySchema}
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
                    <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        Gateway Name
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          fullWidth
                          className="admin-form-control"
                          id="gateway_name"
                          name="gateway_name"
                          value={values?.gateway_name}
                          placeholder="Enter Gateway Name "
                          onChange={handleChange}
                        />
                        <Index.FormHelperText error>
                          {touched.gateway_name && errors.gateway_name
                            ? errors.gateway_name
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="admin-input-box admin-add-user-input">
                      <Index.FormHelperText className="admin-form-lable">
                        Gateway Details
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextareaAutosize
                          aria-label="minimum height"
                          // minRows={3}
                          className="admin-form-control-textarea"
                          id="gateway_details"
                          name="gateway_details"
                          value={values?.gateway_details}
                          placeholder="Enter Gateway Details"
                          onChange={handleChange}
                        />
                        <Index.FormHelperText error>
                          {touched.gateway_details && errors.gateway_details
                            ? errors.gateway_details
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        Gateway EUI
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          fullWidth
                          className="admin-form-control"
                          id="gateway_eui"
                          name="gateway_eui"
                          value={values?.gateway_eui}
                          placeholder="Enter Gateway EUI"
                          onChange={handleChange}
                        />
                        <Index.FormHelperText error>
                          {touched.gateway_eui && errors.gateway_eui
                            ? errors.gateway_eui
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>

                    <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        Confirm Gateway EUI
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          fullWidth
                          className="admin-form-control"
                          id="confirm_gateway_eui"
                          name="confirm_gateway_eui"
                          value={values?.confirm_gateway_eui}
                          placeholder="Enter Confirm Gateway EUI"
                          onChange={handleChange}
                        />
                        <Index.FormHelperText error>
                          {touched.confirm_gateway_eui &&
                          errors.confirm_gateway_eui
                            ? errors.confirm_gateway_eui
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    {/* <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        Frequency Band
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          fullWidth
                          className="admin-form-control"
                          id="frequency_band"
                          name="frequency_band"
                          value={values?.frequency_band}
                          placeholder="Enter Frequency Band"
                          onChange={handleChange}
                          disabled
                        />
                      </Index.Box>
                    </Index.Box> */}

                    <Index.Box className="admin-input-box admin-add-user-input">
                      <Index.FormHelperText className="admin-form-lable">
                        Site
                      </Index.FormHelperText>
                      <Index.Box className="admin-dropdown-box">
                        <Index.FormControl className="admin-form-control admin-drop-form-control">
                          <Index.Select
                            className="admin-dropdown-select admin-drop-select"
                            name="site"
                            value={values?.site}
                            onChange={(e) => {
                              handleChange(e);
                              setFieldValue("tenant_id", ""); // Reset tenant selection
                              const selectedSite = siteListData.find(
                                (site) => site.id === e.target.value
                              );
                              getTenant(selectedSite?.id, setFieldValue);
                            }}
                            displayEmpty
                            inputProps={{ "aria-label": "Without label" }}
                            renderValue={
                              values?.site ? undefined : () => "Select Site"
                            }
                          >
                            {siteListData?.map((data) => (
                              <Index.MenuItem
                                value={data.id || data._id}
                                className="admin-drop-menuitem"
                                key={data.id || data._id}
                              >
                                {data?.name}
                              </Index.MenuItem>
                            ))}
                          </Index.Select>
                          <Index.FormHelperText error>
                            {touched.site && errors.site ? errors.site : null}
                          </Index.FormHelperText>
                        </Index.FormControl>
                      </Index.Box>
                    </Index.Box>
                    {/* Tenant Field: Show as disabled box after site selection */}
                    {tenant && tenant.id && (
                      <>
                        {values.tenant_id !== tenant.tenantId &&
                          setFieldValue("tenant_id", tenant.tenantId)}
                        <Index.Box className="admin-input-box admin-modal-input-box">
                          <Index.FormHelperText className="admin-form-lable">
                            Tenant
                          </Index.FormHelperText>
                          <Index.Box className="admin-form-group">
                            <Index.TextField
                              fullWidth
                              className="admin-form-control"
                              value={tenant.name || tenant.tenantId || ""}
                              disabled
                            />
                          </Index.Box>
                        </Index.Box>
                      </>
                    )}
                    <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        Model
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          fullWidth
                          className="admin-form-control"
                          id="model"
                          name="model"
                          value={values?.model}
                          placeholder="Enter Model"
                          onChange={handleChange}
                        />
                        <Index.FormHelperText error>
                          {touched.model && errors.model ? errors.model : null}
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
                        />
                        <Index.FormHelperText error>
                          {touched.location && errors.location
                            ? errors.location
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
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
                          onChange={handleChange}
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
                          onChange={handleChange}
                        />
                        <Index.FormHelperText error>
                          {touched.longitude && errors.longitude
                            ? errors.longitude
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        Commissioning Date
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          fullWidth
                          className="admin-form-control"
                          id="commissioning_date"
                          name="commissioning_date"
                          type="date"
                          value={values?.commissioning_date}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                        />
                        <Index.FormHelperText error>
                          {touched.commissioning_date &&
                          errors.commissioning_date
                            ? errors.commissioning_date
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
                <Index.Box className="admin-modal-footer">
                  <Index.Box className="admin-modal-user-btn-flex">
                    <Index.Box className="admin-discard-btn-main border-btn-main">
                      <Index.Button
                        className="admin-discard-user-btn border-btn"
                        onClick={() => {
                          handleClose(resetForm);
                        }}
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
      <Index.Modal
        open={openDownload}
        onClose={handleCloseDownload}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className="admin-modal"
      >
        <Index.Box
          sx={style}
          className="admin-delete-modal-inner-main admin-modal-inner"
        >
          <Index.Box className="admin-modal-header">
            <Index.Typography
              id="modal-modal-title"
              className="admin-modal-title"
              variant="h6"
              component="h2"
            >
              Download Certificates
            </Index.Typography>
            <Index.Button
              className="modal-close-btn"
              onClick={handleCloseDownload}
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
          <Index.Box className="modal-body">
            <Index.Box className="admin-download-modal-btn-flex border-btn-main btn-main">
              <Index.Button
                className="admin-modal-cancel-btn border-btn"
                onClick={() => {
                  window.open(downloadLinks?.certFile, "_blank");
                }}
              >
                <img
                  src={PagesIndex.Svg.down}
                  className="admin-icon"
                  alt="donwload"
                />{" "}
                Certificate
              </Index.Button>
              <Index.Button
                className="admin-modal-cancel-btn border-btn"
                onClick={() => {
                  window.open(downloadLinks?.cupsCertificateFile, "_blank");
                }}
              >
                <img
                  src={PagesIndex.Svg.down}
                  className="admin-icon"
                  alt="donwload"
                />{" "}
                CUPS Certificate
              </Index.Button>
              <Index.Button
                className="admin-modal-cancel-btn border-btn"
                onClick={() => {
                  window.open(downloadLinks?.lnsCertificateFile, "_blank");
                }}
              >
                <img
                  src={PagesIndex.Svg.down}
                  className="admin-icon"
                  alt="donwload"
                />{" "}
                LNS Certificate
              </Index.Button>
              <Index.Button
                className="admin-modal-cancel-btn border-btn"
                onClick={() => {
                  window.open(downloadLinks?.privateKeyFile, "_blank");
                }}
              >
                <img
                  src={PagesIndex.Svg.down}
                  className="admin-icon"
                  alt="donwload"
                />{" "}
                Private Key
              </Index.Button>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Modal>
    </>
  );
}
