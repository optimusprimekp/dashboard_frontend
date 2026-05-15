import {
  CircularProgress,
  TextField,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { useCallback, useEffect, useState, useMemo } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Index from "../../../Index";
import PagesIndex from "../../../../component/PagesIndex";
import DataTableNew from "../../../../component/common/dataTable/DataTableNew";
import moment from "moment";

// ── Constants ─────────────────────────────────────────────────────────────────
const KWP_PER_CLEAN = 530;
const MIN_CLEAN_MINUTES = 30;

const STATUS_META = {
  COMPLETED: { bg: "#e6f4ea", color: "#2e7d32", label: "Completed" },
  FAILED: { bg: "#fdecea", color: "#c62828", label: "Failed" },
  OVERRIDDEN: { bg: "#fff8e1", color: "#f57f17", label: "Overridden" },
};

const STATUS_OPTIONS = [
  { label: "Completed", value: "COMPLETED" },
  { label: "Failed", value: "FAILED" },
  { label: "Overridden", value: "OVERRIDDEN" },
];

const TASK_OPTIONS = [
  { label: "Clean One Cycle", value: "CLEAN_ONE_CYCLE" },
  { label: "Stop Robot", value: "STOP_ROBOT" },
  { label: "Right Start", value: "RIGHT_START" },
  { label: "Left Start", value: "LEFT_START" },
  { label: "Home", value: "HOME" },
];

const HEADER_DATA = [
  { field: "Sr. No." },
  { field: "Robot Name" },
  { field: "Task Name" },
  { field: "Executed By" },
  { field: "Executed At" },
  { field: "Completed At" },
  { field: "Status", align: "center" },
];

const styles = {
  applyBtn: {
    bgcolor: "#212529",
    color: "white",
    textTransform: "none",
    borderRadius: "4px",
    height: "40px",
    "&:hover": { bgcolor: "#343a40" },
  },
  resetBtn: {
    borderColor: "#ced4da",
    color: "#212529",
    textTransform: "none",
    borderRadius: "4px",
    height: "40px",
    "&:hover": { borderColor: "#adb5bd", bgcolor: "rgba(0,0,0,0.04)" },
  },
  filterLabel: { fontWeight: "bold", color: "black", mb: 1 },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatEnergy = (kwp) => {
  if (kwp >= 1000) return `${(kwp / 1000).toFixed(2)} MWp`;
  return `${kwp} kWp`;
};

const COUNTING_TASKS = ["CLEAN_ONE_CYCLE", "RIGHT_START", "LEFT_START", "HOME"];

const isFullClean = (row) => {
  if (!COUNTING_TASKS.includes(row.commandName)) return false; // STOP_ROBOT excluded
  if (row.status !== "COMPLETED") return false;
  if (!row.executedAt || !row.completedAt) return false;
  return (
    moment(row.completedAt).diff(moment(row.executedAt), "minutes") >=
    MIN_CLEAN_MINUTES
  );
};

// ── Stat pill component ───────────────────────────────────────────────────────
const StatPill = ({ label, value, valueColor = "#212529" }) => (
  <Index.Box
    sx={{
      textAlign: "center",
      px: 3,
      borderLeft: "1px solid #dee2e6",
      "&:first-of-type": { borderLeft: "none", pl: 0 },
    }}
  >
    <Index.Typography
      sx={{
        fontSize: "11px",
        color: "#6c757d",
        mb: "4px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Index.Typography>
    <Index.Typography
      sx={{
        fontSize: "20px",
        fontWeight: 700,
        color: valueColor,
        lineHeight: 1,
      }}
    >
      {value}
    </Index.Typography>
  </Index.Box>
);

export default function TaskReport() {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [taskName, setTaskName] = useState("");
  const [robot, setRobot] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  // ── Table / pagination state ──────────────────────────────────────────────
  const [allRows, setAllRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // ── Stats — unique robot+day combos ──────────────────────────────────────
  const stats = useMemo(() => {
    const cleanRows = allRows.filter(isFullClean);

    // One clean per robot per day
    const seen = new Set();
    cleanRows.forEach((row) => {
      const day = moment(row.executedAt).format("YYYY-MM-DD");
      seen.add(`${row.deviceName ?? "unknown"}__${day}`);
    });

    const totalCleans = seen.size;
    const uniqueDevices = new Set(cleanRows.map((r) => r.deviceName)).size;
    const totalKwp = totalCleans * KWP_PER_CLEAN;

    return { uniqueDevices, totalCleans, totalKwp };
  }, [allRows]);

  // ── Core fetch ────────────────────────────────────────────────────────────
  const getList = useCallback(async (filters = {}, page = 1, size = 10) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.taskName) params.append("taskName", filters.taskName);
      if (filters.robot) params.append("robot", filters.robot);
      if (filters.status) params.append("status", filters.status);
      if (filters.fromDate)
        params.append(
          "fromDate",
          moment(filters.fromDate).format("YYYY-MM-DD"),
        );
      if (filters.toDate)
        params.append("toDate", moment(filters.toDate).format("YYYY-MM-DD"));

      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_REPORTS + `/task-report${query}`,
      );

      if (res?.status === 200) {
        const flat = res.data || [];
        setAllRows(flat);
        setTotalCount(flat.length);
        setTotalPages(Math.ceil(flat.length / size));
      } else {
        PagesIndex.toasterError(res?.message);
      }
    } catch (error) {
      PagesIndex.toasterError(
        error?.response?.data?.message || "Failed to fetch task report",
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getList({}, 1, 10);
  }, [getList]);

  // ── Page slice ────────────────────────────────────────────────────────────
  const pageRows = allRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handlePageChange = (page) => setCurrentPage(page);
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    setTotalPages(Math.ceil(totalCount / newSize));
  };

  // ── Filter actions ────────────────────────────────────────────────────────
  const handleApplyFilter = () => {
    if (fromDate && !toDate) {
      PagesIndex.toasterError(
        "To Date is required when From Date is selected.",
      );
      return;
    }
    const filters = {};
    if (taskName) filters.taskName = taskName;
    if (robot) filters.robot = robot.trim();
    if (status) filters.status = status;
    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;
    setCurrentPage(1);
    getList(filters, 1, pageSize);
  };

  const handleResetFilter = () => {
    setTaskName("");
    setRobot("");
    setStatus("");
    setFromDate(null);
    setToDate(null);
    setCurrentPage(1);
    getList({}, 1, pageSize);
  };

  // ── Export CSV ────────────────────────────────────────────────────────────
  const escape = (v) => `"${String(v ?? "-").replace(/"/g, '""')}"`;

  const handleExport = () => {
    const summarySection = [
      ["Cleaning Summary"],
      ["Cleaning Devices", "Total Cleans", "Total Cleaned"],
      [stats.uniqueDevices, stats.totalCleans, formatEnergy(stats.totalKwp)],
      [],
    ];

    const taskHeaders = [
      "Sr. No.",
      "Robot Name",
      "Task Name",
      "Executed By",
      "Executed At",
      "Completed At",
      "Status",
    ];
    const taskRows = allRows.map((row, i) => [
      i + 1,
      row.deviceName,
      row.commandName ? row.commandName.replaceAll("_", " ") : null,
      row.userName,
      row.executedAt ? moment(row.executedAt).format("DD-MM-YYYY HH:mm") : null,
      row.completedAt
        ? moment(row.completedAt).format("DD-MM-YYYY HH:mm")
        : null,
      row.status,
    ]);

    const csv = [...summarySection, ["Task Report"], taskHeaders, ...taskRows]
      .map((r) => r.map(escape).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "task_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Index.Box className="admin-dashboard-content admin-user-list-content">
      {/* ── Page title + Export ── */}
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
            Task Report
          </Index.Typography>
          <Index.Box className="admin-export-btn-main border-btn-main">
            <Index.Button
              className="admin-export-btn border-btn"
              onClick={handleExport}
            >
              <img
                src={PagesIndex.Svg.down}
                className="admin-down-icon admin-icon"
                alt="export"
              />
              Export
            </Index.Button>
          </Index.Box>
        </Index.Box>
      </Index.Box>

      {/* ── Filter card ── */}
      <Index.Box
        className="card-border common-card"
        sx={{ marginBottom: "20px" }}
      >
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <Index.Grid container alignItems="flex-end" spacing={2}>
            <Index.Grid item xs={12} sm={3} md>
              <FormHelperText sx={styles.filterLabel}>Task Name</FormHelperText>
              <TextField
                select
                fullWidth
                size="small"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (sel) =>
                    !sel ? (
                      <span style={{ color: "#6c757d" }}>Select Task</span>
                    ) : (
                      TASK_OPTIONS.find((t) => t.value === sel)?.label
                    ),
                }}
              >
                {TASK_OPTIONS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
            </Index.Grid>

            <Index.Grid item xs={12} sm={3} md>
              <FormHelperText sx={styles.filterLabel}>Status</FormHelperText>
              <TextField
                select
                fullWidth
                size="small"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (sel) =>
                    !sel ? (
                      <span style={{ color: "#6c757d" }}>Select Status</span>
                    ) : (
                      STATUS_OPTIONS.find((s) => s.value === sel)?.label
                    ),
                }}
              >
                {STATUS_OPTIONS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
            </Index.Grid>

            <Index.Grid item xs={12} sm={3} md>
              <FormHelperText sx={styles.filterLabel}>From Date</FormHelperText>
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

            <Index.Grid item xs={12} sm={3} md>
              <FormHelperText sx={styles.filterLabel}>To Date</FormHelperText>
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

            <Index.Grid item xs={12} sm={3} md>
              <FormHelperText sx={styles.filterLabel}>Robot</FormHelperText>
              <TextField
                fullWidth
                size="small"
                value={robot}
                onChange={(e) => setRobot(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleApplyFilter();
                }}
                placeholder="Search by robot name / DevEUI"
              />
            </Index.Grid>

            <Index.Grid item xs={12} sm={3} md="auto">
              <Index.Box sx={{ display: "flex", gap: 1 }}>
                <Index.Button
                  onClick={handleApplyFilter}
                  variant="contained"
                  disabled={!!(fromDate && !toDate)}
                  disableElevation
                  sx={styles.applyBtn}
                >
                  Apply
                </Index.Button>
                <Index.Button
                  onClick={handleResetFilter}
                  variant="outlined"
                  sx={styles.resetBtn}
                >
                  Reset
                </Index.Button>
              </Index.Box>
            </Index.Grid>
          </Index.Grid>
        </LocalizationProvider>
      </Index.Box>

      {/* ── Cleaning Summary — 3 stat pills ── */}
      <Index.Box
        className="card-border common-card"
        sx={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Index.Typography
          sx={{ fontSize: "15px", fontWeight: 600, color: "#212529" }}
        >
          Cleaning Summary
        </Index.Typography>

        <Index.Box
          sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
        >
          <StatPill
            label="Cleaning Devices"
            value={stats.uniqueDevices}
            valueColor="#185FA5"
          />
          <StatPill
            label="Total Cleans"
            value={stats.totalCleans}
            valueColor="#212529"
          />
          <StatPill
            label="Total Cleaned"
            value={formatEnergy(stats.totalKwp)}
            valueColor="#2e7d32"
          />
        </Index.Box>
      </Index.Box>

      {/* ── Main data table ── */}
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
            headerData={HEADER_DATA}
            filterData={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={handlePageChange}
            pageSize={pageSize}
            setPageSize={handlePageSizeChange}
          >
            {pageRows.length === 0 ? (
              <Index.TableRow>
                <Index.TableCell colSpan={HEADER_DATA.length} align="center">
                  <Index.Typography
                    sx={{ py: 4, color: "#6c757d", fontSize: "14px" }}
                  >
                    No records found
                  </Index.Typography>
                </Index.TableCell>
              </Index.TableRow>
            ) : (
              pageRows.map((row, i) => {
                const badge = STATUS_META[row.status] || {
                  bg: "#f5f5f5",
                  color: "#555",
                  label: row.status,
                };
                const fullClean = isFullClean(row);

                return (
                  <Index.TableRow
                    key={row.id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      ...(fullClean && { bgcolor: "rgba(46,125,50,0.04)" }),
                    }}
                  >
                    <Index.TableCell
                      component="td"
                      variant="td"
                      scope="row"
                      className="table-td"
                    >
                      <Index.Box className="admin-table-data-flex">
                        <Index.Typography className="admin-table-data-text">
                          {(currentPage - 1) * pageSize + i + 1}
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
                          {row.deviceName ?? "-"}
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
                          {TASK_OPTIONS.find((t) => t.value === row.commandName)
                            ?.label ??
                            (row.commandName
                              ? row.commandName.replaceAll("_", " ")
                              : "-")}
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
                          {row.userName ?? "-"}
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
                          {row.executedAt
                            ? moment(row.executedAt).format("DD-MM-YYYY hh:mm A")
                            : "-"}
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
                          {row.completedAt
                            ? moment(row.completedAt).format("DD-MM-YYYY hh:mm A")
                            : "-"}
                        </Index.Typography>
                      </Index.Box>
                    </Index.TableCell>

                    <Index.TableCell
                      component="td"
                      variant="td"
                      className="table-td"
                      align="center"
                    >
                      <Index.Box
                        className="admin-table-data-flex"
                        sx={{ justifyContent: "center" }}
                      >
                        <Index.Box
                          sx={{
                            display: "inline-block",
                            px: 1.5,
                            py: 0.4,
                            borderRadius: "12px",
                            backgroundColor: badge.bg,
                            color: badge.color,
                            fontSize: "11px",
                            fontWeight: 600,
                            letterSpacing: "0.3px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {badge.label ?? "-"}
                        </Index.Box>
                      </Index.Box>
                    </Index.TableCell>
                  </Index.TableRow>
                );
              })
            )}
          </DataTableNew>
        )}
      </Index.Box>
    </Index.Box>
  );
}
