import Index from "../../../Index";
import PagesIndex from "../../../../component/PagesIndex";
import InputElements from "../../../../component/common/InputElements/InputElements";
import DataTable from "../../../../component/common/dataTable/DataTable";
import { useEffect, useState, useCallback } from "react";
import moment from "moment";

const RobotAlarm = () => {
  // --- Data and Loading States ---
  const [data, setData] = useState([]);
  const [siteData, setSiteData] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Filter Input States (for UI) ---
  const [site, setSite] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Pagination States ---
  // API is 1-indexed, so we'll manage our state as 1-indexed for consistency with the example
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // This state holds the filters that are *actively* being used for API calls
  const [appliedFilters, setAppliedFilters] = useState({
    site: "",
    from: "",
    to: "",
    search: "",
  });

  // --- API Calls ---

  const siteList = async () => {
    try {
      const response = await PagesIndex.apiGetHandler(
        `${PagesIndex.Api.GET_ADD_EDIT_SITE}`
      );
      if (response.status === 200) {
        setSiteData(
          response.data.map((site) => ({ id: site.id, label: site.name }))
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAlarmList = useCallback(async (page, filters = {}) => {
    setLoading(true);
    let url = `${PagesIndex.Api.GET_REPORTS}/robot-alarm?page=${page}&pageSize=50`;

    // Append all potential filters to the URL from the 'filters' object
    if (filters.site) url += `&site=${filters.site}`;
    if (filters.search) url += `&search=${filters.search}`;
    if (filters.from) url += `&from=${filters.from}`;
    if (filters.to) url += `&to=${filters.to}`;

    try {
      const response = await PagesIndex.apiGetHandler(url);
      if (response.status === 200 && response.data) {
        setData(response.data.robotAlarmReportList || []);
        setTotalCount(response.data.pagination.totalCount || 0);
        setCurrentPage(response.data.pagination.page || 1);
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch alarm data:", error);
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Effects ---

  // Initial data fetch on component mount
  useEffect(() => {
    siteList();
    getAlarmList(1, appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Event Handlers ---

  const handleApplyFilters = () => {
    // Create the new filter object from the current UI state
    const newFilters = {
      site: site,
      search: searchQuery,
      from: fromDate ? moment(fromDate).format("YYYY-MM-DD") : "",
      to: toDate ? moment(toDate).format("YYYY-MM-DD") : "",
    };

    // Set the new filters as active and fetch data for page 1
    setAppliedFilters(newFilters);
    getAlarmList(1, newFilters);
  };

  const handleReset = () => {
    // Reset UI input fields
    setSite("");
    setFromDate(null);
    setToDate(null);
    setSearchQuery("");

    // Reset the active filters to their initial empty state
    const initialFilters = { site: "", from: "", to: "", search: "" };
    setAppliedFilters(initialFilters);

    // Fetch the initial, unfiltered data for page 1
    getAlarmList(1, initialFilters);
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
            Robot Alarm
          </Index.Typography>
        </Index.Box>
      </Index.Box>
      <Index.Box
        className="card-border common-card"
        sx={{ marginBottom: "20px" }}
      >
        <Index.Grid container spacing={2} alignItems="flex-end">
          <Index.Grid item xs={12} sm={6} md>
            <InputElements.DropdownField
              label={"Site"}
              value={site}
              onChange={(e) => setSite(e.target.value)}
              items={siteData}
            />
          </Index.Grid>
          <Index.Grid item xs={12} sm={6} md>
            <InputElements.DatePickerField
              label="From"
              value={fromDate}
              onChange={setFromDate}
            />
          </Index.Grid>
          <Index.Grid item xs={12} sm={6} md>
            <InputElements.DatePickerField
              label="To"
              value={toDate}
              onChange={setToDate}
              minDate={fromDate}
              disabled={!fromDate}
            />
          </Index.Grid>
          <Index.Grid item xs={12} sm={6} md>
            <InputElements.TextField
              label="Search"
              placeholder="Search by Alarm name, type etc."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
            />
          </Index.Grid>
          <Index.Grid item xs={12} sm={12} md="auto">
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
                onClick={handleReset}
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
            { field: "Device Name" },
            { field: "Site" },
            { field: "Alarm Type" },
            { field: "Alarm Name" },
            { field: "Description" },
            { field: "Alarm Raised Time" },
            { field: "Alarm Resolved Time" },
          ]}
          filterData={totalCount}
          currentPage={currentPage}
          setCurrentPage={(page) => {
            // When changing page, use the already applied filters
            getAlarmList(page, appliedFilters);
          }}
          loading={loading}
        >
          {data?.map((item, i) => {
            const serialNumber = (currentPage - 1) * 10 + i + 1;
            return (
              <Index.TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                key={item?.id}
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
                <Index.TableCell
                  component="td"
                  variant="td"
                  scope="row"
                  className="table-td"
                >
                  <Index.Box className="admin-table-data-flex">
                    <Index.Typography className="admin-table-data-text">
                      {item?.deviceObj?.name ?? "-"}
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
                      {item?.deviceObj?.site?.name ?? "-"}
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
                      {item?.object?.error_code ?? "-"}
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
                      {item?.object?.error_name ?? "-"}
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
                      {item?.object?.error_data ?? "-"}
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
                      {item?.createdAt
                        ? moment(item?.createdAt).format("DD-MM-YYYY HH:mm")
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
                    <Index.Typography className="admin-table-data-text">
                      {item?.createdAt
                        ? moment(item?.createdAt).format("DD-MM-YYYY HH:mm")
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

export default RobotAlarm;
