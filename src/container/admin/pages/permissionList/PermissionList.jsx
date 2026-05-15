import { SwipeableDrawer } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import DataTable from "../../../../component/common/dataTable/DataTable";
import PrimaryButton from "../../../../component/common/Button/PrimaryButton";

// for modal design

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
};
const BpIcon = Index.styled("span")(({ theme }) => ({
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

const BpCheckedIcon = Index.styled(BpIcon)({
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
      sx={{
        "&:hover": { bgcolor: "transparent" },
      }}
      disableRipple
      color="default"
      checkedIcon={<BpCheckedIcon />}
      icon={<BpIcon />}
      inputProps={{ "aria-label": "Checkbox demo" }}
      {...props}
    />
  );
}
// for table data

export default function PermissionList() {
  const actionLabels = {
    create: "Create",
    read: "Read",
    update: "Update",
    delete: "Delete",
  };
  const [data, setData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [id, setId] = useState("");
  const [selectedDate, setSelectedData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");

  const initialValues = {
    module: id ? selectedDate?.module : "",
    action: id
      ? selectedDate?.action
      : {
          create: false,
          read: true,
          update: false,
          delete: false,
        },
  };

  // add user modal
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // delete modal
  const [openDelete, setOpenDelete] = useState(false);
  const handleOpenDelete = () => setOpenDelete(true);
  const handleCloseDelete = () => setOpenDelete(false);

  const getList = useCallback(async () => {
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_ADD_EDIT_PERMISSIONS
      );
      if (res.status) {
        setData(res?.data);
        setFilterData(res?.data);
      } else {
        PagesIndex.toasterError(res?.message);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getList();
  }, [getList]);

  const handleSubmit = async (values) => {
    const urlencoded = new URLSearchParams();
    urlencoded.append("module", values?.module);
    urlencoded.append("action.create", values?.action.create);
    urlencoded.append("action.read", values?.action.read);
    urlencoded.append("action.update", values?.action.update);
    urlencoded.append("action.delete", values?.action.delete);

    setButtonSpinner(true);
    try {
      let res = "";
      if (id) {
        res = await PagesIndex.apiPutHandler(
          PagesIndex.Api.GET_ADD_EDIT_PERMISSIONS,
          id,
          urlencoded
        );
      } else {
        res = await PagesIndex.apiPostHandler(
          PagesIndex.Api.GET_ADD_EDIT_PERMISSIONS,
          urlencoded
        );
      }
      setButtonSpinner(false);
      if (res.status) {
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
        PagesIndex.Api.GET_ADD_EDIT_PERMISSIONS,
        id
      );

      setButtonSpinner(false);
      if (res.status) {
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
    const result = data.filter((row) =>
      row?.module?.toLowerCase().includes(lower)
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
            Permission List
          </Index.Typography>
          <Index.Box className="admin-userlist-btn-flex">
            <Index.Box className="admin-search-main">
              <Index.Box className="admin-search-box">
                <Index.Box className="admin-form-group">
                  <Index.TextField
                    fullWidth
                    id="searchPermission"
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
                  Add Permission
                </Index.Button>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
        <Index.Box className="card-border common-card">
          <DataTable
            headerData={[
              { field: "Sr. No." },
              { field: "Module" },
              { field: "Permission" },
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
                    key={data?._id}
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
                          {data?.module}
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
                          {Object.entries(data?.action)
                            .filter(([key, value]) => value) // Filter only true values
                            .map(([key]) => actionLabels[key])
                            .join(", ")}
                        </Index.Typography>
                      </Index.Box>
                    </Index.TableCell>
                    <Index.TableCell
                      component="td"
                      variant="td"
                      className="table-td"
                      sx={{ justifyContent: "center" }}
                    >
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
                              handleOpen();
                              setId(data?._id);
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

                        <Index.Tooltip
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
                        </Index.Tooltip>

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
                              setId(data?._id);
                            }}
                          >
                            <img
                              src={PagesIndex.Svg.trash}
                              className="admin-icon"
                              alt="Trash"
                            />
                          </Index.Button>
                        </Index.Tooltip>
                      </Index.Box>
                    </Index.TableCell>
                  </Index.TableRow>
                );
              })}
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
              Add Module
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
            validationSchema={PagesIndex.permissionsSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleSubmit }) => (
              <PagesIndex.Form onSubmit={handleSubmit}>
                <Index.Box className="modal-body">
                  <Index.Box className="admin-modal-hgt-scroll cus-scrollbar">
                    <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        Module Name
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          fullWidth
                          className="admin-form-control"
                          id="module"
                          name="module"
                          value={values?.module}
                          placeholder="Enter Module Name"
                          onChange={handleChange}
                        />
                        <Index.FormHelperText error>
                          {errors?.module && touched?.module
                            ? errors?.module
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        Permissions
                      </Index.FormHelperText>
                      <Index.Box className="admin-checkbox-main">
                        <PagesIndex.FormControlLabel
                          name="action.create"
                          checked={values?.action?.create}
                          control={
                            <BpCheckbox
                              onChange={(e) => {
                                handleChange(e);
                              }}
                            />
                          }
                          label={"Create"}
                        />
                      </Index.Box>
                      <Index.Box className="admin-checkbox-main">
                        <PagesIndex.FormControlLabel
                          name="action.read"
                          checked={values?.action?.read}
                          control={
                            <BpCheckbox
                              onChange={(e) => {
                                handleChange(e);
                              }}
                            />
                          }
                          label={"Read"}
                        />
                      </Index.Box>
                      <Index.Box className="admin-checkbox-main">
                        <PagesIndex.FormControlLabel
                          name="action.update"
                          checked={values?.action?.update}
                          control={
                            <BpCheckbox
                              onChange={(e) => {
                                handleChange(e);
                              }}
                            />
                          }
                          label={"Update"}
                        />
                      </Index.Box>
                      <Index.Box className="admin-checkbox-main">
                        <PagesIndex.FormControlLabel
                          name="action.delete"
                          checked={values?.action?.delete}
                          control={
                            <BpCheckbox
                              onChange={(e) => {
                                handleChange(e);
                              }}
                            />
                          }
                          label={"Delete"}
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.FormHelperText error>
                      {errors?.action && touched?.action
                        ? errors?.action
                        : null}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Box>
                <Index.Box className="admin-modal-footer">
                  <Index.Box className="admin-modal-user-btn-flex">
                    <Index.Box className="admin-discard-btn-main border-btn-main">
                      <Index.Button className="admin-discard-user-btn border-btn">
                        Discard
                      </Index.Button>
                    </Index.Box>
                    <PrimaryButton
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
