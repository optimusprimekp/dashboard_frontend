import { CircularProgress /*, SwipeableDrawer*/ } from "@mui/material";
import React, { useCallback, useContext, useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import PageIndex from "../../../../component/PagesIndex";
import DataTable from "../../../../component/common/dataTable/DataTable";
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

export default function BlockManagementList() {
  const { profile } = useContext(PageIndex.ProfileContext);
  const permissions = profile?.Role?.permissions || [];
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [siteData, setSiteData] = useState([]);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [id, setId] = useState("");
  const [selectedData, setSelectedData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [tenant, setTenant] = useState({});
  const [loading, setLoading] = useState(false);

  const initialValues = {
    name: id ? selectedData?.name : "",
    siteId: id ? selectedData?.siteId : "",
    devices: id ? selectedData?.devices || [] : [],
    startTime: id ? selectedData?.startTime : "",
    isDeleted: id ? selectedData?.isDeleted : false,
    // important: include application_id for edit flows
    application_id: id ? selectedData?.applicationId || "" : "",
  };

  // add/edit modal
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setId("");
    setTenant({});
    setSelectedData({});
    setOpen(false);
  };

  // delete modal (reused by Export button in current UI)
  const [openDelete, setOpenDelete] = useState(false);
  const handleOpenDelete = () => setOpenDelete(true);
  const handleCloseDelete = () => setOpenDelete(false);

  // optional drawer filter state (not currently used in this snippet)
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
        PagesIndex.Api.GET_ADD_EDIT_BLOCKS
      );
      if (res.status) {
        setData(res?.data || []);
        setFilterData(res?.data || []);
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
        setSiteData(res?.data || []);
      } else {
        PagesIndex.toasterError(res?.message);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  /**
   * Fetch tenant/application info for a site.
   * - Normalizes array/object shapes.
   * - If setFieldValue is provided and a single applicationId exists, auto-sets it.
   */
  const getTenant = useCallback(async (siteId, setFieldValue) => {
    if (!siteId) return;
    try {
      const res = await PagesIndex.apiGetHandler(
        `${PagesIndex.Api.CHIRPSTACK}/site/${siteId}`
      );
      if (res.status === 200) {
        const payload = res?.data;
        // Support array or object
        const t = Array.isArray(payload) ? payload[0] || {} : payload || {};
        setTenant(t);
        if (setFieldValue && t?.applicationId) {
          setFieldValue("application_id", t.applicationId);
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

  // Prefetch tenant on EDIT open (when existing site is present)
  useEffect(() => {
    if (open && id && selectedData?.siteId) {
      getTenant(selectedData.siteId);
    }
  }, [open, id, selectedData?.siteId, getTenant]);

  const handleSubmit = async (values) => {
    const payload = {
      siteId: values.siteId,
      name: values.name,
      applicationId: values.application_id || "",
    };

    setButtonSpinner(true);
    try {
      if (id) payload.id = id; // include id for update

      const res = await PagesIndex.apiPostHandler(
        PagesIndex.Api.GET_ADD_EDIT_BLOCKS,
        payload
      );

      setButtonSpinner(false);
      if (res.status === 200 || res.status === 201) {
        setId("");
        setSelectedData({});
        getList();
        handleClose();
        PagesIndex.toasterSuccess(res?.message);
      } else {
        PagesIndex.toasterError(res?.message);
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
        PagesIndex.Api.GET_ADD_EDIT_BLOCKS,
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
      }
    } catch (error) {
      setButtonSpinner(false);
      console.log(error);
    }
  };

  const requestSearch = (e) => {
    const query = e.target.value || "";
    setSearchValue(query);
    const q = query.toLowerCase();

    const result = (data || []).filter((row) => {
      const byName = row?.name?.toLowerCase()?.includes(q);
      const bySite = row?.site?.name?.toLowerCase()?.includes(q);
      const byMc = row?.mcAddr?.toLowerCase()?.includes(q);
      return byName || bySite || byMc;
    });

    setCurrentPage(1);
    setFilterData(result);
  };

  // when the open site view and show data then used...
  const handleViewBlockData = (blockData) => {
    navigate(`/admin/block-view/${blockData?.id}`, {
      state: blockData,
    });
  };
  const handleViewBlockMapData = (blockData) => {
    navigate(`/admin/block-map-view/${blockData?.id}`, {
      state: blockData,
    });
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
            Block List
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
                  />
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

              {permissions?.includes("block_add") && (
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
                    Add Block
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
              minHeight: "200px",
            }}
          >
            <CircularProgress />
          </Index.Box>
        ) : (
          <Index.Box className="card-border common-card">
            <DataTable
              headerData={[
                { field: "Sr. No." },
                { field: "Block Name" },
                { field: "Site" },
                { field: "Multicast Address" },
                // { field: "Start time" },
                { field: "Total robots" },
                { field: "Action", align: "center" },
              ]}
              filterData={filterData.length}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            >
              {filterData
                ?.slice((currentPage - 1) * 10, (currentPage - 1) * 10 + 10)
                ?.map((row, i) => (
                  <Index.TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    key={row?.id}
                  >
                    <Index.TableCell
                      component="td"
                      variant="td"
                      scope="row"
                      className="table-td"
                    >
                      <Index.Box className="admin-table-data-flex">
                        <Index.Typography className="admin-table-data-text">
                          {(currentPage - 1) * 10 + (i + 1)}
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
                          {row?.name}
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
                          {row?.site?.name || "-"}
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
                          {row?.mcAddr || "-"}
                        </Index.Typography>
                      </Index.Box>
                    </Index.TableCell>

                    {/* <Index.TableCell component="td" variant="td" className="table-td">
                      <Index.Box className="admin-table-data-flex">
                        <Index.Typography className="admin-table-data-text">
                          {row?.startTime || "-"}
                        </Index.Typography>
                      </Index.Box>
                    </Index.TableCell> */}

                    <Index.TableCell
                      component="td"
                      variant="td"
                      className="table-td"
                    >
                      <Index.Box className="admin-table-data-flex">
                        <Index.Typography className="admin-table-data-text">
                          {row?.devices?.length || 0}
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
                        {permissions?.includes("block_edit") && (
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
                                setId(row?.id);
                                setSelectedData(row);
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

                        {permissions?.includes("block_view") && (
                          <Index.Tooltip
                            title="View"
                            arrow
                            placement="bottom"
                            className="admin-tooltip"
                          >
                            <Index.Button
                              className="admin-table-data-btn"
                              onClick={() => handleViewBlockData(row)}
                            >
                              <img
                                src={PagesIndex.Svg.yelloweye}
                                className="admin-icon"
                                alt="View"
                              />
                            </Index.Button>
                          </Index.Tooltip>
                        )}
                          <Index.Tooltip
                            title="Map View"
                            arrow
                            placement="bottom"
                            className="admin-tooltip"
                          >
                            <Index.Button
                              className="admin-table-data-btn"
                              onClick={() => handleViewBlockMapData(row)}
                            >
                              <img
                                src={PagesIndex.Svg.info}
                                className="admin-icon"
                                alt="info"
                              />
                            </Index.Button>
                          </Index.Tooltip>
                        {permissions?.includes("block_delete") && (
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
                                setId(row?.id);
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
        )}
      </Index.Box>

      {/* Add/Edit Modal */}
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
              {id ? "Edit" : "Add"} Block
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
            validationSchema={PagesIndex.blockSchema}
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
                    {/* Name */}
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

                    {/* Site */}
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
                                ) || null
                              : null
                          }
                          onChange={(e, selectedOptions) => {
                            const newSiteId = selectedOptions?.id || "";
                            setFieldValue("siteId", newSiteId);
                            // clear previous application id
                            setFieldValue("application_id", "");
                            // fetch tenant and (if unique) set application_id
                            getTenant(newSiteId, setFieldValue);
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

                    {/* Application Id (read-only) */}
                    <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        Application Id
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          fullWidth
                          className="admin-form-control"
                          name="application_id"
                          value={values?.application_id || ""}
                          placeholder="Application Id"
                          disabled
                        />
                      </Index.Box>
                    </Index.Box>

                    {/* Optional: show tenant name if fetched */}
                    {tenant?.name && (
                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Tenant
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            value={tenant?.name}
                            disabled
                          />
                        </Index.Box>
                      </Index.Box>
                    )}
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
                                />
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

      {/* Delete/Export modal hook-up unchanged */}
      <PagesIndex.PopupModal
        open={openDelete}
        handleClose={handleCloseDelete}
        handleFunction={handleDelete}
        buttonSpinner={buttonSpinner}
      />
    </>
  );
}
