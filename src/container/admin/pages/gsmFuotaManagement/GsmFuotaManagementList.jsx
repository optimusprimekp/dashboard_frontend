import { styled } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import DataTable from "../../../../component/common/dataTable/DataTable";
import axios from "axios";
import mqtt from "mqtt";

// for modal design

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
};

// for table data
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
  "input:hover ~ &": {
    backgroundColor: "transparent",
  },
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

const brokerUrl = import.meta.env.VITE_GSM_MQTT_URL; // Use wss:// if using WebSocket

// MQTT options (replace with your username and password)
const options = {
  username: import.meta.env.VITE_GSM_MQTT_USERNAME,
  password: import.meta.env.VITE_GSM_MQTT_PASSWORD,
  clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
  clean: false,
};

// const mqttClient = mqtt.connect(brokerUrl, options);

export default function GsmFuotaManagementList() {
  const [data, setData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [selectedRobots, setSelectedRobots] = useState([]);

  const initialValues = {
    macAddress: "",
    url: "",
  };
  // upload modal
  const [openSingle, setOpenSingle] = useState(false);
  const handleOpenSingle = () => setOpenSingle(true);
  const handleCloseSingle = () => setOpenSingle(false);

  const [client, setClient] = useState(null);

  // Connect to ChirpStack MQTT broker
  // useEffect(() => {
  //   // ChirpStack MQTT broker URL (replace with your broker's URL)

  //   // Debugging logs
  //   mqttClient.on("connect", () => {
  //     console.log("Connected to GSM MQTT broker");
  //   });

  //   mqttClient.on("error", (err) => {
  //     console.error("MQTT connection error:", err); // This will capture any errors during connection
  //   });

    

  //   mqttClient.on("reconnect", () => {
  //     console.log("Reconnecting to GSM MQTT broker...");
  //   });

  //   mqttClient.on("close", () => {
  //     console.log("MQTT connection closed");
  //   });

  //   // Store client in state
  //   setClient(mqttClient);

  //   // Cleanup when the component unmounts
  //   return () => {
  //     mqttClient.end();
  //     console.log("Disconnected from GSM MQTT broker");
  //   };
  // }, []);

  // Publish a message (optional)
  // const PublishMessage = (values) => {
  //   setButtonSpinner(true);
  //   if (client) {
  //     client.publish(
  //       `device/${values?.macAddress}/down`,
  //       values?.url,
  //       (err) => {
  //         if (!err) {
  //           console.log(`Message published: ${values?.macAddress}`);
  //           mqttClient.subscribe(`device/${values?.macAddress}/up`, { qos: 1 }, (err) => {
  //             if (!err) {
  //               console.log(`Subscribed to topic: device/${values?.macAddress}/up`);
  //               mqttClient.on("message", (topic, payload) => {
  //                 if (topic === `device/${values?.macAddress}/up`) {
  //                   console.log(`Received message on topic ${topic}:`, payload.toString('hex')); // Log the hex payload

  //                   // Convert the hex payload to a readable string
  //                   const readableMessage = Buffer.from(payload, 'hex').toString('utf-8');
  //                   console.log(`Converted message: ${readableMessage}`);

  //                   setMessage(readableMessage); // Update the state with the converted message
  //                 }else{
  //                   console.log(`Received message on topic ${topic}:`, payload.toString('utf-8'));
  //                 }
  //               });
  //             } else {
  //               console.error("Error subscribing to topic:", err);
  //             }
  //           });
  //           handleCloseSingle(); // Close the modal after successful publish
  //         } else {
  //           console.error("Error publishing message:", err);
  //         }
  //         setButtonSpinner(false);
  //       }
  //     );
  //   }
  // };

  const handleSelectRobot = (id) => {
    if (selectedRobots.includes(id)) {
      setSelectedRobots((prev) => prev.filter((robot) => robot !== id));
    } else if (selectedRobots?.length < 50) {
      setSelectedRobots((prev) => [...prev, id]);
    } else if (selectedRobots?.length === 50 && !selectedRobots.includes(id)) {
      PagesIndex.toasterError("You can select only 50 robots at a time");
    }
  };

  const requestSearch = (e) => {
    setSearchValue(e.target.value);
    let result = data.filter((data) => {
      let name = data?.name
        ?.toLowerCase()
        .includes(e?.target?.value?.toLowerCase());
      let email = data?.email
        ?.toLowerCase()
        .includes(e?.target?.value?.toLowerCase());
      return name || email;
    });
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
            GSM Fuota List
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
            <Index.Box className="admin-adduser-btn-main btn-main-primary">
              <Index.Button
                className="admin-adduser-btn btn-primary"
                onClick={handleOpenSingle}
              >
                <img
                  src={PagesIndex.Svg.down}
                  className="admin-plus-icon"
                  alt="plus"
                />
                Upload Single
              </Index.Button>
            </Index.Box>
          </Index.Box>
        </Index.Box>

        <Index.Box className="card-border common-card">
          <DataTable
            headerData={[{ field: "MAC Address" }, { field: "Last Update" }]}
            filterData={filterData?.length}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          >
            {filterData?.map((data) => {
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
                      <BpCheckbox
                        color="primary"
                        checked={selectedRobots.includes(data?.macAddress)}
                        onChange={() => {
                          handleSelectRobot(data?.macAddress);
                        }}
                        inputProps={{
                          "aria-label": "select all desserts",
                        }}
                      />
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
                        {data?.macAddress}
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                </Index.TableRow>
              );
            })}
          </DataTable>
        </Index.Box>
      </Index.Box>
      <Index.Modal
        open={openSingle}
        onClose={handleCloseSingle}
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
              Upload For Fuota
            </Index.Typography>
            <Index.Button
              className="modal-close-btn"
              onClick={handleCloseSingle}
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
            initialValues={initialValues}
            validationSchema={PagesIndex.uploadGsmFuotaValidationSchema}
            onSubmit={PublishMessage}
          >
            {({
              values,
              errors,
              touched,
              setFieldValue,
              setFieldTouched,
              handleChange,
              handleSubmit,
            }) => (
              <PagesIndex.Form onSubmit={handleSubmit}>
                <Index.Box className="modal-body">
                  <Index.Box className="admin-modal-hgt-scroll cus-scrollbar">
                    <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        MAC Address
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          fullWidth
                          className="admin-form-control"
                          id="macAddress"
                          name="macAddress"
                          value={values?.macAddress}
                          inputProps={{ maxLength: 50 }}
                          placeholder="Enter MAC Address"
                          onChange={(e) =>
                            setFieldValue(
                              "macAddress",
                              e.target.value?.toUpperCase()
                            )
                          }
                        />
                        <Index.FormHelperText error>
                          {touched.macAddress && errors.macAddress
                            ? errors.macAddress
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="admin-input-box admin-modal-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        URL
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          fullWidth
                          className="admin-form-control"
                          id="url"
                          name="url"
                          value={values?.url}
                          placeholder="Enter URL"
                          onChange={handleChange}
                        />
                        <Index.FormHelperText error>
                          {touched.url && errors.url ? errors.url : null}
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
                                <span>Upload</span>
                              </>
                            )}
                          </>
                        }
                        onClick={() => {
                          setFieldTouched("macAddress", true);
                          setFieldTouched("url", true);
                        }}
                      />
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </PagesIndex.Form>
            )}
          </PagesIndex.Formik>
        </Index.Box>
      </Index.Modal>
    </>
  );
}
