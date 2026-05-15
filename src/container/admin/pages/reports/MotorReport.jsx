import Index from "../../../Index";
import PagesIndex from "../../../../component/PagesIndex";
import InputElements from "../../../../component/common/InputElements/InputElements";
import DataTable from "../../../../component/common/dataTable/DataTable";

import { useEffect, useState } from "react";
import moment from "moment";
const MotorReport = () => {
  const [site, setSite] = useState("");
  const [module, setModule] = useState("");
  const [operationType, setOperationType] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [data, setData] = useState([]);

  const fetchMotorData = async () => {
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_REPORTS + "/motors"
      );
      if (res.status == 200) {
        setData(res.data);
      } else {
        PagesIndex.toasterError(res.message);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchMotorData();
  }, []);

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
            Motor Report
          </Index.Typography>
        </Index.Box>
      </Index.Box>
      {/* <Index.Box
        className="card-border common-card"
        sx={{ marginBottom: "20px" }}
      >
        <Index.Grid container rowGap={1} columnSpacing={1}>
          <Index.Grid item xs={12} sm={2.3}>
            <InputElements.DropdownField
              label={"Site"}
              value={site}
              onChange={changeSelectedSite}
              items={sites}
            />
          </Index.Grid>
          <Index.Grid item xs={12} sm={2.3}>
            <InputElements.DropdownField
              label={"Site"}
              value={site}
              onChange={changeSelectedSite}
              items={sites}
            />
          </Index.Grid>
          <Index.Grid item xs={12} sm={2.3}>
            <InputElements.DateTimePickerField
              label="From"
              name="from"
              value={fromDate}
              onChange={setFromDate}
            />
          </Index.Grid>
          <Index.Grid item xs={12} sm={2.3}>
            <InputElements.DatePickerField
              label="To"
              name="to"
              value={toDate}
              onChange={setToDate}
            />
          </Index.Grid>

          <Index.Grid item xs={12} sm={1} sx={{ alignContent: "end" }}>
            <Index.Button
              // className="admin-export-btn border-btn"
              onClick={() => {}}
              disableRipple
              sx={{
                borderRadius: "4px",
                border: "1px solid var(--main-border)",
                color: "var(--secondary-color)",
                fontSize: "12px",
                fontWeight: 400,
                textTransform: "none",
                width: "100%",
              }}
            >
              Apply
            </Index.Button>
          </Index.Grid>
          <Index.Grid item xs={12} sm={1} sx={{ alignContent: "end" }}>
            <Index.Button
              // className="admin-export-btn border-btn"
              onClick={() => {}}
              disableRipple
              sx={{
                borderRadius: "4px",
                border: "1px solid var(--main-border)",
                color: "var(--secondary-color)",
                fontSize: "12px",
                fontWeight: 400,
                textTransform: "none",
                width: "100%",
              }}
            >
              Reset
            </Index.Button>
          </Index.Grid>
          <Index.Grid item xs={12} sm={1} sx={{ alignContent: "end" }}>
            <Index.Button
              // className="admin-export-btn border-btn"
              onClick={() => {}}
              disableRipple
              sx={{
                borderRadius: "4px",
                border: "1px solid var(--main-border)",
                color: "var(--secondary-color)",
                fontSize: "12px",
                fontWeight: 400,
                textTransform: "none",
                width: "100%",
              }}
            >
              Export
            </Index.Button>
          </Index.Grid>
        </Index.Grid>
      </Index.Box> */}
      <Index.Box
        className="card-border common-card"
        // sx={{ maxHeight: "calc(100vh - 150px)", overflowY: "scroll" }}
      >
        <DataTable
          headerData={[
            { field: "Sr. No." },
            { field: "Date" },
            { field: "Site" },
            { field: "Device Name" },
            { field: "Brush Motor", colSpan: 4 },
            { field: "Left Motor", colSpan: 4 },
            { field: "Right Motor", colSpan: 4 },
          ]}
          subHeaderData={[
            { field: "" },
            { field: "" },
            { field: "" },
            { field: "" },
            { field: "Temp(°C)" },
            { field: "Current(A)" },
            { field: "Voltage(V)" },
            { field: "Speed(rpm)" },
            { field: "Temp(°C)" },
            { field: "Current(A)" },
            { field: "Voltage(V)" },
            { field: "Speed(rpm)" },
            { field: "Temp(°C)" },
            { field: "Current(A)" },
            { field: "Voltage(V)" },
            { field: "Speed(rpm)" },
          ]}
          filterData={data}
          currentPage={0}
          setCurrentPage={() => {}}
        >
          {data?.map((data, i) => {
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
                      {i + 1}
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
                      {data?.date
                        ? moment(data?.date).format("DD-MM-YYYY")
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
                      {data?.device?.site?.name}
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
                      {data?.device?.name}
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
                      {(data?.brush_motor_temp / 100).toFixed(2) || "-"}
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
                      {data?.brush_motor_current / 1000 || "-"}
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
                      {data?.brush_motor_voltage / 1000 || "-"}
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
                      {data?.brush_motor_speed / 100 || "-"}
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
                      {(data?.left_motor_temp / 100).toFixed(2) || "-"}
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
                      {data?.left_motor_current / 1000 || "-"}
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
                      {data?.left_motor_voltage / 1000 || "-"}
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
                      {data?.left_motor_speed / 100 || "-"}
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
                      {(data?.right_motor_temp / 100).toFixed(2) || "-"}
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
                      {data?.right_motor_current / 1000 || "-"}
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
                      {data?.right_motor_voltage / 1000 || "-"}
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
                      {data?.right_motor_speed / 100 || "-"}
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

export default MotorReport;
