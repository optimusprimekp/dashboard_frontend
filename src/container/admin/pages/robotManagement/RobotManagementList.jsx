import {
  CircularProgress,
  styled,
  TextField,
  MenuItem,
  FormHelperText,
  Menu,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import PageIndex from "../../../../component/PagesIndex";
import DataTableNew from "../../../../component/common/dataTable/DataTableNew";
import PopupModal from "../../../../component/common/popupModal/PopupModal";
import ActionButton from "../../../../component/common/Button/ActionButton";

// for modal design
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
};

// Custom checkbox styles
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
  "input:hover ~ &": { backgroundColor: "transparent" },
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

export default function RobotManagementList() {
  const { profile } = useContext(PageIndex.ProfileContext);
  const permissions = profile?.Role?.permissions || [];
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [id, setId] = useState("");
  const [selectedDate, setSelectedData] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [siteListData, setSiteListData] = useState([]);
  const [rowListData, setRowListData] = useState([]);
  const [blockListData, setBlockListData] = useState([]);
  const [groupId, setGroupId] = useState("");
  const [selectedRobots, setSelectedRobots] = useState([]);
  const [site, setSite] = useState("");
  const [block, setBlock] = useState("");
  const [status, setStatus] = useState("");
  const [tenant, setTenant] = useState({});
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");

  // tracks which command key is in-flight so we can show spinner
  const [sendingCommand, setSendingCommand] = useState(null);

  // --- COLUMN CUSTOMIZATION STATE ---
  const [anchorElCols, setAnchorElCols] = useState(null);
  const openColsMenu = Boolean(anchorElCols);
  const fixedColumns = ["sr_no", "name", "lastSeen", "status", "action"];

  const initialValues = {
    robot_name: id ? selectedDate?.name : "",
    device_eui: id ? selectedDate?.devEui : "",
    app_key: id ? selectedDate?.app_key : "",
    block_id: id ? selectedDate?.block_id : "",
    site: id ? selectedDate?.siteId : "",
    cod: id ? selectedDate?.comminssioningDate : "",
    mac_address: id ? selectedDate?.macAddress : "",
    firmware_version: id ? selectedDate?.firmwareVersion : "",
    hardware_version: id ? selectedDate?.hardwareVersion : "",
    serial_no: id ? selectedDate?.serialNumber : "",
    model_no: id ? selectedDate?.modelNo : "",
    type: id ? selectedDate?.deviceType : "",
    latitude: id ? selectedDate?.latitude : "",
    longitude: id ? selectedDate?.longitude : "",
    row: id ? selectedDate?.rowId : "",
  };
  const initialValuesUpload = { file: "" };

  // add / edit modal
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = (resetForm) => {
    setOpen(false);
    setId("");
    setTenant({});
    if (typeof resetForm === "function") resetForm();
  };

  // delete modal
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  // upload modal
  const [openUpload, setOpenUpload] = useState(false);
  const handleOpenUpload = () => setOpenUpload(true);
  const handleCloseUpload = () => setOpenUpload(false);

  // multicast modal
  const [openMultiCast, setOpenMultiCast] = useState(false);
  const handleOpenMultiCastModal = () => setOpenMultiCast(true);
  const handleCloseMultiCastModal = () => {
    setOpenMultiCast(false);
    setGroupId("");
  };

  // multicommand modal
  const [openMultiCommand, setOpenMultiCommand] = useState(false);
  const handleCloseMultiCommandModal = () => {
    setOpenMultiCommand(false);
    setSelectedRobots([]);
  };

  // ─── SELECT / DESELECT ────────────────────────────────────────────────────
  const handleSelectRobot = (robotId) => {
    if (selectedRobots.includes(robotId)) {
      setSelectedRobots((prev) => prev.filter((r) => r !== robotId));
    } else if (selectedRobots.length < 50) {
      setSelectedRobots((prev) => [...prev, robotId]);
    } else {
      PagesIndex.toasterError("You can select only 50 robots at a time");
    }
  };

  // ─── SEND COMMAND — same signature as RobotControlNew.handleCommands ──────
  //     devEui = robot's devEui string
  //     buttonKey = named command e.g. "CLEAN_ONE_CYCLE"
  const handleCommands = async (devEui, buttonKey) => {
    const payload = { devEui, type: buttonKey };
    const res = await PagesIndex.apiPostHandler(
      `${PagesIndex.Api.GET_ADD_EDIT_DEVICES}/queue`,
      payload,
    );
    if (res?.status === 200) {
      // success toast shown once at bulk level, not per-robot
    } else {
      PagesIndex.toasterError(res?.message || "Command failed");
    }
  };

  // ─── BULK COMMAND — fires handleCommands for all selected robots ──────────
  const handleBulkCommand = async (buttonKey) => {
    if (sendingCommand) return;
    setSendingCommand(buttonKey);
    try {
      await Promise.all(
        selectedRobots.map((robotDevEui) =>
          handleCommands(robotDevEui, buttonKey),
        ),
      );
      PagesIndex.toasterSuccess(
        `Command sent to ${selectedRobots.length} robot${selectedRobots.length > 1 ? "s" : ""}`,
      );
    } catch (e) {
      PagesIndex.toasterError("One or more commands failed");
    } finally {
      setSendingCommand(null);
    }
  };

  // ─── DATA FETCHING ────────────────────────────────────────────────────────
  const getList = async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page || currentPage,
        pageSize: filters.pageSize || pageSize,
        ...filters,
      });
      const apiUrl = `${PagesIndex.Api.GET_ADD_EDIT_DEVICES}?${params.toString()}`;
      const res = await PagesIndex.apiGetHandler(apiUrl);
      if (res?.status === 200 || res?.status === 201) {
        setData(res.data.devices);
        setTotalCount(res.data.pagination?.totalCount || res.data.length);
        setTotalPages(
          res.data.pagination?.totalPages ||
            Math.ceil(res.data.length / pageSize),
        );
      } else {
        PagesIndex.toasterError(res?.data?.message);
      }
    } catch (error) {
      PagesIndex.toasterError(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => setCurrentPage(page);
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  useEffect(() => {
    getList({ ...appliedFilters, page: currentPage, pageSize });
  }, [currentPage, pageSize, appliedFilters]);

  const handleApplyFilter = () => {
    if (fromDate && !toDate) {
      PagesIndex.toasterError(
        "To Date is required when From Date is selected.",
      );
      return;
    }
    const filters = {};
    if (site) filters.siteId = site;
    if (block) filters.blockId = block;
    if (fromDate)
      filters.fromDate = PagesIndex.moment(fromDate).format("YYYY-MM-DD");
    if (toDate) filters.toDate = PagesIndex.moment(toDate).format("YYYY-MM-DD");
    if (status) filters.status = status;
    if (searchValue) filters.search = searchValue;
    setAppliedFilters(filters);
    setCurrentPage(1);
    getList({ ...filters, page: 1, pageSize });
  };

  const handleResetFilter = () => {
    setSite("");
    setBlock("");
    setFromDate(null);
    setToDate(null);
    setStatus("");
    setSearchValue("");
    setAppliedFilters({});
    setCurrentPage(1);
    getList({ page: 1, pageSize });
  };

  const getSiteList = useCallback(async () => {
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_ADD_EDIT_SITE,
      );
      if (res.status === 200 || res.status === 201) setSiteListData(res?.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getRowList = useCallback(async () => {
    try {
      const res = await PagesIndex.apiGetHandler(PagesIndex.Api.GET_ROWS);
      if (res.status === 200) setRowListData(res?.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getBlockList = useCallback(async () => {
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_ADD_EDIT_BLOCKS,
      );
      if (res.status === 200 || res.status === 201) setBlockListData(res?.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getTenant = useCallback(async (siteId, setFieldValue) => {
    if (!siteId) return;
    try {
      const res = await PagesIndex.apiGetHandler(
        `${PagesIndex.Api.CHIRPSTACK}/site/${siteId}`,
      );
      if (res.status === 200) {
        setTenant(res?.data);
        if (res?.data?.length === 1) {
          setFieldValue("application_id", res.data.applicationId);
          setFieldValue("deviceProfile_id", res.data.deviceProfileId);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getList({});
    getSiteList();
    getBlockList();
    getRowList();
  }, [getSiteList, getBlockList, getRowList]);

  const handleSubmit = async (values) => {
    setButtonSpinner(true);
    try {
      const payload = id
        ? {
            id,
            name: values.robot_name,
            serialNumber: values.serial_no,
            modelNo: values.model_no,
            hardwareVersion: values.hardware_version,
            siteId: values.site,
            deviceType: values.type,
            devEui: values.device_eui,
            rowId: values.row,
          }
        : {
            name: values.robot_name,
            siteId: values.site,
            blockId: values.block_id,
            modelNo: values.model_no,
            deviceType: values.type,
            serialNumber: values.serial_no,
            hardwareVersion: values.hardware_version,
            comminssioningDate: values.cod,
            devEui: values.device_eui,
            app_key: values.app_key,
            applicationId: values.application_id,
            deviceProfileId: values.deviceProfile_id,
            rowId: values.row,
          };

      const res = await PagesIndex.apiPostHandler(
        PagesIndex.Api.GET_ADD_EDIT_DEVICES,
        payload,
      );
      if (res?.status === 200 || res?.status === 201) {
        getList({});
        setId("");
        handleClose();
        PagesIndex.toasterSuccess(res.message);
      } else {
        PagesIndex.toasterError(res?.message);
      }
    } catch (error) {
      PagesIndex.toasterError(
        error?.response?.data?.message || "Something went wrong",
      );
    } finally {
      setButtonSpinner(false);
    }
  };

  const handleUpload = async (values) => {
    setButtonSpinner(true);
    const formData = new FormData();
    formData.append("file", values?.file);
    try {
      const res = await PagesIndex.apiPostHandler(
        PagesIndex.Api.GET_ADD_EDIT_DEVICES + "/import",
        formData,
      );
      if (res?.status === 200 || res?.status === 201) {
        getList({});
        handleCloseUpload();
        PagesIndex.toasterSuccess(res?.message);
      } else {
        PagesIndex.toasterError(res?.message);
      }
    } catch (error) {
      PagesIndex.toasterError(error?.response?.data?.message);
    } finally {
      setButtonSpinner(false);
    }
  };

  const handleDelete = async () => {
    setButtonSpinner(true);
    try {
      const res = await PagesIndex.apiDeleteHandler(
        PagesIndex.Api.GET_ADD_EDIT_DEVICES,
        selectedId,
      );
      if (res?.status === 200) {
        getList({});
        PagesIndex.toasterSuccess(res?.message);
        setOpenDeleteModal(false);
        setSelectedId("");
      } else {
        PagesIndex.toasterError(res?.message);
      }
    } catch (error) {
      PagesIndex.toasterError(error?.response?.data?.message);
    } finally {
      setButtonSpinner(false);
    }
  };

  const executeCommand = async (command) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_CHIRPSTACK_BASE_URL}/${PagesIndex.Api.MULTICAST_GROUPS}/${groupId}/queue`,
        { queueItem: { data: command, fPort: 8 } },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_CHIRPSTACK_TOKEN}`,
          },
        },
      );
      if (res?.status) {
        handleCloseMultiCastModal();
        PagesIndex.toasterSuccess("Command in progress");
      }
    } catch (error) {
      PagesIndex.toasterError(error?.response?.data?.message);
    }
  };

  const generateExcel = async () => {
    const headers = [
      "siteId",
      "name",
      "devEui",
      "app_key",
      "comminssioningDate",
      "serialNumber",
      "modelNo",
      "deviceType",
    ];
    const workbook = PagesIndex.XLSX.utils.book_new();
    const worksheet = PagesIndex.XLSX.utils.json_to_sheet([]);
    PagesIndex.XLSX.utils.sheet_add_aoa(worksheet, [headers]);
    PagesIndex.XLSX.utils.book_append_sheet(workbook, worksheet, "Sample");
    PagesIndex.XLSX.writeFile(workbook, "Sample.xlsx", { compression: true });
  };

  const sites = siteListData?.map((item) => ({
    label: item?.name,
    value: item?.id,
  }));
  const blocks = blockListData?.map((item) => ({
    label: item?.name,
    value: item?.id,
  }));
  const statusData = [
    { label: "Online", value: "ONLINE" },
    { label: "Offline", value: "OFFLINE" },
  ];

  // ─── SORTING ──────────────────────────────────────────────────────────────
  const descendingComparator = (a, b, getVal) => {
    const A = getVal(a) ?? "";
    const B = getVal(b) ?? "";
    if (B < A) return -1;
    if (B > A) return 1;
    return 0;
  };
  const getComparator = (ord, getVal) =>
    ord === "desc"
      ? (a, b) => descendingComparator(a, b, getVal)
      : (a, b) => -descendingComparator(a, b, getVal);

  const stableSort = (array, comparator) => {
    const stabilized = (array ?? []).map((el, idx) => [el, idx]);
    stabilized.sort((a, b) => {
      const o = comparator(a[0], b[0]);
      return o !== 0 ? o : a[1] - b[1];
    });
    return stabilized.map((el) => el[0]);
  };

  const valueGetter = useCallback(
    (row) => {
      switch (orderBy) {
        case "rowno":
          return row?.table_row?.rowNo;
        case "cod": {
          const dt = row?.comminssioningDate ?? row?.createdAt;
          return dt ? new Date(dt).getTime() : 0;
        }
        case "lastSeen":
          return row?.lastSeen ? new Date(row.lastSeen).getTime() : 0;
        default:
          return "";
      }
    },
    [orderBy],
  );

  function generateAppKeyFromDevEui(devEuiHex) {
    if (!devEuiHex || devEuiHex.length !== 16) return "";
    const devEUI = [];
    for (let i = 0; i < 16; i += 2)
      devEUI.push(parseInt(devEuiHex.slice(i, i + 2), 16));
    let hash = 0;
    for (let i = 0; i < 8; i++) hash ^= devEUI[i] << ((i % 4) * 8);
    hash ^= hash >>> 13;
    hash ^= hash << 7;
    hash &= 0x01ffffff;
    if (hash === 0) hash = 0x00000001;
    const devAddr = new Uint8Array(4);
    devAddr[0] = (hash >>> 24) & 0xff;
    devAddr[1] = (hash >>> 16) & 0xff;
    devAddr[2] = (hash >>> 8) & 0xff;
    devAddr[3] = hash & 0xff;
    return Array.from(devAddr)
      .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
      .join("");
  }

  const handleRequestSort = (colId) => {
    setOrder((prev) => (orderBy === colId && prev === "asc" ? "desc" : "asc"));
    setOrderBy(colId);
  };

  const pageRows = useMemo(
    () => stableSort(data ?? [], getComparator(order, valueGetter)),
    [data, order, valueGetter],
  );

  // ─── COLUMN CUSTOMIZATION ─────────────────────────────────────────────────
  const handleColsMenuClick = (event) => setAnchorElCols(event.currentTarget);
  const handleColsMenuClose = () => setAnchorElCols(null);

  const allColumns = useMemo(
    () => [
      {
        id: "sr_no",
        label: "Sr. No.",
        render: (row, index) => (currentPage - 1) * pageSize + (index + 1),
      },
      { id: "name", label: "Robot Name", render: (row) => row?.name },
      { id: "devEui", label: "DevEui", render: (row) => row?.devEui },
      {
        id: "rowno",
        label: "Row No.",
        sortable: true,
        render: (row) => row?.table_row?.rowName ?? "-",
      },
      {
        id: "serialNumber",
        label: "Robot Serial No.",
        sortable: true,
        render: (row) => row?.serialNumber ?? "-",
      },
      {
        id: "modelNo",
        label: "Modal No.",
        render: (row) => row?.modelNo ?? "-",
      },
      {
        id: "siteName",
        label: "Site Name",
        render: (row) => row?.site?.name ?? "-",
      },
      {
        id: "FW Version",
        label: "FW Version",
        render: (row) => row?.firmwareVersion ?? "-",
      },
      {
        id: "cod",
        label: "COD",
        sortable: true,
        render: (row) =>
          row?.comminssioningDate
            ? PagesIndex.moment(row?.comminssioningDate).format("DD-MM-YYYY")
            : PagesIndex.moment(row.createdAt).format("DD-MM-YYYY"),
      },
      {
        id: "lastSeen",
        label: "Last Seen At",
        sortable: true,
        render: (row) =>
          row?.lastSeen
            ? PagesIndex.moment(row?.lastSeen).format("DD-MM-YYYY HH:mm")
            : "-",
      },
      {
        id: "status",
        label: "Status",
        align: "center",
        render: (row) =>
          row?.status === "ONLINE" ? (
            <img
              src={PagesIndex.Svg.online}
              className="admin-status-icon"
              alt="Online"
            />
          ) : (
            <img
              src={PagesIndex.Svg.offline}
              className="admin-status-icon"
              alt="Offline"
            />
          ),
      },
      {
        id: "action",
        label: "Action",
        align: "center",
        render: (row) => (
          <Index.Box
            className="admin-table-data-btn-flex"
            sx={{ justifyContent: "center" }}
          >
            {permissions?.includes("robot_edit") && (
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
            {permissions?.includes("robot_view") && (
              <Index.Tooltip
                title="View"
                arrow
                placement="bottom"
                className="admin-tooltip"
              >
                <Index.Button
                  className="admin-table-data-btn"
                  onClick={() =>
                    navigate(
                      `/admin/control-flow/${row?.applicationId}/${row?.devEui}`,
                      { state: { data: row } },
                    )
                  }
                >
                  <img
                    src={PagesIndex.Svg.yelloweye}
                    className="admin-icon"
                    alt="View"
                  />
                </Index.Button>
              </Index.Tooltip>
            )}
            {permissions?.includes("robot_delete") && (
              <Index.Tooltip
                title="Delete"
                arrow
                placement="bottom"
                className="admin-tooltip"
              >
                <Index.Button
                  className="admin-table-data-btn"
                  onClick={() => {
                    setSelectedId(row?.id);
                    setOpenDeleteModal(true);
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
        ),
      },
    ],
    [permissions, currentPage, pageSize, navigate],
  );

  const [visibleColumns, setVisibleColumns] = useState(
    allColumns.map((col) => col.id),
  );

  const handleColumnToggle = (columnId) => {
    if (fixedColumns.includes(columnId)) return;
    setVisibleColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((c) => c !== columnId)
        : [...prev, columnId],
    );
  };

  const dynamicHeaderData = useMemo(() => {
    const checkboxCol = [{ field: "" }];
    const otherCols = allColumns
      .filter((col) => visibleColumns.includes(col.id))
      .map((col) => ({
        field: col.label,
        id: col.id,
        sortable: col.sortable,
        align: col.align,
      }));
    return [...checkboxCol, ...otherCols];
  }, [allColumns, visibleColumns]);

  // ─── COMMAND BAR CONFIG ───────────────────────────────────────────────────
  // buttonKey = named strings accepted by your /queue API (same as RobotControlNew)
  // imgSRC    = icons confirmed present in your SVG index (used in multicast modal)
  const commandBarButtons = [
    {
      key: "CLEAN_ONE_CYCLE",
      label: "Clean",
      imgSRC: PagesIndex.Svg.powerButton,
      imgAlt: "Clean",
      bgColor: "rgba(55,126,34,0.1)",
      textColor: "rgba(55,126,34,1)",
      borderColor: "rgba(55,126,34,0.3)",
    },
    {
      key: "LEFT_START",
      label: "Run Left",
      imgSRC: PagesIndex.Svg.leftArrowIcon,
      imgAlt: "Run Left",
      bgColor: "rgba(0,0,255,0.1)",
      textColor: "blue",
      borderColor: "rgba(0,0,255,0.3)",
    },
    {
      key: "STOP_ROBOT",
      label: "Standby",
      imgSRC: PagesIndex.Svg.stopIcon,
      imgAlt: "Standby",
      bgColor: "rgba(255,0,0,0.1)",
      textColor: "red",
      borderColor: "rgba(255,0,0,0.3)",
    },
    {
      key: "RIGHT_START",
      label: "Run Right",
      imgSRC: PagesIndex.Svg.rightArrowIcon,
      imgAlt: "Run Right",
      bgColor: "rgba(0,0,255,0.1)",
      textColor: "blue",
      borderColor: "rgba(0,0,255,0.3)",
    },
    {
      key: "HOME",
      label: "Home",
      imgSRC: PagesIndex.Svg.homeIcon,
      imgAlt: "Home",
      bgColor: "rgba(0,0,255,0.1)",
      textColor: "blue",
      borderColor: "rgba(0,0,255,0.3)",
    },
  ];
  return (
    <>
      <Index.Box className="admin-dashboard-content admin-user-list-content">
        {/* ── PAGE TITLE + HEADER ACTIONS ── */}
        <Index.Box className="admin-page-title-main">
          <Index.Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <Index.Typography
              className="admin-page-title admin-user-list-page-title"
              component="h2"
              variant="h2"
            >
              Robot List
            </Index.Typography>
            <Index.Box sx={{ display: "flex", gap: "10px" }}>
              {/* Columns toggle */}
              <Index.Box className="admin-export-btn-main border-btn-main">
                <Index.Button
                  className="admin-export-btn border-btn"
                  onClick={handleColsMenuClick}
                >
                  <img
                    src={PagesIndex.Svg.columns}
                    className="admin-down-icon admin-icon"
                    alt="columns"
                  />
                  Columns
                </Index.Button>
                <Menu
                  anchorEl={anchorElCols}
                  open={openColsMenu}
                  onClose={handleColsMenuClose}
                  PaperProps={{ style: { maxHeight: 300, width: "25ch" } }}
                >
                  <Index.Box sx={{ p: 2 }}>
                    <Index.Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Show/Hide Columns
                    </Index.Typography>
                    {allColumns.map((col) => (
                      <Index.Box key={col.id}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={visibleColumns.includes(col.id)}
                              disabled={fixedColumns.includes(col.id)}
                              onChange={() => handleColumnToggle(col.id)}
                              size="small"
                            />
                          }
                          label={
                            <Index.Typography variant="body2">
                              {col.label}
                            </Index.Typography>
                          }
                        />
                      </Index.Box>
                    ))}
                  </Index.Box>
                </Menu>
              </Index.Box>

              {/* Sample file */}
              <Index.Box className="admin-export-btn-main border-btn-main">
                <Index.Button
                  className="admin-export-btn border-btn"
                  onClick={generateExcel}
                >
                  <img
                    src={PagesIndex.Svg.down}
                    className="admin-down-icon admin-icon"
                    alt="download"
                  />
                  Sample File
                </Index.Button>
              </Index.Box>

              {/* Import */}
              <Index.Box className="admin-export-btn-main border-btn-main">
                <Index.Button
                  className="admin-export-btn border-btn"
                  onClick={handleOpenUpload}
                >
                  <img
                    src={PagesIndex.Svg.down}
                    className="admin-down-icon admin-icon"
                    alt="download"
                  />
                  Import
                </Index.Button>
              </Index.Box>

              {/* Add robot */}
              {permissions?.includes("robot_add") && (
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
                    Pair New Robot
                  </Index.Button>
                </Index.Box>
              )}
            </Index.Box>
          </Index.Box>
        </Index.Box>

        {/* ── FILTER CARD ── */}
        <Index.Box
          className="card-border common-card"
          sx={{ marginBottom: "20px" }}
        >
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <Index.Grid container alignItems="flex-end" spacing={2}>
              {/* Site */}
              <Index.Grid item xs={12} sm={3} md>
                <FormHelperText
                  sx={{ fontWeight: "bold", color: "black", mb: 1 }}
                >
                  Site
                </FormHelperText>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (selected) =>
                      !selected ? (
                        <span style={{ color: "#6c757d" }}>Select Site</span>
                      ) : (
                        siteListData.find((s) => s.id === selected)?.name
                      ),
                  }}
                >
                  {sites.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Index.Grid>

              {/* Block */}
              <Index.Grid item xs={12} sm={3} md>
                <FormHelperText
                  sx={{ fontWeight: "bold", color: "black", mb: 1 }}
                >
                  Block
                </FormHelperText>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (selected) =>
                      !selected ? (
                        <span style={{ color: "#6c757d" }}>Select Block</span>
                      ) : (
                        blockListData.find((b) => b.id === selected)?.name
                      ),
                  }}
                >
                  {blocks.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Index.Grid>

              {/* From Date */}
              <Index.Grid item xs={12} sm={3} md>
                <FormHelperText
                  sx={{ fontWeight: "bold", color: "black", mb: 1 }}
                >
                  From Date
                </FormHelperText>
                <DatePicker
                  value={fromDate}
                  onChange={(v) => setFromDate(v)}
                  format="DD-MM-YYYY"
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      placeholder: "Select From Date",
                    },
                  }}
                />
              </Index.Grid>

              {/* To Date */}
              <Index.Grid item xs={12} sm={3} md>
                <FormHelperText
                  sx={{ fontWeight: "bold", color: "black", mb: 1 }}
                >
                  To Date
                </FormHelperText>
                <DatePicker
                  value={toDate}
                  onChange={(v) => setToDate(v)}
                  minDate={fromDate}
                  disabled={!fromDate}
                  format="DD-MM-YYYY"
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      placeholder: "Select To Date",
                    },
                  }}
                />
              </Index.Grid>

              {/* Status */}
              <Index.Grid item xs={12} sm={3} md>
                <FormHelperText
                  sx={{ fontWeight: "bold", color: "black", mb: 1 }}
                >
                  Status
                </FormHelperText>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (selected) =>
                      !selected ? (
                        <span style={{ color: "#6c757d" }}>Select Status</span>
                      ) : (
                        statusData.find((s) => s.value === selected)?.label
                      ),
                  }}
                >
                  {statusData.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Index.Grid>

              {/* Search */}
              <Index.Grid item xs={12} sm={3} md>
                <FormHelperText
                  sx={{ fontWeight: "bold", color: "black", mb: 1 }}
                >
                  Search
                </FormHelperText>
                <TextField
                  fullWidth
                  size="small"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyFilter();
                  }}
                  placeholder="Search by Robot Name, DevEui"
                />
              </Index.Grid>

              {/* Apply / Reset */}
              <Index.Grid item xs={12} sm={3} md="auto">
                <Index.Box sx={{ display: "flex", gap: 1 }}>
                  <Index.Button
                    onClick={handleApplyFilter}
                    variant="contained"
                    disabled={!!(fromDate && !toDate)}
                    disableElevation
                    sx={{
                      bgcolor: "#212529",
                      color: "white",
                      textTransform: "none",
                      borderRadius: "4px",
                      height: "40px",
                      "&:hover": { bgcolor: "#343a40" },
                    }}
                  >
                    Apply
                  </Index.Button>
                  <Index.Button
                    onClick={handleResetFilter}
                    variant="outlined"
                    sx={{
                      borderColor: "#ced4da",
                      color: "#212529",
                      textTransform: "none",
                      borderRadius: "4px",
                      height: "40px",
                      "&:hover": {
                        borderColor: "#adb5bd",
                        bgcolor: "rgba(0,0,0,0.04)",
                      },
                    }}
                  >
                    Reset
                  </Index.Button>
                </Index.Box>
              </Index.Grid>
            </Index.Grid>
          </LocalizationProvider>
        </Index.Box>

        {/* ── COMMAND BAR (visible only when ≥1 robot selected) ── */}
        {selectedRobots.length > 0 && (
          <Index.Box
            className="card-border common-card"
            sx={{ marginBottom: "20px", p: "14px 20px" }}
          >
            {/* Header: badge + label + clear button */}
            <Index.Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1,
                mb: 1.5,
              }}
            >
              <Index.Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Index.Box
                  sx={{
                    background: "#114A65",
                    color: "#fff",
                    borderRadius: "20px",
                    padding: "2px 12px",
                    fontWeight: 700,
                    fontSize: "12px",
                    lineHeight: "22px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {selectedRobots.length} Robot
                  {selectedRobots.length > 1 ? "s" : ""} Selected
                </Index.Box>
                <Index.Typography
                  variant="body2"
                  sx={{ color: "#555", fontWeight: 500, fontSize: "12px" }}
                >
                  Send command to all selected robots:
                </Index.Typography>
              </Index.Box>

              <Index.Button
                variant="outlined"
                size="small"
                onClick={() => setSelectedRobots([])}
                sx={{
                  borderColor: "#adb5bd",
                  color: "#6c757d",
                  textTransform: "none",
                  fontSize: "12px",
                  borderRadius: "6px",
                  padding: "2px 10px",
                  "&:hover": {
                    borderColor: "#6c757d",
                    bgcolor: "rgba(0,0,0,0.04)",
                  },
                }}
              >
                ✕ Clear
              </Index.Button>
            </Index.Box>

            {/* Command buttons — flex-wrap so they sit tight and wrap on mobile */}
            <Index.Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {commandBarButtons.map((btn) => (
                <Index.Box
                  key={btn.key}
                  sx={{
                    // On mobile: 2 per row. On sm+: auto-size to content, min 140px
                    flex: { xs: "1 1 calc(50% - 4px)", sm: "0 1 auto" },
                    minWidth: { xs: "unset", sm: "140px" },
                    maxWidth: { xs: "calc(50% - 4px)", sm: "200px" },
                  }}
                >
                  <ActionButton
                    btnSx={{
                      width: "100%",
                      padding: "6px 14px",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                      "& img": {
                        width: "14px !important",
                        height: "14px !important",
                      },
                    }}
                    onClick={() => handleBulkCommand(btn.key)}
                    isDisabled={sendingCommand !== null}
                    imgSRC={btn.imgSRC}
                    imgAlt={btn.imgAlt}
                    label={
                      sendingCommand === btn.key ? (
                        <Index.Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <CircularProgress
                            size={12}
                            sx={{ color: btn.textColor }}
                          />
                          <span style={{ fontSize: "11px" }}>Sending...</span>
                        </Index.Box>
                      ) : (
                        btn.label
                      )
                    }
                    bgColor={btn.bgColor}
                    textColor={btn.textColor}
                    borderColor={btn.borderColor}
                  />
                </Index.Box>
              ))}
            </Index.Box>
          </Index.Box>
        )}

        {/* ── TABLE CARD ── */}
        <Index.Box
          className="card-border common-card"
          sx={{ minHeight: "200px", position: "relative" }}
        >
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
            <DataTableNew
              headerData={dynamicHeaderData}
              filterData={totalCount}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={handlePageChange}
              pageSize={pageSize}
              setPageSize={handlePageSizeChange}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            >
              {pageRows?.map((row, i) => (
                <Index.TableRow
                  key={row?.id}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    bgcolor: selectedRobots.includes(row?.id)
                      ? "rgba(17,74,101,0.06)"
                      : "inherit",
                    transition: "background-color 0.15s",
                  }}
                >
                  {/* Checkbox */}
                  <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <BpCheckbox
                        color="primary"
                        checked={selectedRobots.includes(row?.id)}
                        onChange={() => handleSelectRobot(row?.id)}
                        inputProps={{ "aria-label": "select robot" }}
                      />
                    </Index.Box>
                  </Index.TableCell>

                  {/* Dynamic cells */}
                  {allColumns.map((col) => {
                    if (!visibleColumns.includes(col.id)) return null;
                    return (
                      <Index.TableCell
                        key={col.id}
                        component="td"
                        variant="td"
                        className="table-td"
                        align={col.align || "left"}
                      >
                        <Index.Box
                          className="admin-table-data-flex"
                          sx={{
                            justifyContent:
                              col.align === "center" ? "center" : "flex-start",
                          }}
                        >
                          {col.id === "action" || col.id === "status" ? (
                            col.render(row, i)
                          ) : (
                            <Index.Typography className="admin-table-data-text">
                              {col.render(row, i)}
                            </Index.Typography>
                          )}
                        </Index.Box>
                      </Index.TableCell>
                    );
                  })}
                </Index.TableRow>
              ))}
            </DataTableNew>
          )}
        </Index.Box>
      </Index.Box>

      {/* ── ADD / EDIT ROBOT MODAL ── */}
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
              {id ? "Edit" : "Pair New"} Robot
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
            validationSchema={PagesIndex.deviceSchema}
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
                    {/* Robot Name */}
                    <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        Robot Name
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          fullWidth
                          className="admin-form-control"
                          id="robot_name"
                          name="robot_name"
                          value={values?.robot_name}
                          placeholder="Enter Robot Name"
                          onChange={handleChange}
                        />
                        <Index.FormHelperText error>
                          {touched.robot_name && errors.robot_name
                            ? errors.robot_name
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>

                    {/* Device EUI — add only */}
                    {!id && (
                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Device EUI
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="device_eui"
                            name="device_eui"
                            value={values?.device_eui}
                            placeholder="Enter Device EUI"
                            onChange={(e) => {
                              handleChange(e);
                              setFieldValue(
                                "app_key",
                                generateAppKeyFromDevEui(e.target.value.trim()),
                              );
                            }}
                          />
                          <Index.FormHelperText error>
                            {touched.device_eui && errors.device_eui
                              ? errors.device_eui
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    )}

                    {/* Serial No */}
                    <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        Serial No
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          fullWidth
                          className="admin-form-control"
                          id="serial_no"
                          name="serial_no"
                          value={values?.serial_no}
                          placeholder="Enter Serial No"
                          onChange={handleChange}
                        />
                        <Index.FormHelperText error>
                          {touched.serial_no && errors.serial_no
                            ? errors.serial_no
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>

                    {/* Model No */}
                    <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        Model No
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          fullWidth
                          className="admin-form-control"
                          id="model_no"
                          name="model_no"
                          value={values?.model_no}
                          placeholder="Enter Model No"
                          onChange={handleChange}
                        />
                        <Index.FormHelperText error>
                          {touched.model_no && errors.model_no
                            ? errors.model_no
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>

                    {/* App Key — add only, read-only */}
                    {!id && (
                      <Index.Box className="admin-input-box admin-modal-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          App Key{" "}
                          <span
                            style={{
                              fontWeight: 400,
                              color: "#6c757d",
                              fontSize: "11px",
                            }}
                          >
                            (Auto-generated from Device EUI)
                          </span>
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.TextField
                            fullWidth
                            className="admin-form-control"
                            id="app_key"
                            name="app_key"
                            value={values?.app_key}
                            placeholder="Will auto-generate from Device EUI"
                            InputProps={{ readOnly: true }}
                            sx={{
                              "& .MuiInputBase-input": {
                                backgroundColor: "#f8f9fa",
                                cursor: "not-allowed",
                                color: "#495057",
                              },
                            }}
                          />
                          <Index.FormHelperText error>
                            {touched.app_key && errors.app_key
                              ? errors.app_key
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    )}

                    {/* Hardware Version */}
                    <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        Hardware Version
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          fullWidth
                          className="admin-form-control"
                          id="hardware_version"
                          name="hardware_version"
                          value={values?.hardware_version}
                          placeholder="Enter Hardware Version"
                          onChange={handleChange}
                        />
                        <Index.FormHelperText error>
                          {touched.hardware_version && errors.hardware_version
                            ? errors.hardware_version
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>

                    {/* Add-only fields */}
                    {!id && (
                      <>
                        {/* Site Assignment */}
                        <Index.Box className="admin-input-box admin-add-user-input">
                          <Index.FormHelperText className="admin-form-lable">
                            Site Assignment
                          </Index.FormHelperText>
                          <Index.Box className="admin-dropdown-box">
                            <Index.FormControl className="admin-form-control admin-drop-form-control">
                              <Index.Select
                                className="admin-dropdown-select admin-drop-select"
                                name="site"
                                value={values?.site}
                                onChange={(e) => {
                                  handleChange(e);
                                  setFieldValue("application_id", "");
                                  const sel = siteListData.find(
                                    (s) => s.id === e.target.value,
                                  );
                                  getTenant(sel?.id, setFieldValue);
                                }}
                                displayEmpty
                                inputProps={{ "aria-label": "Without label" }}
                                renderValue={
                                  values?.site ? undefined : () => "Select Site"
                                }
                              >
                                {siteListData?.map((d) => (
                                  <Index.MenuItem
                                    key={d?.id}
                                    value={d?.id}
                                    className="admin-drop-menuitem"
                                  >
                                    {d?.name}
                                  </Index.MenuItem>
                                ))}
                              </Index.Select>
                            </Index.FormControl>
                            <Index.FormHelperText error>
                              {touched.site && errors.site ? errors.site : null}
                            </Index.FormHelperText>
                          </Index.Box>
                        </Index.Box>

                        {tenant?.applicationId && (
                          <>
                            {values.application_id !== tenant.applicationId &&
                              setFieldValue(
                                "application_id",
                                tenant.applicationId,
                              )}
                            <Index.Box className="admin-input-box admin-modal-input-box">
                              <Index.FormHelperText className="admin-form-lable">
                                Application Id
                              </Index.FormHelperText>
                              <Index.Box className="admin-form-group">
                                <Index.TextField
                                  fullWidth
                                  className="admin-form-control"
                                  value={
                                    tenant.name || tenant.applicationId || ""
                                  }
                                  disabled
                                />
                              </Index.Box>
                            </Index.Box>
                          </>
                        )}

                        {tenant?.deviceProfileId && (
                          <>
                            {values.deviceProfile_id !==
                              tenant.deviceProfileId &&
                              setFieldValue(
                                "deviceProfile_id",
                                tenant.deviceProfileId,
                              )}
                            <Index.Box className="admin-input-box admin-modal-input-box">
                              <Index.FormHelperText className="admin-form-lable">
                                Device Profile Id
                              </Index.FormHelperText>
                              <Index.Box className="admin-form-group">
                                <Index.TextField
                                  fullWidth
                                  className="admin-form-control"
                                  value={
                                    tenant.name || tenant.deviceProfileId || ""
                                  }
                                  disabled
                                />
                              </Index.Box>
                            </Index.Box>
                          </>
                        )}

                        {/* COD */}
                        <Index.Box className="admin-input-box admin-modal-input-box">
                          <Index.FormHelperText className="admin-form-lable">
                            Commissioning Date (COD)
                          </Index.FormHelperText>
                          <Index.Box className="admin-form-group">
                            <Index.TextField
                              type="date"
                              fullWidth
                              className="admin-form-control"
                              id="cod"
                              name="cod"
                              value={values?.cod}
                              onChange={handleChange}
                            />
                            <Index.FormHelperText error>
                              {touched.cod && errors.cod ? errors.cod : null}
                            </Index.FormHelperText>
                          </Index.Box>
                        </Index.Box>

                        {/* Type */}
                        <Index.Box className="admin-input-box admin-add-user-input">
                          <Index.FormHelperText className="admin-form-lable">
                            Type
                          </Index.FormHelperText>
                          <Index.Box className="admin-dropdown-box">
                            <Index.FormControl className="admin-form-control admin-drop-form-control">
                              <Index.Select
                                className="admin-dropdown-select admin-drop-select"
                                name="type"
                                value={values?.type}
                                defaultValue={values?.type}
                                onChange={handleChange}
                                displayEmpty
                                inputProps={{ "aria-label": "Without label" }}
                                renderValue={
                                  values?.type ? undefined : () => "Select Type"
                                }
                              >
                                <Index.MenuItem
                                  value={"LORAWAN"}
                                  className="admin-drop-menuitem"
                                >
                                  LORAWAN
                                </Index.MenuItem>
                              </Index.Select>
                            </Index.FormControl>
                            <Index.FormHelperText error>
                              {touched.type && errors.type ? errors.type : null}
                            </Index.FormHelperText>
                          </Index.Box>
                        </Index.Box>
                      </>
                    )}

                    {/* Row Assignment */}
                    <Index.Box className="admin-input-box admin-add-user-input">
                      <Index.FormHelperText className="admin-form-lable">
                        Row Assignment
                      </Index.FormHelperText>
                      <Index.Box className="admin-dropdown-box">
                        <Index.FormControl className="admin-form-control admin-drop-form-control">
                          <Index.Select
                            className="admin-dropdown-select admin-drop-select"
                            name="row"
                            value={values?.row}
                            onChange={handleChange}
                            displayEmpty
                            inputProps={{ "aria-label": "Without label" }}
                            renderValue={
                              values?.row ? undefined : () => "Select Row"
                            }
                          >
                            {rowListData?.map((d) => (
                              <Index.MenuItem
                                key={d?.id}
                                value={d?.id}
                                className="admin-drop-menuitem"
                              >
                                {d?.rowName}
                              </Index.MenuItem>
                            ))}
                          </Index.Select>
                        </Index.FormControl>
                        <Index.FormHelperText error>
                          {touched.row && errors.row ? errors.row : null}
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
                          buttonSpinner ? (
                            <PagesIndex.Spinner />
                          ) : (
                            <>
                              <img
                                src={PagesIndex.Svg.save}
                                className="admin-user-save-icon"
                                alt="Save"
                              />
                              <span>{id ? "Save Changes" : "Connect"}</span>
                            </>
                          )
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

      {/* ── UPLOAD MODAL ── */}
      <Index.Modal
        open={openUpload}
        onClose={handleCloseUpload}
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
              Upload Robots Details
            </Index.Typography>
            <Index.Button
              className="modal-close-btn"
              onClick={handleCloseUpload}
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
            initialValues={initialValuesUpload}
            validationSchema={PagesIndex.uploadExcelValidationSchema}
            onSubmit={handleUpload}
          >
            {({
              errors,
              touched,
              setFieldValue,
              setFieldTouched,
              handleSubmit,
            }) => (
              <PagesIndex.Form onSubmit={handleSubmit}>
                <Index.Box className="modal-body">
                  <Index.Box className="admin-modal-hgt-scroll cus-scrollbar">
                    <Index.Box className="admin-file-upload-btn-main">
                      <Index.Box>
                        <input
                          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                          type="file"
                          className="custome-file-control"
                          onChange={(e) => {
                            const file = e.currentTarget.files?.[0];
                            if (file) {
                              setFieldValue("file", file);
                              setFieldTouched("file", false);
                            }
                          }}
                        />
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
                          buttonSpinner ? (
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
                          )
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

      {/* ── MULTICAST MODAL ── */}
      <Index.Modal
        open={openMultiCast}
        onClose={handleCloseMultiCastModal}
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
              Multi Cast Command
            </Index.Typography>
            <Index.Button
              className="modal-close-btn"
              onClick={handleCloseMultiCastModal}
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
            <Index.Box className="admin-modal-hgt-scroll cus-scrollbar">
              <Index.Box className="round-btn-content-flex">
                <Index.Box className="round-btn-flex">
                  {[
                    { cmd: "XAMBAAA=", icon: PagesIndex.Svg.powerButton },
                    { cmd: "XAMBAQE=", icon: PagesIndex.Svg.left },
                    { cmd: "XQYAAA==", icon: PagesIndex.Svg.powerButton2 },
                    { cmd: "XAMBAgI=", icon: PagesIndex.Svg.right },
                  ].map(({ cmd, icon }) => (
                    <Index.Box key={cmd} className="round-button-main">
                      <Index.Button
                        className="round-button"
                        onClick={() => executeCommand(cmd)}
                      >
                        <img src={icon} className="round-btn-icons" alt={cmd} />
                      </Index.Button>
                    </Index.Box>
                  ))}
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Modal>

      {/* ── MULTI COMMAND MODAL ── */}
      <Index.Modal
        open={openMultiCommand}
        onClose={handleCloseMultiCommandModal}
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
              Multi Command Control
            </Index.Typography>
            <Index.Button
              className="modal-close-btn"
              onClick={handleCloseMultiCommandModal}
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
            <Index.Box className="admin-modal-hgt-scroll cus-scrollbar">
              <Index.Box className="round-btn-content-flex">
                <Index.Box className="round-btn-flex">
                  {[
                    { cmd: "XAMBAAA=", icon: PagesIndex.Svg.powerButton },
                    { cmd: "XAMBAQE=", icon: PagesIndex.Svg.left },
                    { cmd: "XQYAAA==", icon: PagesIndex.Svg.powerButton2 },
                    { cmd: "XAMBAgI=", icon: PagesIndex.Svg.right },
                  ].map(({ cmd, icon }) => (
                    <Index.Box key={cmd} className="round-button-main">
                      <Index.Button
                        className="round-button"
                        onClick={() => {
                          PagesIndex.toasterSuccess("Command in progress");
                          selectedRobots.forEach((robotId) => {
                            setTimeout(
                              () => handleCommands(robotId, cmd),
                              1000,
                            );
                          });
                        }}
                      >
                        <img src={icon} className="round-btn-icons" alt={cmd} />
                      </Index.Button>
                    </Index.Box>
                  ))}
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Modal>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <PopupModal
        open={openDeleteModal}
        handleClose={() => setOpenDeleteModal(false)}
        handleFunction={handleDelete}
        buttonSpinner={buttonSpinner}
      />
    </>
  );
}
