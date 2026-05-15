import Index from "../../../Index";
import PagesIndex from "../../../../component/PagesIndex";
import InputElements from "../../../../component/common/InputElements/InputElements";
import DataTable from "../../../../component/common/dataTable/DataTable";
import { useState } from "react";
const ProcessedAlarm = () => {
  const [site, setSite] = useState("");
  const [device, setDevice] = useState("");
  const [block, setBlock] = useState("");
  const [type, setType] = useState("");
  const [alarmTime, setAlarmTime] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);
  const changeSelectedSite = (event) => {
    setSite(event.target.value);
  };
  const sites = [
    { id: 1, label: "Site 1" },
    { id: 2, label: "Site 2" },
    { id: 3, label: "Site 3" },
  ];
  const changeSelectedDevice = (event) => {
    setDevice(event.target.value);
  };
  const devices = [
    { id: 1, label: "Device 1" },
    { id: 2, label: "Device 2" },
  ];
  const changeSelectedType = (event) => {
    setType(event.target.value);
  };
  const types = [
    { id: 1, label: "Types 1" },
    { id: 2, label: "Types 2" },
  ];
  const changeSelectedBlock = (event) => {
    setBlock(event.target.value);
  };
  const blocks = [
    { id: 1, label: "Block 1" },
    { id: 2, label: "Block 2" },
    { id: 3, label: "Block 3" },
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
            Processed Alarm
          </Index.Typography>
        </Index.Box>
      </Index.Box>
      <Index.Box
        className="card-border common-card"
        sx={{ marginBottom: "20px" }}
      >
        <Index.Grid container rowGap={1} columnSpacing={1}>
          <Index.Grid item xs={12} sm={3}>
            <InputElements.DropdownField
              label={"Site"}
              value={site}
              onChange={changeSelectedSite}
              items={sites}
            />
          </Index.Grid>
          <Index.Grid item xs={12} sm={3}>
            <InputElements.DropdownField
              label={"Block"}
              value={block}
              onChange={changeSelectedBlock}
              items={blocks}
            />
          </Index.Grid>
          <Index.Grid item xs={12} sm={3}>
            <InputElements.DropdownField
              label={"Device"}
              value={device}
              onChange={changeSelectedDevice}
              items={devices}
            />
          </Index.Grid>
          <Index.Grid item xs={12} sm={3}>
            <InputElements.DropdownField
              label={"Type"}
              value={type}
              onChange={changeSelectedType}
              items={types}
            />
          </Index.Grid>
          <Index.Grid item xs={12} sm={3}>
            <InputElements.DateTimePickerField
              label="Alarm Time"
              name="alarmTime"
              value={alarmTime}
              onChange={setAlarmTime}
            />
          </Index.Grid>
          <Index.Grid item xs={12} sm={3}>
            <InputElements.DateTimePickerField
              label="Processing Time"
              name="processingTime"
              value={processingTime}
              onChange={setProcessingTime}
            />
          </Index.Grid>

          <Index.Grid item xs={12} sm={1.5} sx={{ alignContent: "end" }}>
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
          <Index.Grid item xs={12} sm={1.5} sx={{ alignContent: "end" }}>
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
      </Index.Box>
      <Index.Box
        className="card-border common-card"
        // sx={{ maxHeight: "calc(100vh - 150px)", overflowY: "scroll" }}
      >
        <DataTable
          headerData={[
            { field: "Sr. No." },
            { field: "Device Name" },
            { field: "Block" },
            { field: "Site" },
            { field: "Alarm Type" },
            { field: "Alarm Raised Time" },
            { field: "Alarm Resolved Time" },
            { field: "Instruction" },
            { field: "Processing Time" },
            { field: "Processor" },
          ]}
          filterData={(0 * 1) / 2}
          currentPage={0}
          setCurrentPage={() => {}}
        >
          {[]?.map((data, i) => {
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
                      {data?.name}
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
                      {data?.devEui}
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
                      {data?.serialNo ?? "-"}
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
                      {data?.modelNo ?? "-"}
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
                      {data?.siteId?.name ?? "-"}
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
                      {data?.dateOfComission
                        ? PagesIndex.moment(data?.dateOfComission).format(
                            "DD-MM-YYYY HH:mm"
                          )
                        : PagesIndex.moment(data.createdAt).format(
                            "DD-MM-YYYY HH:mm"
                          )}
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
                      {data?.lastSeenAt
                        ? PagesIndex.moment(data?.lastSeenAt).format(
                            "DD-MM-YYYY HH:mm"
                          )
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
                      {data?.lastSeenAt
                        ? PagesIndex.moment(data?.lastSeenAt).format(
                            "DD-MM-YYYY HH:mm"
                          )
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

export default ProcessedAlarm;
