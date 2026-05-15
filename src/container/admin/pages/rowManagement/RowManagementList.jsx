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

export default function RowManagementList() {
  const { profile } = useContext(PageIndex.ProfileContext);
  const permissions = profile?.Role?.permissions || [];
  const [data, setData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [id, setId] = useState("");
  const [selectedData, setSelectedData] = useState({});
  const [currentPage, setCurrentPage] = useState(1); // 1-based for Pagination
  const [pageSize, setPageSize] = useState(25);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);

  const initialValues = {
    row_name: selectedData?.rowName || "",
    home_lat: selectedData?.homeLatitude || "",
    home_lng: selectedData?.homeLongitude || "",
    reverse_station_lat: selectedData?.reverseStationLatitude || "",
    reverse_station_lng: selectedData?.reverseStationLongitude || "",
    distance: selectedData?.distance || "",
  };

  // add user modal
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = (resetForm) => {
    setOpen(false);
    setId("");
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
      const res = await PagesIndex.apiGetHandler(PagesIndex.Api.GET_ROWS);
      if (res.status === 200) {
        setData(res?.data);
        setFilterData(res?.data);
        setCurrentPage(1);
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

  // Keep current page valid when data length or page size changes
  useEffect(() => {
    const total = filterData?.length ?? 0;
    const maxPage = total === 0 ? 1 : Math.ceil(total / pageSize);
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [filterData?.length, pageSize, currentPage]);

  const handleSubmit = async (values) => {
    const payload = {
      rowName: values.row_name,
      homeLatitude: values.home_lat,
      homeLongitude: values.home_lng,
      reverseStationLatitude: values.reverse_station_lat,
      reverseStationLongitude: values.reverse_station_lng,
      distance: values.distance,
    };
    if (id) {
      payload.id = id; // Include id only if editing
    }
    setButtonSpinner(true);
    try {
      const res = await PagesIndex.apiPostHandler(
        PagesIndex.Api.GET_ROWS,
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
        PagesIndex.Api.GET_ROWS,
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
  const requestSearch = (e) => {
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
            Row List
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
                    Add Row
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
                { field: "Row Name" },
                { field: "Home Latitude" },
                { field: "Home Longitude" },
                { field: "Reverse Station Latitude" },
                { field: "Reverse Station Longitude" },
                { field: "Distance" },
                { field: "Action", align: "center" },
              ]}
              filterData={filterData?.length}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
            >
              {filterData
                ?.slice(
                  (currentPage - 1) * pageSize,
                  (currentPage - 1) * pageSize + pageSize
                )
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
                          {(currentPage - 1) * pageSize + (i + 1)}
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
                          {data?.rowName || "-"}
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
                          {data?.homeLatitude || "-"}
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
                          {data?.homeLongitude || "-"}
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
                          {data?.reverseStationLatitude || "-"}
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
                          {data?.reverseStationLongitude || "-"}
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
                          {data?.distance || "-"}
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
              {id ? "Edit" : "Add"} Row
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
            validationSchema={PagesIndex.rowSchema}
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
              useEffect(() => {
                const {
                  home_lat,
                  home_lng,
                  reverse_station_lat,
                  reverse_station_lng,
                } = values;

                const isValid =
                  home_lat &&
                  home_lng &&
                  reverse_station_lat &&
                  reverse_station_lng;

                if (isValid) {
                  const toRad = (value) => (value * Math.PI) / 180;

                  const R = 6371e3; // Earth's radius in meters

                  const φ1 = toRad(parseFloat(home_lat));
                  const φ2 = toRad(parseFloat(reverse_station_lat));
                  const Δφ = toRad(
                    parseFloat(reverse_station_lat) - parseFloat(home_lat)
                  );
                  const Δλ = toRad(
                    parseFloat(reverse_station_lng) - parseFloat(home_lng)
                  );

                  const a =
                    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                    Math.cos(φ1) *
                      Math.cos(φ2) *
                      Math.sin(Δλ / 2) *
                      Math.sin(Δλ / 2);

                  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                  const distanceInMeters = R * c;
                  const distanceInMetersRounded =
                    Math.round(distanceInMeters * 100) / 100;

                  setFieldValue("distance", distanceInMetersRounded.toString());
                } else {
                  setFieldValue("distance", "");
                }
              }, [
                values.home_lat,
                values.home_lng,
                values.reverse_station_lat,
                values.reverse_station_lng,
                setFieldValue,
              ]),
              (
                <PagesIndex.Form onSubmit={handleSubmit}>
                  <Index.Box className="modal-body">
                    <Index.Box className="admin-modal-hgt-scroll cus-scrollbar">
                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Row Name
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="row_name"
                            name="row_name"
                            value={values?.row_name}
                            placeholder="Enter Row Name "
                            onChange={handleChange}
                          />
                          <Index.FormHelperText error>
                            {touched.row_name && errors.row_name
                              ? errors.row_name
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Home Position Latitude
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="home_lat"
                            name="home_lat"
                            value={values?.home_lat}
                            placeholder="Enter Home Position Latitude"
                            onChange={handleChange}
                          />
                          <Index.FormHelperText error>
                            {touched.home_lat && errors.home_lat
                              ? errors.home_lat
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>

                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Home Position Longitude
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="home_lng"
                            name="home_lng"
                            value={values?.home_lng}
                            placeholder="Enter Home Position Longitude"
                            onChange={handleChange}
                          />
                          <Index.FormHelperText error>
                            {touched.home_lng && errors.home_lng
                              ? errors.home_lng
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>

                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Reverse Station Latitude
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="reverse_station_lat"
                            name="reverse_station_lat"
                            value={values?.reverse_station_lat}
                            placeholder="Enter Reverse Station Latitude"
                            onChange={handleChange}
                          />
                          <Index.FormHelperText error>
                            {touched.reverse_station_lat &&
                            errors.reverse_station_lat
                              ? errors.reverse_station_lat
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Reverse Station Longitude
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="reverse_station_lng"
                            name="reverse_station_lng"
                            value={values?.reverse_station_lng}
                            placeholder="Enter Reverse Station Longitude"
                            onChange={handleChange}
                          />
                          <Index.FormHelperText error>
                            {touched.reverse_station_lat &&
                            errors.reverse_station_lat
                              ? errors.reverse_station_lat
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Distance(Auto Calculated In Meters)
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="distance"
                            name="distance"
                            value={values?.distance}
                            placeholder="Enter Distance"
                            onChange={handleChange}
                          />
                          <Index.FormHelperText error>
                            {touched.distance && errors.distance
                              ? errors.distance
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
              )
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
