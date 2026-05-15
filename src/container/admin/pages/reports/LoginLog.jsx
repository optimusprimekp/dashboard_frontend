import Index from "../../../Index";
import PagesIndex from "../../../../component/PagesIndex";
import DataTable from "../../../../component/common/dataTable/DataTable";
import { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

const LoginLog = () => {
  const [searchValue, setSearchValue] = useState("");

  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  // Unchanged States for data and pagination
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1); 
  const [logFilters, setLogFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    search: "",
  });

  const handleResetFilter = () => {
    // Reset the visual filter inputs
    setFromDate(null);
    setToDate(null);
    setStatus("");
    setSearchValue("");

    // *** FIX 2: Reset the active filters state and fetch the initial data
    const initialFilters = {
      startDate: "",
      endDate: "",
      status: "",
      search: "",
    };
    setLogFilters(initialFilters);
    setCurrentPage(1);
    getLoginData(1, initialFilters); // Fetch page 1 with no filters
  };

  const handleApplyFilter = () => {
    if (fromDate && !toDate) {
      PagesIndex.toasterError(
        "To Date is required when From Date is selected."
      );
      return;
    }

    // *** FIX 3: Create a new filter object from the current input states
    const newFilters = {
      search: searchValue,
      status: status,
      startDate: fromDate ? moment(fromDate).format("YYYY-MM-DD") : "",
      endDate: toDate ? moment(toDate).format("YYYY-MM-DD") : "",
    };

    // Save these new filters to our main filter state
    setLogFilters(newFilters);
    setCurrentPage(1); // Always reset to page 1 when applying a new filter
    getLoginData(1, newFilters); // Fetch data with the new filters
  };

  const getLoginData = useCallback(
    // The second argument `filters` will now be used reliably
    async (page, filters = {}) => {
      setLoading(true); // Start loading
      try {
        let url = `${PagesIndex.Api.GET_REPORTS}/loginlogs?page=${page}&pageSize=10`;

        // *** FIX 4: Correctly append all potential filters to the URL
        if (filters.search) url += `&search=${filters.search}`;
        if (filters.status) url += `&status=${filters.status}`;
        if (filters.startDate) url += `&startDate=${filters.startDate}`;
        if (filters.endDate) url += `&endDate=${filters.endDate}`;

        const res = await PagesIndex.apiGetHandler(url);
        if (res?.status === 200 || res?.status === 201) {
          setData(res.data.loginLogs);
          setTotalCount(res.data.pagination.totalCount);
          setCurrentPage(res.data.pagination.page);
        } else {
          PagesIndex.toasterError(res?.data?.message);
        }
      } catch (error) {
        PagesIndex.toasterError(error?.response?.data?.message);
        console.log(error);
      } finally {
        setLoading(false); // Stop loading
      }
    },
    [] // No dependencies needed, keeping it stable
  );

  useEffect(() => {
    // *** FIX 5: Initial data fetch is now for page 1 explicitly
    getLoginData(1, logFilters);
  }, []); // Run only once on mount

  const statusData = [
    { label: "Success", value: "Success" },
    { label: "Failed", value: "Failed" },
  ];
  return (
    <>
      <Index.Box className="admin-dashboard-content admin-user-list-content">
        <Index.Box className="admin-page-title-main">
          <Index.Typography
            className="admin-page-title admin-user-list-page-title"
            component="h2"
            variant="h2"
            sx={{
              marginBottom: "20px",
            }}
          >
            Login Log
          </Index.Typography>
        </Index.Box>
      </Index.Box>
      <Index.Box
        className="card-border common-card"
        sx={{ marginBottom: "20px" }}
      >
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <Index.Grid container alignItems="flex-end" spacing={2}>
            {/* NEW: Search field added here as requested */}
            <Index.Grid item xs={12} sm={3} md>
              <Index.FormHelperText
                sx={{ fontWeight: "bold", color: "black", mb: 1 }}
              >
                Search
              </Index.FormHelperText>
              <Index.TextField
                fullWidth
                size="small"
                placeholder="Search by Username/IP..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </Index.Grid>
            {/* End of new field */}

            <Index.Grid item xs={12} sm={3} md>
              <Index.FormHelperText
                sx={{ fontWeight: "bold", color: "black", mb: 1 }}
              >
                From Date
              </Index.FormHelperText>
              <DatePicker
                value={fromDate}
                onChange={(newValue) => setFromDate(newValue)}
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
              <Index.FormHelperText
                sx={{ fontWeight: "bold", color: "black", mb: 1 }}
              >
                To Date
              </Index.FormHelperText>
              <DatePicker
                value={toDate}
                onChange={(newValue) => setToDate(newValue)}
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
              <Index.FormHelperText
                sx={{ fontWeight: "bold", color: "black", mb: 1 }}
              >
                Status
              </Index.FormHelperText>
              <Index.TextField
                select
                fullWidth
                size="small"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected) {
                      return (
                        <span style={{ color: "#6c757d" }}>Select Status</span>
                      );
                    }
                    // This was slightly simplified but achieves the same result
                    return selected;
                  },
                }}
              >
                {statusData.map((item) => (
                  <Index.MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </Index.MenuItem>
                ))}
              </Index.TextField>
            </Index.Grid>
            <Index.Grid item xs={12} sm={3} md="auto">
              <Index.Box sx={{ display: "flex", gap: 1 }}>
                <Index.Button
                  onClick={handleApplyFilter}
                  variant="contained"
                  disabled={loading} // Added disabled state for better UX
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
                  disabled={loading} // Added disabled state for better UX
                  sx={{
                    borderColor: "#ced4da",
                    color: "#212529",
                    textTransform: "none",
                    borderRadius: "4px",
                    height: "40px",
                    "&:hover": {
                      borderColor: "#adb5bd",
                      bgcolor: "rgba(0, 0, 0, 0.04)",
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
      <Index.Box className="card-border common-card">
        <DataTable
          headerData={[
            { field: "Sr. No." },
            { field: "Username" },
            { field: "User Type" },
            { field: "IP Address" },
            { field: "Browser" },
            { field: "OS" },
            { field: "Login Status" },
            { field: "Info" },
            { field: "Login Time" },
          ]}
          filterData={totalCount}
          currentPage={currentPage}
          setCurrentPage={(page) => {
            getLoginData(page, logFilters);
          }}
          loading={loading}
        >
          {data?.map((data, i) => {
            // Calculate serial number based on current page
            const serialNumber = (currentPage - 1) * 10 + i + 1;
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
                      {serialNumber}
                    </Index.Typography>
                  </Index.Box>
                </Index.TableCell>
                {/* All other table cells are unchanged */}
                <Index.TableCell
                  component="td"
                  variant="td"
                  scope="row"
                  className="table-td"
                >
                  <Index.Box className="admin-table-data-flex">
                    <Index.Typography className="admin-table-data-text">
                      {data?.user?.email ?? "-"}
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
                      {data?.user?.Role?.name ?? "-"}
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
                      {data?.ip.includes("::ffff:")
                        ? data?.ip?.replace("::ffff:", "")
                        : data?.ip ?? "-"}
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
                      {data?.browser ?? "-"}
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
                      {data?.os ?? "-"}
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
                      {data?.status ?? "-"}
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
                      {data?.info ?? "-"}
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
                      {data?.time
                        ? moment(data?.time).format("DD-MM-YYYY hh:mm A")
                        : "-"}
                    </Index.Typography>
                  </Index.Box>
                </Index.TableCell>
              </Index.TableRow>
            );
          })}
        </DataTable>
      </Index.Box>
    </>
  );
};

export default LoginLog;
