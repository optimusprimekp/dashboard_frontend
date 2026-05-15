import React, { useContext, useEffect, useRef, useState } from "react";
import { styled } from "@mui/material/styles";
import "./roleManagement.css";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import PageIndex from "../../../../component/PagesIndex";
import DataTable from "../../../../component/common/dataTable/DataTable";
import { CircularProgress } from "@mui/material";
import moment from "moment";

// CHANGE START: Use the larger, responsive style for the modal
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  // width: { xs: "95%", md: "70vw" },
  maxWidth: "1300px",
  maxHeight: "90vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  display: "flex",
  flexDirection: "column",
};
// CHANGE END

// for custom checkbox design
const BpIcon = styled("span")(({ theme }) => ({
  borderRadius: 3,
  border: "1px solid #b2b3b3",
  width: 12,
  height: 12,
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

export default function RoleManagement() {
  const { profile } = useContext(PageIndex.ProfileContext);
  const permissions = profile?.Role?.permissions || [];
  const [searchValue, setSearchValue] = useState("");
  const formRef = useRef();

  const modules = [
    { tag: "user", title: "User" },
    { tag: "role", title: "Role Permission" },
    { tag: "monitoring", title: "Monitoring" },
    { tag: "robot", title: "Robot" },
    { tag: "gateway", title: "Gateway" },
    { tag: "site", title: "Site" },
    { tag: "block", title: "Block" },
    { tag: "lns", title: "LNS" },
    {
      tag: "dashboard",
      title: "Dashboard",
      subPermissions: [{ tag: "view", title: "View" }],
    },
    {
      tag: "fleetdashboard",
      title: "Fleet Dashboard",
      subPermissions: [{ tag: "view", title: "View" }],
    },
    {
      tag: "firmware",
      title: "Firmware",
      subPermissions: [
        { tag: "view", title: "View" },
        { tag: "add", title: "Add" },
      ],
    },
    {
      tag: "multifirmware",
      title: "Multicast Firmware",
      subPermissions: [
        { tag: "view", title: "View" },
        { tag: "add", title: "Add" },
      ],
    },
    {
      tag: "task",
      title: "Task Report",
      subPermissions: [{ tag: "view", title: "View" }],
    },
    {
      tag: "login",
      title: "Login Report",
      subPermissions: [{ tag: "view", title: "View" }],
    },
    {
      tag: "operational",
      title: "Operational Report",
      subPermissions: [{ tag: "view", title: "View" }],
    },
    {
      tag: "motor",
      title: "Motor Report",
      subPermissions: [{ tag: "view", title: "View" }],
    },
    {
      tag: "other",
      title: "Other Report",
      subPermissions: [{ tag: "view", title: "View" }],
    },
    {
      tag: "alarm",
      title: "Robot Alarm",
      subPermissions: [{ tag: "view", title: "View" }],
    },
    {
      tag: "processed",
      title: "Processed Alarm",
      subPermissions: [{ tag: "view", title: "View" }],
    },
    {
      tag: "robotconfig",
      title: "Robot Config",
      subPermissions: [
        { tag: "edit", title: "Edit" },
        { tag: "refresh", title: "Refresh" },
      ],
    },
    {
      tag: "robotcommand",
      title: "Robot Command",
      subPermissions: [
        { tag: "clean", title: "Clean" },
        { tag: "standby", title: "Standby" },
        { tag: "left", title: "Left" },
        { tag: "right", title: "Right" },
        { tag: "home", title: "Home" },
        { tag: "brushreverse", title: "Brush Motor Reverse" },
        { tag: "brushforward", title: "Brush Motor Forward" },
        { tag: "brushstop", title: "Brush Motor Stop" },
        { tag: "leftreverse", title: "Left Motor Reverse" },
        { tag: "leftforward", title: "Left Motor Forward" },
        { tag: "leftstop", title: "Left Motor Stop" },
        { tag: "rightreverse", title: "Right Motor Reverse" },
        { tag: "rightforward", title: "Right Motor Reverse" },
        { tag: "rightstop", title: "Right Motor Stop" },
      ],
    },
    {
      tag: "blockcommand",
      title: "Block Command",
      subPermissions: [
        { tag: "settime", title: "Set Time" },
        { tag: "clean", title: "Clean" },
        { tag: "standby", title: "Standby" },
        { tag: "left", title: "Left" },
        { tag: "right", title: "Right" },
        { tag: "home", title: "Home" },
        { tag: "enterchargingstate", title: "Enter Charging State" },
        { tag: "exitchargingstate", title: "Exit Charging State" },
        { tag: "entermaintenancestate", title: "Enter Maintenance State" },
        { tag: "exitmaintenancestate", title: "Exit Maintenance State" },
        { tag: "softreset", title: "Soft Reset" },
      ],
    },
    {
      tag: "robottreelevelcommand",
      title: "Robot Tree Level Command",
      subPermissions: [
        { tag: "clean", title: "Clean" },
        { tag: "standby", title: "Standby" },
        { tag: "left", title: "Left" },
        { tag: "right", title: "Right" },
        { tag: "home", title: "Home" },
        { tag: "enterchargingstate", title: "Enter Charging State" },
        { tag: "exitchargingstate", title: "Exit Charging State" },
        { tag: "entermaintenancestate", title: "Enter Maintenance State" },
        { tag: "exitmaintenancestate", title: "Exit Maintenance State" },
        { tag: "softreset", title: "Soft Reset" },
        { tag: "hardreset", title: "Hard Reset" },
        { tag: "fetchbattery", title: "Fetch Battery" },
        { tag: "rundiagnostic", title: "Run Diagnostic" },
        { tag: "brushmotor", title: "Brush Motor Check" },
        { tag: "leftmotor", title: "Left Motor Check" },
        { tag: "rightmotor", title: "Right Motor Check" },
        { tag: "gps", title: "GPS Check" },
        { tag: "imu", title: "IMU Check" },
        { tag: "battery", title: "Battery Check" },
      ],
    },
  ];

  const [open, setOpen] = useState(false);
  const [addOrEdit, setAddOrEdit] = useState("Add");
  const [data, setData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [id, setId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedData, setSelectedData] = useState({});

  let initialValues = {
    role: id ? selectedData?.name : "",
    permissions: id
      ? selectedData?.permissions?.length
        ? selectedData?.permissions
        : []
      : [],
  };

  useEffect(() => {
    handleGetRoles();
  }, []);

  const handleOpen = (op) => {
    setOpen(true);
    setAddOrEdit(op);
  };

  const handleClose = () => {
    setId("");
    formRef.current.resetForm();
    setOpen(false);
  };

  const handleOpenDelete = (id) => {
    setOpenDelete(true);
    setId(id);
  };

  const handleCloseDelete = () => {
    setId("");
    setOpenDelete(false);
  };

  const onChangeCheckBox = (value) => {
    if (formRef?.current?.values?.permissions?.includes(value)) {
      const newData = formRef?.current?.values?.permissions?.filter(function (
        item
      ) {
        return item !== value;
      });
      formRef.current.setFieldValue("permissions", [...new Set([...newData])]);
    } else {
      const newData = [...formRef?.current?.values?.permissions];
      newData.push(value);
      formRef.current.setFieldValue("permissions", [...new Set([...newData])]);
    }
  };

  const checkUncheckAllType = (action, type) => {
    const standardModules = modules.filter((m) => !m.subPermissions);
    if (action === "add") {
      let updatedData = standardModules?.map((ele) => {
        return ele?.tag + type;
      });
      formRef.current.setFieldValue("permissions", [
        ...new Set([...formRef?.current?.values?.permissions, ...updatedData]),
      ]);
    } else {
      const data = standardModules?.map((ele) => {
        return ele?.tag + type;
      });
      const removedArray = formRef?.current?.values?.permissions?.filter(
        (el) => !data?.includes(el)
      );
      formRef.current.setFieldValue("permissions", removedArray);
    }
  };

  const handleGetRoles = async () => {
    setLoading(true);
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_ADD_EDIT_ROLES
      );
      if (res.status === 200) {
        setData(res.data);
        setFilterData(res.data);
      } else {
        PagesIndex.toasterError(res.message);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEditRole = (values) => {
    const params = new URLSearchParams();
    params.append("name", values?.role);
    params.append(
      "permissions",
      JSON.stringify([...new Set(formRef?.current?.values?.permissions)])
    );

    if (formRef?.current?.values?.permissions.length) {
      if (id) {
        params.append("id", id);
      }
      PagesIndex.apiPostHandler(PagesIndex.Api.GET_ADD_EDIT_ROLES, params)
        .then((res) => {
          if (res.status) {
            PagesIndex.toasterSuccess(res.message);
            handleClose();
            handleGetRoles();
            setSearchValue("");
          } else {
            PagesIndex.toasterError(res.message);
          }
        })
        .catch((err) => {
          PagesIndex.toasterError(err.response.data.message);
        });
    }
  };

  const handleDeleteRole = () => {
    PagesIndex.apiDeleteHandler(PagesIndex.Api.GET_ADD_EDIT_ROLES, id).then(
      (res) => {
        if (res.status) {
          handleCloseDelete();
          handleGetRoles();
          PagesIndex.toasterSuccess(res.message);
        } else {
          PagesIndex.toasterError(res.message);
        }
      }
    );
  };

  const requestSearch = (e) => {
    setSearchValue(e.target.value);
    let result = data.filter((data) => {
      let role = data?.name
        ?.toLowerCase()
        ?.includes(e?.target?.value?.toLowerCase());
      const date = new Date(data?.createdAt);
      const formattedDate = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      let filterDate = formattedDate.includes(e?.target?.value);
      return role || filterDate;
    });
    setCurrentPage(1);
    setFilterData(result);
  };

  // CHANGE START: Reverted to the single-list permission rendering function
  const renderRolePermistionModal = (values) => {
    return modules?.map((data) => {
      const permissionsToShow = data.subPermissions
        ? data.subPermissions
        : [
            { tag: "view", title: "View" },
            { tag: "add", title: "Add" },
            { tag: "edit", title: "Edit" },
            { tag: "delete", title: "Delete" },
          ];

      return (
        <Index.Box
          key={data.tag}
          className="role-permission-flex"
          sx={{ borderTop: "1px solid #eee", pt: 1.5, mt: 1.5 }}
        >
          <Index.Box className="role-permission-left-main">
            <Index.Typography className="role-permission-name">
              {data?.title}
            </Index.Typography>
          </Index.Box>
          <Index.Box className="role-permission-right-main">
            <Index.Box
              sx={{ display: "flex", flexWrap: "wrap", width: "100%" }}
            >
              {permissionsToShow.map((perm) => (
                <Index.Box key={perm.tag} sx={{ width: "25%", mb: 1 }}>
                  <Index.Box sx={{ display: "flex", alignItems: "center" }}>
                    <BpCheckbox
                      checked={values?.permissions?.includes(
                        `${data.tag}_${perm.tag}`
                      )}
                      onChange={() =>
                        onChangeCheckBox(`${data.tag}_${perm.tag}`)
                      }
                    />
                    <Index.Typography
                      className="admin-checkbox-lable"
                      sx={{ fontSize: "13px" }}
                    >
                      {perm.title}
                    </Index.Typography>
                  </Index.Box>
                </Index.Box>
              ))}
            </Index.Box>
          </Index.Box>
        </Index.Box>
      );
    });
  };
  // CHANGE END

  const renderAddEditModal = (
    values,
    errors,
    touched,
    handleChange,
    handleSubmit
  ) => {
    const standardModulesCount = modules.filter(
      (m) => !m.subPermissions
    ).length;

    return (
      <Index.Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className="admin-modal"
      >
        <form noValidate="novalidate" onSubmit={handleSubmit}>
          <Index.Box
            sx={style}
            className="admin-add-role-modal-inner-main admin-modal-inner"
          >
            <Index.Box className="admin-modal-header">
              <Index.Typography
                id="modal-modal-title"
                className="admin-modal-title"
                variant="h6"
                component="h2"
              >
                {addOrEdit} Role
              </Index.Typography>
            </Index.Box>
            <Index.Box
              className="modal-body"
              sx={{ flex: "1 1 auto", overflow: "hidden" }}
            >
              {/* CHANGE END */}
              <Index.Box className="admin-modal-hgt-scroll cus-scrollbar">
                <Index.Box className="add-role-main">
                  <Index.Box className="add-role-content-main">
                    <Index.Box className="admin-input-box admin-add-user-input">
                      <Index.FormHelperText className="admin-form-lable">
                        Role<span className="astrick-sing">*</span>
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          name="role"
                          fullWidth
                          id="fullWidth"
                          className="admin-form-control"
                          placeholder="Enter Role"
                          onChange={handleChange}
                          value={values?.role}
                          error={errors?.role && touched?.role}
                          inputProps={{ maxLength: 30 }}
                        />
                        <Index.FormHelperText error>
                          {errors?.role && touched?.role ? errors?.role : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="add-permission-section admin-input-box">
                    <Index.Typography className="add-permission-title">
                      Permissions<span className="astrick-sing">*</span>
                    </Index.Typography>
                    {/* CHANGE START: The single-list permission box is back */}
                    <Index.Box className="role-permission-main">
                      <Index.Box className="role-permission-flex">
                        <Index.Box className="role-permission-left-main">
                          <Index.Typography className="role-permission-name">
                            All
                          </Index.Typography>
                        </Index.Box>
                        <Index.Box className="role-permission-right-main">
                          <Index.Box className="role-permission-check-flex">
                            <Index.Box className="role-permission-check-main">
                              <Index.Box className="admin-checkbox-main">
                                <BpCheckbox
                                  checked={
                                    values?.permissions?.filter((data) =>
                                      data?.includes("_view")
                                    ).length === standardModulesCount &&
                                    standardModulesCount > 0
                                  }
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      checkUncheckAllType("add", "_view");
                                    } else {
                                      checkUncheckAllType("remove", "_view");
                                    }
                                  }}
                                />
                                <Index.Typography className="admin-checkbox-lable">
                                  View
                                </Index.Typography>
                              </Index.Box>
                            </Index.Box>
                            <Index.Box className="role-permission-check-main">
                              <Index.Box className="admin-checkbox-main">
                                <BpCheckbox
                                  checked={
                                    values?.permissions?.filter((data) =>
                                      data?.includes("_add")
                                    ).length === standardModulesCount &&
                                    standardModulesCount > 0
                                  }
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      checkUncheckAllType("add", "_add");
                                    } else {
                                      checkUncheckAllType("remove", "_add");
                                    }
                                  }}
                                />
                                <Index.Typography className="admin-checkbox-lable">
                                  Add
                                </Index.Typography>
                              </Index.Box>
                            </Index.Box>

                            <Index.Box className="role-permission-check-main">
                              <Index.Box className="admin-checkbox-main">
                                <BpCheckbox
                                  checked={
                                    values?.permissions?.filter((data) =>
                                      data?.includes("_edit")
                                    ).length === standardModulesCount &&
                                    standardModulesCount > 0
                                  }
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      checkUncheckAllType("add", "_edit");
                                    } else {
                                      checkUncheckAllType("remove", "_edit");
                                    }
                                  }}
                                />
                                <Index.Typography className="admin-checkbox-lable">
                                  Edit
                                </Index.Typography>
                              </Index.Box>
                            </Index.Box>
                            <Index.Box className="role-permission-check-main">
                              <Index.Box className="admin-checkbox-main">
                                <BpCheckbox
                                  checked={
                                    values?.permissions?.filter((data) =>
                                      data?.includes("_delete")
                                    ).length === standardModulesCount &&
                                    standardModulesCount > 0
                                  }
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      checkUncheckAllType("add", "_delete");
                                    } else {
                                      checkUncheckAllType("remove", "_delete");
                                    }
                                  }}
                                />
                                <Index.Typography className="admin-checkbox-lable">
                                  Delete
                                </Index.Typography>
                              </Index.Box>
                            </Index.Box>
                          </Index.Box>
                        </Index.Box>
                      </Index.Box>
                      {renderRolePermistionModal(values)}
                      <Index.FormHelperText error>
                        {errors?.permissions && touched?.permissions
                          ? errors?.permissions
                          : null}
                      </Index.FormHelperText>
                    </Index.Box>
                    {/* CHANGE END */}
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
                  <Index.Button
                    className="admin-save-user-btn btn-primary"
                    type="submit"
                  >
                    <img
                      src={PagesIndex.Svg.save}
                      className="admin-user-save-icon"
                      alt="Save"
                    />
                    <span>{id ? "Update" : "Add"}</span>
                  </Index.Button>
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </form>
      </Index.Modal>
    );
  };

  // The rest of the component (return statement with DataTable etc.) remains unchanged.
  return (
    <>
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
        <Index.Box className="admin-dashboard-content admin-user-list-content">
          <Index.Box className="admin-user-list-flex admin-page-title-main">
            <Index.Typography
              className="admin-page-title admin-user-list-page-title"
              component="h2"
              variant="h2"
            >
              Role List
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
              {permissions?.includes("role_add") && (
                <Index.Box className="admin-userlist-inner-btn-flex">
                  <Index.Box className="admin-adduser-btn-main btn-main-primary">
                    <Index.Button
                      className="admin-adduser-btn btn-primary"
                      onClick={() => {
                        handleOpen("Add");
                      }}
                    >
                      <img
                        src={PagesIndex.Svg.plus}
                        className="admin-plus-icon"
                        alt="plus"
                      />
                      <span>Add Role</span>
                    </Index.Button>
                  </Index.Box>
                </Index.Box>
              )}
            </Index.Box>
          </Index.Box>

          <Index.Box className="card-border common-card">
            <DataTable
              headerData={[
                { field: "Sr. No." },
                { field: "Role Name" },
                { field: "Created At" },
                { field: "Updated At" },
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
                            {(currentPage - 1) * 10 + i + 1}
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
                            {data?.createdAt
                              ? moment(data?.createdAt).format(
                                  "DD-MM-YYYY hh:mm A"
                                )
                              : ""}
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
                            {data?.updatedAt
                              ? moment(data?.updatedAt).format(
                                  "DD-MM-YYYY hh:mm A"
                                )
                              : ""}
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
                          {permissions?.includes("role_edit") && (
                            <Index.Tooltip
                              title="Edit"
                              arrow
                              placement="bottom"
                              className="admin-tooltip"
                            >
                              <Index.Button
                                className="admin-table-data-btn"
                                onClick={() => {
                                  handleOpen("Edit");
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

                          {permissions?.includes("role_delete") && (
                            <Index.Tooltip
                              title="Delete"
                              arrow
                              placement="bottom"
                              className="admin-tooltip"
                            >
                              <Index.Button
                                className="admin-table-data-btn"
                                onClick={() => {
                                  handleOpenDelete(data?.id);
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
      <PagesIndex.Formik
        enableReinitialize
        onSubmit={handleAddEditRole}
        initialValues={initialValues}
        validationSchema={PagesIndex.rolesSchema}
        innerRef={formRef}
      >
        {({ values, errors, touched, handleChange, handleSubmit }) =>
          renderAddEditModal(
            values,
            errors,
            touched,
            handleChange,
            handleSubmit
          )
        }
      </PagesIndex.Formik>
      <PagesIndex.PopupModal
        open={openDelete}
        handleClose={handleCloseDelete}
        handleFunction={handleDeleteRole}
        buttonSpinner={loading}
      />
    </>
  );
}
