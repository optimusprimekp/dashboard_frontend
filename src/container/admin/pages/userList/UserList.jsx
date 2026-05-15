import { CircularProgress } from "@mui/material";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import PageIndex from "../../../../component/PagesIndex";
import DataTable from "../../../../component/common/dataTable/DataTable";
import { MODAL_BOX_STYLE } from "../../../../utils/constants";
import { isSuccessResponse } from "../../../../utils/apiUtils";

const PAGE_SIZE = 10;
const DEFAULT_PASSWORD = "Admin@123";

export default function UserList() {
  const { profile } = useContext(PageIndex.ProfileContext);
  const permission = profile?.Role?.permissions || [];
  const [data, setData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [roleData, setRoleData] = useState([]);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedData, setSelectedData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const initialValues = useMemo(
    () => ({
      name: selectedUserId ? selectedData?.name : "",
      email: selectedUserId ? selectedData?.email : "",
      password: selectedUserId ? selectedData?.password : DEFAULT_PASSWORD,
      role: selectedUserId ? selectedData?.role : "",
    }),
    [selectedUserId, selectedData]
  );

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => {
    setSelectedUserId("");
    setSelectedData({});
    setOpen(false);
  }, []);
  const handleOpenDelete = useCallback(() => setOpenDelete(true), []);
  const handleCloseDelete = useCallback(() => setOpenDelete(false), []);

  const getList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await PagesIndex.apiGetHandler(PagesIndex.Api.GET_USERS);
      if (isSuccessResponse(res)) {
        setData(res?.data ?? []);
        setFilterData(res?.data ?? []);
      } else {
        PagesIndex.toasterError(res?.message ?? "Failed to load users");
      }
    } catch (error) {
      console.error("UserList getList:", error);
      PagesIndex.toasterError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  const getRoleList = useCallback(async () => {
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_ADD_EDIT_ROLE
      );
      if (isSuccessResponse(res)) {
        setRoleData(res?.data ?? []);
      } else {
        PagesIndex.toasterError(res?.message ?? "Failed to load roles");
      }
    } catch (error) {
      console.error("UserList getRoleList:", error);
      PagesIndex.toasterError("Failed to load roles");
    }
  }, []);

  useEffect(() => {
    getList();
    getRoleList();
  }, [getList, getRoleList]);

  const handleSubmit = useCallback(
    async (values) => {
      const urlencoded = new URLSearchParams();
      urlencoded.append("name", values?.name ?? "");
      urlencoded.append("email", values?.email ?? "");
      if (!selectedUserId) {
        urlencoded.append("password", DEFAULT_PASSWORD);
      }
      urlencoded.append("role", values?.role ?? "");
      if (selectedUserId) {
        urlencoded.append("id", selectedUserId);
      }

      setButtonSpinner(true);
      try {
        const res = await PagesIndex.apiPostHandler(
          PagesIndex.Api.ADD_EDIT_USERS,
          urlencoded
        );
        if (isSuccessResponse(res)) {
          await getList();
          handleClose();
          PagesIndex.toasterSuccess(res?.message ?? "Saved successfully");
        } else {
          PagesIndex.toasterError(res?.message ?? "Failed to save user");
        }
      } catch (error) {
        console.error("UserList handleSubmit:", error);
        PagesIndex.toasterError("Failed to save user");
      } finally {
        setButtonSpinner(false);
      }
    },
    [selectedUserId, getList, handleClose]
  );

  const handleDelete = useCallback(async () => {
    setButtonSpinner(true);
    try {
      const res = await PagesIndex.apiDeleteHandler(
        PagesIndex.Api.GET_USERS,
        selectedUserId
      );
      if (isSuccessResponse(res)) {
        setSelectedUserId("");
        await getList();
        handleCloseDelete();
        PagesIndex.toasterSuccess(res?.message ?? "Deleted successfully");
      } else {
        PagesIndex.toasterError(res?.message ?? "Failed to delete user");
      }
    } catch (error) {
      console.error("UserList handleDelete:", error);
      PagesIndex.toasterError("Failed to delete user");
    } finally {
      setButtonSpinner(false);
    }
  }, [selectedUserId, getList, handleCloseDelete]);

  const requestSearch = useCallback(
    (e) => {
      const value = e?.target?.value ?? "";
      setSearchValue(value);
      const lower = value.toLowerCase();
      const result = data.filter((user) => {
        const name = user?.name?.toLowerCase().includes(lower);
        const email = user?.email?.toLowerCase().includes(lower);
        return name || email;
      });
      setCurrentPage(1);
      setFilterData(result);
    },
    [data]
  );

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filterData.slice(start, start + PAGE_SIZE);
  }, [filterData, currentPage]);
  return (
    <>
      <Index.Box className="admin-dashboard-content admin-user-list-content">
        <Index.Box className="admin-user-list-flex admin-page-title-main">
          <Index.Typography
            className="admin-page-title admin-user-list-page-title"
            component="h2"
            variant="h2"
          >
            User List
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
            {/* <Index.Box className="admin-filter-main">
              {["right"].map((anchor) => (
                <React.Fragment key={anchor}>
                  <Index.Box className="admin-export-btn-main border-btn-main">
                    <Index.Button
                      className="admin-export-btn border-btn"
                      onClick={toggleDrawer(anchor, true)}
                    >
                      <img
                        src={PagesIndex.Svg.filter}
                        className="admin-down-icon admin-icon"
                        alt="download icon"
                      />
                      Filter
                    </Index.Button>
                  </Index.Box>
                  <SwipeableDrawer
                    className="filter-main"
                    anchor={anchor}
                    open={state[anchor]}
                    onClose={toggleDrawer(anchor, false)}
                    onOpen={toggleDrawer(anchor, true)}
                  >
                    <Index.Box className="admin-filter-header">
                      <Index.Typography className="admin-filter-title">
                        User Filter
                      </Index.Typography>
                      <span onClick={toggleDrawer(anchor, false)}>
                        <img
                          src={PagesIndex.Png.close}
                          className="admin-filter-close-icon"
                          alt="Close"
                        />
                      </span>
                    </Index.Box>
                    <Index.Box className="admin-filter-inner-main">
                      <Index.Box className="admin-input-box admin-filter-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Name
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            id="fullWidth"
                            className="admin-form-control"
                            placeholder=""
                          />
                        </Index.Box>
                      </Index.Box>
                      <Index.Box className="admin-input-box admin-filter-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          City
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            id="fullWidth"
                            className="admin-form-control"
                            placeholder=""
                          />
                        </Index.Box>
                      </Index.Box>
                      <Index.Box className="admin-input-box admin-filter-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Status
                        </Index.FormHelperText>
                        <Index.Box className="admin-checkbox-main admin-filter-checkbox-main admin-input-box">
                          <Index.FormControlLabel
                            control={<Index.Checkbox defaultChecked />}
                            label="Active"
                            className="admin-checkbox-lable"
                          />
                          <Index.FormControlLabel
                            control={<Index.Checkbox />}
                            label="Deactivate"
                            className="admin-checkbox-lable"
                          />
                          <Index.FormControlLabel
                            control={<Index.Checkbox />}
                            label="Pending"
                            className="admin-checkbox-lable"
                          />
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="admin-filter-footer">
                      <Index.Box className="admin-filter-btn-main border-btn-main btn-main-primary">
                        <Index.Button className="border-btn admin-filter-cancel-btn">
                          Cancel
                        </Index.Button>
                        <Index.Button className="btn-primary admin-filter-btn">
                          Filter
                        </Index.Button>
                      </Index.Box>
                    </Index.Box>
                  </SwipeableDrawer>
                </React.Fragment>
              ))}
            </Index.Box> */}
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
              {permission.includes("user_add") && (
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
                    Add User
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
                { field: "Name" },
                { field: "Email" },
                { field: "Role" },
                { field: "Action", align: "center" },
              ]}
              filterData={filterData.length}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            >
              {paginatedRows.map((row, i) => {
                  return (
                    <Index.TableRow
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
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
                            {(currentPage - 1) * PAGE_SIZE + i + 1}
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
                        className="table-td"
                      >
                        <Index.Box className="admin-table-data-flex">
                          <Index.Typography className="admin-table-data-text">
                            {row?.email}
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
                            {row?.Role?.name}
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
                          {permission.includes("user_edit") && (
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
                                  setSelectedUserId(row?.id);
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

                          {permission.includes("user_delete") && (
                            <Index.Tooltip
                              title="Delete"
                              arrow
                              placement="bottom"
                              className="admin-tooltip"
                            >
                              <Index.Button
                                className="admin-table-data-btn"
                                onClick={() => {
                                  setSelectedUserId(row?.id);
                                  handleOpenDelete();
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
          sx={MODAL_BOX_STYLE}
          className="admin-add-user-modal-inner-main admin-modal-inner"
        >
          <Index.Box className="admin-modal-header">
            <Index.Typography
              id="modal-modal-title"
              className="admin-modal-title"
              variant="h6"
              component="h2"
            >
              {selectedUserId ? "Edit" : "Add"} User
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
            validationSchema={PagesIndex.userSchema}
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
                        />
                        <Index.FormHelperText error>
                          {touched.name && errors.name ? errors.name : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        Role
                      </Index.FormHelperText>
                      <Index.Box className="admin-dropdown-box admin-dropdown-select">
                        <Index.Autocomplete
                          className="admin-auto-complete-filed admin-form-group"
                          options={roleData || []}
                          name="role"
                          disableClearable
                          closeText={""}
                          openText={""}
                          clearText={""}
                          value={
                            values.role
                              ? roleData.find(
                                  (option) => option.id === values.role
                                )
                              : { id: "", name: "" }
                          }
                          onChange={(e, selectedOptions) => {
                            setFieldValue("role", selectedOptions?.id || "");
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
                              placeholder={
                                values?.role ? "" : "Select Permission"
                              }
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
                          {touched.role && errors.role ? errors.role : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        Email
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          fullWidth
                          className="admin-form-control"
                          id="email"
                          name="email"
                          value={values?.email}
                          placeholder="Enter Email"
                          onChange={handleChange}
                        />
                        <Index.FormHelperText error>
                          {touched.email && errors.email ? errors.email : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    {/* <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        Password
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          fullWidth
                          className="admin-form-control"
                          id="password"
                          name="password"
                          value={values?.password}
                          placeholder="Enter Password"
                          onChange={handleChange}
                        />
                        <Index.FormHelperText error>
                          {touched.password && errors.password
                            ? errors.password
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box> */}
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
