import { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { useLocation, useParams } from "react-router-dom";
import DetailsField from "../../../../component/common/detailsField/DetailsField";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Checkbox,
  ListItemText,
  OutlinedInput,
  CircularProgress,
} from "@mui/material";

export default function BlockView() {
  const { state } = useLocation();
  const { id } = useParams();
  const blockId = id;
  const [block, setBlock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]); // devEui[]

  // ====================== API CALLS ======================

  const fetchBlock = async () => {
    if (!blockId) return;
    setLoading(true);
    const res = await PagesIndex.apiGetHandler(
      PagesIndex.Api.GET_ADD_EDIT_BLOCKS + `/${blockId}`
    );
    if (res.status === 200) {
      setBlock(res.data);
    }
    setLoading(false);
  };

  const fetchAllDevices = async () => {
    const res = await PagesIndex.apiGetHandler(
      PagesIndex.Api.GET_ADD_EDIT_DEVICES + `/multicast?blockId=${blockId}`
    );
    if (res.status === 200) {
      setAvailableDevices(res.data);
    } else {
      PagesIndex.toasterError(res?.message || "Failed to fetch devices");
    }
  };

  useEffect(() => {
    fetchBlock();
    fetchAllDevices();
  }, [blockId]);

  const handleAddDevice = async () => {
    if (!selectedDevices.length) return;
    setLoading(true);
    for (const deviceId of selectedDevices) {
      const res = await PagesIndex.apiPostHandler(
        PagesIndex.Api.GET_ADD_EDIT_BLOCKS + "/device",
        {
          blockId,
          deviceId,
          action: "add",
        }
      );
      if (res.status === 200 || res.status === 201) {
        PagesIndex.toasterSuccess(
          res?.message || "Device(s) added successfully"
        );
        await fetchBlock();
      } else {
        PagesIndex.toasterError(res?.message);
        break;
      }
    }
    setSelectedDevices([]);
    setLoading(false);
  };

  const handleRemoveDevice = async (deviceId) => {
    const res = await PagesIndex.apiPostHandler(
      PagesIndex.Api.GET_ADD_EDIT_BLOCKS + "/device",
      {
        blockId,
        deviceId,
        action: "remove",
      }
    );
    if (res.status === 200 || res.status === 201) {
      fetchBlock();
      PagesIndex.toasterSuccess(res?.message || "Device removed successfully");
    } else {
      PagesIndex.toasterError(res?.message);
    }
  };

  const handlePair = async (deviceId) => {
    PagesIndex.apiPostHandler(PagesIndex.Api.GET_ADD_EDIT_BLOCKS + "/paired", {
      blockId,
      deviceId,
    })
      .then((res) => {
        if (res.status === 200) {
          PagesIndex.toasterSuccess(
            res?.message || "Device pairing process started"
          );
          fetchBlock();
        }
      })
      .catch((error) => console.log(error));
  };

  const handleGetMulticastAddress = async () => {
    if (!blockId) return;
    setLoading(true);
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_ADD_EDIT_DEVICES +
          "/get-multicast-address" +
          `?blockId=${blockId}`
      );
      if (res.status === 200 || res.status === 201) {
        PagesIndex.toasterSuccess(
          res?.message || "Multicast address fetched successfully"
        );
        await fetchBlock();
      } else {
        PagesIndex.toasterError(
          res?.message || "Failed to get multicast address"
        );
      }
    } catch (err) {
      console.error(err);
      PagesIndex.toasterError(
        "Something went wrong while fetching multicast address"
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================== HELPERS ======================

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedDevices(typeof value === "string" ? value.split(",") : value);
  };

  const formatDate = (val) => {
    if (!val) return "-";
    // adjust based on actual format from API
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
  };

  const renderStatusChip = (status) => {
    const normalized = (status || "").toString().toLowerCase();
    const isActive =
      normalized === "1" || normalized === "online" || normalized === "true";
    const label = isActive ? "ONLINE" : "OFFLINE";

    return (
      <Index.Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          px: 1.5,
          py: 0.3,
          borderRadius: 999,
          fontSize: "11px",
          fontWeight: 500,
          textTransform: "capitalize",
          backgroundColor: isActive
            ? "rgba(27, 168, 41, 0.12)"
            : "rgba(165, 38, 38, 0.12)",
          color: isActive ? "#161e1aff" : "#cb0e0eff",
        }}
      >
        {label}
      </Index.Box>
    );
  };

  const renderPairingChip = (device) => {
    const state = device?.isMulticastPaired;
    if (state === 1) {
      return (
        <Index.Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            px: 1.5,
            py: 0.3,
            borderRadius: 999,
            fontSize: "11px",
            fontWeight: 500,
            backgroundColor: "rgba(33, 150, 243, 0.12)",
            color: "#1976d2",
          }}
        >
          Paired
        </Index.Box>
      );
    }
    if (state === 2) {
      return (
        <Index.Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            px: 1.5,
            py: 0.3,
            borderRadius: 999,
            fontSize: "11px",
            fontWeight: 500,
            backgroundColor: "rgba(255, 152, 0, 0.12)",
            color: "#f57c00",
          }}
        >
          Not Paired
        </Index.Box>
      );
    }
    return (
      <Index.Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          px: 1.5,
          py: 0.3,
          borderRadius: 999,
          fontSize: "11px",
          fontWeight: 500,
          backgroundColor: "rgba(156, 39, 176, 0.08)",
          color: "#8e24aa",
        }}
      >
        Pairing
      </Index.Box>
    );
  };

  if (!block && loading) return <div>Loading...</div>;
  if (!block) return <div>No block found</div>;

  // ====================== UI ======================

  return (
    <Index.Box
      className="admin-dashboard-content admin-user-list-content"
      sx={{
        backgroundColor: "#f4f7fb",
        minHeight: "100vh",
        p: { xs: 1.5, md: 3 },
      }}
    >
      {/* BLOCK DETAILS CARD */}
      <Index.Box
        className="card-border common-card"
        sx={{
          mb: 3,
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          backgroundColor: "#ffffff",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
        }}
      >
        {/* Header row with title + Get Multicast button */}
        <Index.Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            flexWrap: "wrap",
            rowGap: 1,
          }}
        >
          <Index.Typography
            variant="h6"
            sx={{ fontWeight: 600, fontSize: { xs: "16px", md: "18px" } }}
          >
            Block Details
          </Index.Typography>

          <Index.Button
            variant="contained"
            color="primary"
            onClick={handleGetMulticastAddress}
            size="small"
            disabled={loading}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: 2.5,
              py: 0.6,
              fontSize: "12px",
            }}
          >
            Get Multicast Address Check{" "}
            {loading && <CircularProgress size={16} />}
          </Index.Button>
        </Index.Box>

        {/* Details grid like screenshot */}
        <Index.Grid container spacing={1}>
          <Index.Grid item xs={12} sm={2}>
            <Index.Typography
              variant="caption"
              sx={{ fontSize: "12px", color: "#64748b" }}
            >
              Block Name
            </Index.Typography>
            <Index.Typography
              variant="body1"
              sx={{ fontWeight: 500, mt: 0.5, fontSize: "14px" }}
            >
              {block.name || blockId || "-"}
            </Index.Typography>
          </Index.Grid>
          <Index.Grid item xs={12} sm={2}>
            <Index.Typography
              variant="caption"
              sx={{ fontSize: "12px", color: "#64748b" }}
            >
              Block Address
            </Index.Typography>
            <Index.Typography
              variant="body1"
              sx={{ fontWeight: 500, mt: 0.5, fontSize: "14px" }}
            >
              {block.mcAddr || blockId || "-"}
            </Index.Typography>
          </Index.Grid>
          <Index.Grid item xs={12} sm={2}>
            <Index.Typography
              variant="caption"
              sx={{ fontSize: "12px", color: "#64748b" }}
            >
              Device Count
            </Index.Typography>
            <Index.Typography
              variant="body1"
              sx={{
                mt: 0.5,
                fontSize: "16px",
                fontWeight: 600,
                color: "#1976d2",
              }}
            >
              {block.devices?.length || 0}
            </Index.Typography>
          </Index.Grid>

          <Index.Grid item xs={12} sm={2}>
            <Index.Typography
              variant="caption"
              sx={{ fontSize: "12px", color: "#64748b" }}
            >
              Created
            </Index.Typography>
            <Index.Typography
              variant="body1"
              sx={{ mt: 0.5, fontSize: "14px" }}
            >
              {formatDate(block.createdAt)}
            </Index.Typography>
          </Index.Grid>

          <Index.Grid item xs={12} sm={2}>
            <Index.Typography
              variant="caption"
              sx={{ fontSize: "12px", color: "#64748b" }}
            >
              Last Updated
            </Index.Typography>
            <Index.Typography
              variant="body1"
              sx={{ mt: 0.5, fontSize: "14px" }}
            >
              {formatDate(block.updatedAt)}
            </Index.Typography>
          </Index.Grid>
        </Index.Grid>
      </Index.Box>

      {/* DEVICES CARD */}
      <Index.Box
        className="card-border common-card"
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          backgroundColor: "#ffffff",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
        }}
      >
        {/* Header with title & controls to the right */}
        <Index.Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            rowGap: 1.5,
            mb: 2,
          }}
        >
          <Index.Typography
            variant="h6"
            sx={{ fontWeight: 600, fontSize: { xs: "16px", md: "18px" } }}
          >
            Devices
          </Index.Typography>

          <Index.Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: { xs: "100%", sm: "auto" },
              justifyContent: { xs: "flex-end", sm: "flex-end" },
            }}
          >
            <FormControl
              size="small"
              sx={{
                minWidth: { xs: "60%", sm: 260 },
                backgroundColor: "#f8fafc",
                borderRadius: 2,
              }}
            >
              <InputLabel id="multiple-checkbox-label">
                Select devices to add
              </InputLabel>
              <Select
                labelId="multiple-checkbox-label"
                id="multiple-checkbox"
                multiple
                value={selectedDevices}
                onChange={handleChange}
                input={<OutlinedInput label="Select devices to add" />}
                renderValue={(selectedEuis) =>
                  selectedEuis
                    .map((eui) => {
                      const device = availableDevices.find(
                        (d) => d.devEui === eui
                      );
                      return device ? device.name : eui;
                    })
                    .join(", ")
                }
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 250,
                      width: 260,
                    },
                  },
                }}
              >
                {availableDevices.map((device) => (
                  <MenuItem
                    key={device.devEui}
                    value={device.devEui}
                    disabled={block.devices?.includes(device.devEui)}
                  >
                    <Checkbox
                      checked={selectedDevices.includes(device.devEui)}
                      disabled={block.devices?.includes(device.devEui)}
                    />
                    <ListItemText primary={device.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Index.Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleAddDevice}
              disabled={selectedDevices.length === 0 || loading}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                px: 2.5,
                py: 0.8,
                fontSize: "12px",
                boxShadow: "none",
              }}
            >
              + Add Devices
            </Index.Button>
          </Index.Box>
        </Index.Box>

        {/* TABLE */}
        <Index.Box sx={{ width: "100%", overflowX: "auto" }}>
          <Index.Table
            aria-label="devices table"
            className="table"
            size="small"
            sx={{ minWidth: 650 }}
          >
            <Index.TableHead>
              <Index.TableRow>
                <Index.TableCell sx={{ fontSize: "13px" }}>Sr.</Index.TableCell>
                <Index.TableCell sx={{ fontSize: "13px" }}>
                  Row No.
                </Index.TableCell>
                <Index.TableCell sx={{ fontSize: "13px" }}>
                  Device Name
                </Index.TableCell>
                <Index.TableCell sx={{ fontSize: "13px" }}>
                  Device ID
                </Index.TableCell>
                <Index.TableCell sx={{ fontSize: "13px" }}>
                  Status
                </Index.TableCell>
                <Index.TableCell sx={{ fontSize: "13px" }}>
                  Pairing
                </Index.TableCell>
                <Index.TableCell sx={{ fontSize: "13px" }}>
                  Actions
                </Index.TableCell>
              </Index.TableRow>
            </Index.TableHead>
            <Index.TableBody>
              {block.devices && block.devices.length > 0 ? (
                block.devices
                  .map((deviceId) =>
                    availableDevices.find((dev) => dev.devEui === deviceId)
                  )
                  .filter(Boolean) // Filter out any devices not found in availableDevices
                  .sort((a, b) => {
                    // Safely retrieve and convert names to strings, defaulting to empty string
                    const nameA = a?.table_row?.rowName || "";
                    const nameB = b?.table_row?.rowName || "";

                    // Use localeCompare with the 'numeric: true' option for natural sort
                    return nameA.localeCompare(nameB, undefined, {
                      numeric: true,
                      sensitivity: "base", // Optional: Treats A and a, etc. as equal
                    });
                  })
                  .map((device, idx) => {
                    return (
                      <Index.TableRow key={device.devEui}>
                        <Index.TableCell sx={{ fontSize: "13px" }}>
                          {idx + 1}
                        </Index.TableCell>
                        <Index.TableCell sx={{ fontSize: "13px" }}>
                          {device?.table_row?.rowName || "-"}
                        </Index.TableCell>
                        <Index.TableCell sx={{ fontSize: "13px" }}>
                          {device.name || device.devEui}
                        </Index.TableCell>
                        <Index.TableCell
                          sx={{
                            fontSize: "13px",
                            color: "#94a3b8",
                            fontFamily: "monospace",
                          }}
                        >
                          {device.devEui}
                        </Index.TableCell>
                        <Index.TableCell sx={{ fontSize: "13px" }}>
                          {renderStatusChip(device.status)}
                        </Index.TableCell>
                        <Index.TableCell sx={{ fontSize: "13px" }}>
                          {renderPairingChip(device)}
                        </Index.TableCell>
                        <Index.TableCell
                          sx={{
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          {device.isMulticastPaired === 2 && (
                            <Index.Button
                              variant="outlined"
                              size="small"
                              onClick={() => handlePair(device.devEui)}
                              sx={{
                                textTransform: "none",
                                borderRadius: 999,
                                fontSize: "11px",
                                px: 1.8,
                                py: 0.3,
                              }}
                            >
                              Pair
                            </Index.Button>
                          )}
                          <Index.Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleRemoveDevice(device.devEui)}
                            sx={{
                              textTransform: "none",
                              borderRadius: 2,
                              px: 1.8,
                              py: 0.4,
                              fontSize: "11px",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.7,
                            }}
                          >
                            Remove
                          </Index.Button>
                        </Index.TableCell>
                      </Index.TableRow>
                    );
                  })
              ) : (
                <Index.TableRow>
                  <Index.TableCell colSpan={6} sx={{ fontSize: "13px" }}>
                    No devices in this block.
                  </Index.TableCell>
                </Index.TableRow>
              )}
            </Index.TableBody>
          </Index.Table>
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
}
