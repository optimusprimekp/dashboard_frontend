import Index from "../../../Index";
import PagesIndex from "../../../../component/PagesIndex";
import InputElements from "../../../../component/common/InputElements/InputElements";
import DataTable from "../../../../component/common/dataTable/DataTable";
import { useEffect, useState, useCallback } from "react";
import moment from "moment";

const OperationalLog = () => {
  const [siteData, setSiteData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [site, setSite] = useState("");
  const [operationType, setOperationType] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters applied to current API call
  const [appliedFilters, setAppliedFilters] = useState({
    site: "",
    operationType: "",
    status: "",
    from: "",
    to: "",
    search: "",
  });

  // Dropdown data
  const operationTypes = [
    { id: "GET", label: "GET" },
    { id: "POST", label: "POST" },
    { id: "PUT", label: "PUT" },
    { id: "DELETE", label: "DELETE" },
  ];

  const statuses = [
    { id: "Failed", label: "Fail" },
    { id: "Success", label: "Success" },
  ];

  // Fetch site list
  const siteList = async () => {
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_ADD_EDIT_SITE
      );
      if (res.status === 200) {
        setSiteData(res.data.map((s) => ({ id: s.id, label: s.name })));
      }
    } catch (err) {
      console.error("Site load error", err);
    }
  };

  // Fetch logs with filters + pagination
  const fetchLogs = useCallback(async (page, filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.site) params.append("site", filters.site);
      if (filters.operationType)
        params.append("operationType", filters.operationType);
      if (filters.status) params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);
      if (filters.from)
        params.append(
          "fromDate",
          moment(filters.from).utcOffset("+05:30").format("YYYY-MM-DD")
        );
      if (filters.to)
        params.append(
          "toDate",
          moment(filters.to).utcOffset("+05:30").format("YYYY-MM-DD")
        );
      params.append("page", page);

      const res = await PagesIndex.apiGetHandler(
        `${PagesIndex.Api.GET_REPORTS}/operational?${params.toString()}`
      );

      if (res.status === 200) {
        setLogs(res.data?.operationalLogReportList || []);
        setTotalCount(res.data?.pagination?.totalCount || 0);
      } else {
        setLogs([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    siteList();
    fetchLogs(1, appliedFilters);
  }, []);

  // Handle pagination
  useEffect(() => {
    fetchLogs(currentPage, appliedFilters);
  }, [currentPage]);

  // Apply filters
  const handleApplyFilters = () => {
    const filters = {
      site,
      operationType,
      status,
      search: searchText,
      from: fromDate ? moment(fromDate).toISOString() : "",
      to: toDate ? moment(toDate).toISOString() : "",
    };

    setAppliedFilters(filters);
    setCurrentPage(1); // reset page to 1
    fetchLogs(1, filters);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSite("");
    setOperationType("");
    setStatus("");
    setSearchText("");
    setFromDate(null);
    setToDate(null);

    const reset = {
      site: "",
      operationType: "",
      status: "",
      search: "",
      from: "",
      to: "",
    };

    setAppliedFilters(reset);
    setCurrentPage(1);
    fetchLogs(1, reset);
  };

  return (
    <>
      <Index.Box className="admin-dashboard-content admin-user-list-content">
        <Index.Box className="admin-page-title-main">
          <Index.Typography
            className="admin-page-title admin-user-list-page-title"
            component="h2"
            variant="h2"
            sx={{ marginBottom: "20px" }}
          >
            Operational Log
          </Index.Typography>
        </Index.Box>
      </Index.Box>

      <Index.Box
        className="card-border common-card"
        sx={{ marginBottom: "20px" }}
      >
        <Index.Grid container spacing={2} alignItems="flex-end">
          <Index.Grid item xs={12} sm={2} md>
            <InputElements.SearchField
              label="Search"
              name="search"
              placeholder="Search module/url"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Index.Grid>

          <Index.Grid item xs={12} sm={2} md>
            <InputElements.DropdownField
              label="Operation Type"
              value={operationType}
              onChange={(e) => setOperationType(e.target.value)}
              items={operationTypes}
            />
          </Index.Grid>

          <Index.Grid item xs={12} sm={2} md>
            <InputElements.DropdownField
              label="Operation Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              items={statuses}
            />
          </Index.Grid>

          <Index.Grid item xs={12} sm={2} md>
            <InputElements.DatePickerField
              label="From"
              value={fromDate}
              onChange={setFromDate}
            />
          </Index.Grid>

          <Index.Grid item xs={12} sm={2} md>
            <InputElements.DatePickerField
              label="To"
              value={toDate}
              onChange={setToDate}
            />
          </Index.Grid>

          <Index.Grid item xs={6} sm={1} md="auto">
            <Index.Box sx={{ display: "flex", gap: 1 }}>
              <Index.Button
                onClick={handleApplyFilters}
                variant="contained"
                disabled={loading}
                sx={{
                  bgcolor: "#212529",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#343a40" },
                }}
              >
                Apply
              </Index.Button>
              <Index.Button
                onClick={handleResetFilters}
                variant="outlined"
                disabled={loading}
                sx={{
                  borderColor: "#ced4da",
                  color: "#212529",
                  textTransform: "none",
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
      </Index.Box>

      <Index.Box className="card-border common-card">
        <DataTable
          headerData={[
            { field: "Sr. No." },
            { field: "Operation Type" },
            { field: "URL" },
            { field: "Browser" },
            { field: "Operator" },
            { field: "Operator IP" },
            { field: "Status" },
            { field: "Operation Date & Time" },
            { field: "Details" },
          ]}
          filterData={totalCount}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          loading={loading}
        >
          {logs?.map((data, i) => {
            const serialNumber = (currentPage - 1) * 10 + i + 1;
            return (
              <Index.TableRow key={data?.id}>
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
                <Index.TableCell
                  component="td"
                  variant="td"
                  scope="row"
                  className="table-td"
                >
                  <Index.Box className="admin-table-data-flex">
                    <Index.Typography className="admin-table-data-text">
                      {data?.method}
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
                      {data?.url}
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
                      {data?.browser ?? "-"}
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
                      {data?.user?.email ?? "-"}
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
                      {data?.ip ?? "-"}
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
                      {data?.status ?? "-"}
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
                      {data?.time
                        ? moment(data.time).format("DD-MM-YYYY HH:mm A")
                        : "-"}
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
                    {data?.details?.body ? (
                      <Index.Tooltip
                        title={
                          <Index.Box
                            sx={{
                              maxWidth: 400,
                              maxHeight: 300,
                              overflow: "auto",
                              whiteSpace: "pre-wrap",
                              fontSize: "12px",
                              padding: 1,
                            }}
                          >
                            {JSON.stringify(data.details.body, null, 2)}
                          </Index.Box>
                        }
                        arrow
                        placement="top-start"
                      >
                        <Index.Typography
                          className="admin-table-data-text"
                          sx={{
                            maxWidth: "200px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          {JSON.stringify(data.details.body).slice(0, 70)}...
                        </Index.Typography>
                      </Index.Tooltip>
                    ) : (
                      <Index.Typography className="admin-table-data-text">
                        No Details
                      </Index.Typography>
                    )}
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

export default OperationalLog;
