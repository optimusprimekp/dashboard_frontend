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

export default function Chirpstack() {
  const { profile } = useContext(PageIndex.ProfileContext);
  const permissions = profile?.Role?.permissions || [];
  const [data, setData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [siteData, setSiteData] = useState([]);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [id, setId] = useState("");
  const [selectedData, setSelectedData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");

  const initialValues = {
    siteId: id ? selectedData?.siteId : "",
    applicationId: id ? selectedData?.applicationId : "",
    tenantId: id ? selectedData?.tenantId : "",
    deviceProfileId: id ? selectedData?.deviceProfileId : "",
    apiKey: id ? selectedData?.apiKey : "",
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

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event &&
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };
  const getList = useCallback(async () => {
    try {
      const res = await PagesIndex.apiGetHandler(PagesIndex.Api.CHIRPSTACK);
      if (res.status == 200) {
        setData(res?.data);
        setFilterData(res?.data);
      } else {
        PagesIndex.toasterError(res?.message);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);
  const getSiteList = useCallback(async () => {
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_ADD_EDIT_SITE
      );
      if (res.status == 200) {
        setSiteData(res?.data);
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

  const handleSubmit = async (values) => {
    const urlencoded = new URLSearchParams();
    if (id) urlencoded.append("id", id);
    urlencoded.append("siteId", values?.siteId);
    urlencoded.append("applicationId", values?.applicationId);
    urlencoded.append("tenantId", values?.tenantId);
    urlencoded.append("deviceProfileId", values?.deviceProfileId);
    urlencoded.append("apiKey", values?.apiKey);

    setButtonSpinner(true);
    try {
      const res = await PagesIndex.apiPostHandler(
        PagesIndex.Api.CHIRPSTACK,
        urlencoded
      );
      setButtonSpinner(false);
      if (res.status == 200 || res.status == 201) {
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
        PagesIndex.Api.CHIRPSTACK,
        id
      );
      setButtonSpinner(false);
      if (res.status == 200) {
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
  const requestSearch = (e) => {
    setSearchValue(e.target.value);
    let result = data.filter((item) => {
      const site = item?.Site?.name
        ?.toLowerCase()
        .includes(e.target.value.toLowerCase());
      const appId = item?.applicationId
        ?.toLowerCase()
        .includes(e.target.value.toLowerCase());
      const tenantId = item?.tenantId
        ?.toLowerCase()
        .includes(e.target.value.toLowerCase());
      const gateway = item?.Gateway?.name
        ?.toLowerCase()
        .includes(e.target.value.toLowerCase());
      return site || appId || tenantId || gateway;
    });
    setCurrentPage(1);
    setFilterData(result);
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
            LNS List
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
              {permissions?.includes("lns_add") && (
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
                    Add LNS
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
              { field: "Site" },
              { field: "Application ID" },
              { field: "Tenant ID" },
              { field: "Device Profile ID" },
              { field: "API Key" },
              { field: "Action", align: "center" },
            ]}
            filterData={filterData.length}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          >
            {filterData
              ?.slice((currentPage - 1) * 10, (currentPage - 1) * 10 + 10)
              ?.map((data, i) => (
                <Index.TableRow
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  key={data?.id}
                >
                  <Index.TableCell
                    component="td"
                    variant="td"
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
                        {data?.site?.name}
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
                        {data?.applicationId || "-"}
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
                        {data?.tenantId || "-"}
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
                        {data?.deviceProfileId || "-"}
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
                      sx={{ alignItems: "center" }}
                    >
                      <Index.Typography
                        className="admin-table-data-text"
                        sx={{ mr: 1 }}
                      >
                        {data?.apiKey ? "****" : "-"}
                      </Index.Typography>
                      {data?.apiKey && (
                        <Index.Tooltip title="Copy API Key" arrow>
                          <Index.IconButton
                            size="small"
                            onClick={() => {
                              navigator?.clipboard?.writeText(data.apiKey);
                              PagesIndex.toasterSuccess("API Key copied!");
                            }}
                          >
                            <img
                              src={PagesIndex.Svg.copy}
                              className="admin-icon"
                              alt="Copy"
                              style={{ width: 16, height: 16 }}
                            />
                          </Index.IconButton>
                        </Index.Tooltip>
                      )}
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    className="table-td"
                    sx={{ justifyContent: "center" }}
                  >
                    <Index.Box className="admin-table-data-btn-flex">
                      {permissions?.includes("lns_edit") && (
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

                      {permissions?.includes("lns_delete") && (
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
              ))}
          </DataTable>
        </Index.Box>
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
              {id ? "Edit" : "Add"} Chirpstack
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
            validationSchema={PagesIndex.chirpstackSchema}
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
                        Tenant ID
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          fullWidth
                          className="admin-form-control"
                          id="tenantId"
                          name="tenantId"
                          value={values?.tenantId}
                          placeholder="Enter tenant ID"
                          onChange={handleChange}
                        />
                        <Index.FormHelperText error>
                          {touched.tenantId && errors.tenantId
                            ? errors.tenantId
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>

                    <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        Application ID
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          fullWidth
                          className="admin-form-control"
                          id="applicationId"
                          name="applicationId"
                          value={values?.applicationId}
                          placeholder="Enter Application ID"
                          onChange={handleChange}
                        />
                        <Index.FormHelperText error>
                          {touched.applicationId && errors.applicationId
                            ? errors.applicationId
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        API Key
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          fullWidth
                          className="admin-form-control"
                          id="apiKey"
                          name="apiKey"
                          value={values?.apiKey}
                          placeholder="Enter api key"
                          onChange={handleChange}
                        />
                        <Index.FormHelperText error>
                          {touched.apiKey && errors.apiKey
                            ? errors.apiKey
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        Device Profile ID
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          fullWidth
                          className="admin-form-control"
                          id="deviceProfileId"
                          name="deviceProfileId"
                          value={values?.deviceProfileId}
                          placeholder="Enter Device Profile ID"
                          onChange={handleChange}
                        />
                        <Index.FormHelperText error>
                          {touched.deviceProfileId && errors.deviceProfileId
                            ? errors.deviceProfileId
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        Site
                      </Index.FormHelperText>
                      <Index.Box className="admin-dropdown-box admin-dropdown-select">
                        <Index.Autocomplete
                          className="admin-auto-complete-filed admin-form-group"
                          options={siteData || []}
                          name="siteId"
                          disableClearable
                          closeText={""}
                          openText={""}
                          clearText={""}
                          value={
                            values.siteId
                              ? siteData.find(
                                  (option) => option.id === values.siteId
                                )
                              : { id: "", name: "" }
                          }
                          onChange={(e, selectedOptions) => {
                            setFieldValue("siteId", selectedOptions?.id || "");
                          }}
                          sx={{
                            padding: "0px !important",
                            "& .MuiInputBase-root": {
                              padding: "0px !important",
                            },
                          }}
                          getOptionLabel={(option) => option?.name || ""}
                          renderInput={(params) => (
                            <Index.TextField
                              fullWidth
                              className="admin-form-control"
                              placeholder={values?.siteId ? "" : "Select Site"}
                              size="small"
                              sx={{
                                "& .MuiInputBase-input": {
                                  border: "none !important",
                                  padding: "7px 15px !important",
                                },
                              }}
                              {...params}
                              variant="outlined"
                            />
                          )}
                        />
                        <Index.FormHelperText error>
                          {touched.siteId && errors.siteId
                            ? errors.siteId
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
