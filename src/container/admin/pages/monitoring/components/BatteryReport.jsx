// src/pages/reports/BatteryReportPage.js

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Grid,
  Stack,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import PagesIndex from "../../../../PagesIndex";
// import Index from "../../../../Index"; // 'Index' was imported but never used.

// ========================================================================
//  PRESENTATIONAL COMPONENT: BatteryReport
//  This component renders the UI using MUI components and the `sx` prop for styling.
// ========================================================================
const BatteryReport = ({ batteryData, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  // --- Sub-components for cleaner rendering ---

  const renderStatus = (isTrue) => (
    <Typography
      component="span"
      sx={{ fontWeight: "600", color: isTrue ? "error.main" : "success.main" }}
    >
      {isTrue ? "Yes" : "No"}
    </Typography>
  );

  const Section = ({ title, children }) => (
    <Box
      sx={{
        p: 3,
        borderBottom: { xs: 1, md: 0 },
        borderColor: "divider",
        "&:not(:last-of-type)": {
          borderRight: { md: 1 },
          borderColor: "divider",
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontFamily: "Montserrat, sans-serif",
          fontWeight: "bold",
          color: "grey.800",
          mb: 2,
        }}
      >
        {title}
      </Typography>
      <Stack spacing={1.5}>{children}</Stack>
    </Box>
  );

  const InfoRow = ({ label, value }) => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {label}:
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: "bold", color: "text.primary" }}
      >
        {value}
      </Typography>
    </Box>
  );

  const StatusRow = ({ label, value }) => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {label}:
      </Typography>
      {renderStatus(value)}
    </Box>
  );

  // --- Data Formatting & Logic ---

  const formatCellVoltage = (value) => {
    if (value >= 65000) {
      return (
        <Typography component="span" sx={{ color: "text.secondary" }}>
          N/A (Invalid)
        </Typography>
      );
    }
    const voltageInVolts = (value / 1000).toFixed(3);
    const isCriticallyLow = value > 0 && value < 2000;
    const isZero = value === 0;

    let styles = { color: "text.primary" };
    if (isCriticallyLow) {
      styles = { color: "error.light", fontWeight: "bold" };
    } else if (isZero) {
      styles = { color: "error.dark", fontWeight: "bold" };
    }

    return (
      <Typography component="span" sx={styles}>
        {voltageInVolts} V
      </Typography>
    );
  };

  const calculateHealthGrade = (data) => {
    let issuesCount = 0;
    const criticalFaults = [
      data.over_current_discharging,
      data.over_current_cont_discharging,
      data.over_current_charging,
      data.cell_conn_broken,
      data.prl_fault,
      data.pack_over_volt_fault,
      data.short_circuit,
      data.thermal_runaway,
      data.cell_diff_fault,
      data.cell_under_volt,
      data.cell_over_volt,
      data.over_temp,
      data.under_temp,
      data.board_over_temp,
      data.board_under_temp,
    ];
    criticalFaults.forEach((fault) => {
      if (fault) issuesCount++;
    });

    if (
      data.thermal_runaway ||
      data.short_circuit ||
      data.cell_conn_broken ||
      data.battery_health < 50
    )
      return "F";
    if (data.battery_health > 95 && issuesCount === 0) return "A+";
    if (data.battery_health >= 90 && issuesCount <= 1) return "A";
    if (data.battery_health >= 80 && issuesCount <= 3) return "B";
    if (data.battery_health >= 70 && issuesCount <= 5) return "C";
    if (data.battery_health >= 60 && issuesCount <= 7) return "D";
    return "F";
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A+":
      case "A":
        return "#4ade80"; // Green
      case "B":
        return "#facc15"; // Yellow
      case "C":
        return "#fb923c"; // Orange
      case "D":
      case "F":
        return "#f87171"; // Red
      default:
        return "#9ca3af"; // Gray
    }
  };

  const grade = calculateHealthGrade(batteryData);
  const gradeColor = getGradeColor(grade);

  const reportTime = new Date().toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // --- Data Arrays for cleaner mapping ---

  const thermalFlags = [
    { label: "Over Temp Flag", value: batteryData.over_temp },
    { label: "Under Temp Flag", value: batteryData.under_temp },
    { label: "Board Over Temp", value: batteryData.board_over_temp },
    { label: "Board Under Temp", value: batteryData.board_under_temp },
  ];

  const faultItems = [
    {
      label: "Over Current Discharging",
      value: batteryData.over_current_discharging,
    },
    {
      label: "Over Current Cont. Discharging",
      value: batteryData.over_current_cont_discharging,
    },
    {
      label: "Over Current Charging",
      value: batteryData.over_current_charging,
    },
    { label: "Cell Connection Broken", value: batteryData.cell_conn_broken },
    { label: "PRL Fault", value: batteryData.prl_fault },
    { label: "Cell Under Volt", value: batteryData.cell_under_volt },
    { label: "Pack Over Volt Fault", value: batteryData.pack_over_volt_fault },
    { label: "Short Circuit", value: batteryData.short_circuit },
    { label: "Cell Diff Fault", value: batteryData.cell_diff_fault },
    { label: "Cell Over Volt", value: batteryData.cell_over_volt },
    { label: "Thermal Runaway", value: batteryData.thermal_runaway },
  ];

  return (
    <>
      {/* IMPROVEMENT: Styles for printing are crucial for PDF generation. */}
      {/* These styles ensure colors and backgrounds are printed correctly. */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Montserrat:wght@500;700;800&display=swap');
        
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-container {
            margin: 0 !important;
            padding: 0 !important;
            background-color: white !important;
            box-shadow: none !important;
            width: 100%;
            max-width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Action Header - This part will not be printed */}
      <Box
        className="no-print"
        sx={{
          p: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontFamily: "Montserrat, sans-serif", fontWeight: "bold" }}
        >
          Battery Health Report
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={onBack}
            sx={{ mr: 2, textTransform: "none" }}
          >
            Close Report
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePrint}
            startIcon={<PrintIcon />}
            sx={{ textTransform: "none" }}
          >
            Print / Save as PDF
          </Button>
        </Box>
      </Box>

      {/* The actual printable report content */}
      <Box
        className="print-container"
        sx={{
          backgroundColor: "grey.100",
          p: { xs: 0, sm: 2, md: 3 },
          fontFamily: "Roboto, sans-serif",
        }}
      >
        <Box
          sx={{
            maxWidth: "1000px",
            mx: "auto",
            backgroundColor: "white",
            boxShadow: { sm: 3 },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: "#1E40AF",
              color: "white",
              p: { xs: 2, sm: 3 },
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                alignSelf: { xs: "flex-start", md: "center" },
              }}
            >
              <Box
                sx={{
                  p: 1,
                  width: { xs: 80, sm: 78 },
                  height: { xs: 80, sm: 78 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "4px",
                  mr: 2,
                }}
              >
                <img
                  src={PagesIndex.Png.kp}
                  alt="Logo"
                  // IMPROVEMENT: Added styling to ensure the logo scales correctly.
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 700,
                    lineHeight: 1.1,
                  }}
                >
                  KPI GREEN OMS PRIVATE LIMITED
                </Typography>
                <Typography sx={{ color: "#DBEAFE", fontSize: "0.875rem" }}>
                  Advanced Monitoring System
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{ flexGrow: 1, textAlign: "center", my: { xs: 2, md: 0 } }}
            >
              <Typography
                variant="h5"
                component="h3"
                sx={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: "bold",
                }}
              >
                Smart Battery Pack
              </Typography>
              <Typography sx={{ fontSize: "1rem", color: "#E0E7FF" }}>
                Pack ID: {batteryData.bms_id}
              </Typography>
            </Box>

            <Box sx={{ alignSelf: { xs: "center", md: "center" } }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  width: { xs: 100, sm: 120 },
                  height: { xs: 100, sm: 120 },
                  borderRadius: "50%",
                  border: "3px solid",
                  borderColor: gradeColor,
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: "2.5rem", sm: "3.5rem" },
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 800,
                    color: gradeColor,
                    lineHeight: 1,
                  }}
                >
                  {grade}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Main content grid */}
          <Grid container>
            {/* IMPROVEMENT: Corrected grid to use 4+4+4=12 columns for a perfect fit on medium screens. */}
            <Grid item xs={12} md={4}>
              <Section title="Report Summary">
                <InfoRow label="Report Name" value="BatteryHealth" />
                <InfoRow
                  label="Report Number"
                  value={`BMS-${batteryData.bms_id.toString().slice(-4)}-DIAG`}
                />
                <InfoRow label="Report Time" value={reportTime} />
                <InfoRow label="Performed By" value="Automated System" />
                <InfoRow label="BMS ID" value={batteryData.bms_id} />
                <InfoRow label="Cycle Count" value={batteryData.cycle} />
                <InfoRow label="Chemistry" value={batteryData.chemistry} />
              </Section>
            </Grid>
            <Grid item xs={12} md={4}>
              <Section title="Battery Metrics">
                <InfoRow
                  label="Voltage"
                  value={`${(batteryData.voltage / 1000).toFixed(3)} V`}
                />
                <InfoRow
                  label="Current"
                  value={`${batteryData.current / 1000} A`}
                />
                <InfoRow label="Power" value={`${batteryData.power} W`} />
                <InfoRow
                  label="Capacity"
                  value={`${batteryData.capacity / 1000} Ah`}
                />
                <InfoRow
                  label="Battery Health"
                  value={`${batteryData.battery_health}%`}
                />
                <InfoRow
                  label="Battery Level"
                  value={`${batteryData.battery_level}%`}
                />
                <InfoRow
                  label="Load Status"
                  value={`${batteryData.load_status}`}
                />
                <InfoRow
                  label="Charging Switch"
                  value={`${batteryData.charging_switch}`}
                />
                <InfoRow
                  label="Discharging Switch"
                  value={`${batteryData.discharging_switch}`}
                />
              </Section>
            </Grid>
            <Grid item xs={12} md={4}>
              <Section title="Thermal Overview">
                {[1, 2, 3, 4].map((i) => (
                  <InfoRow
                    key={`temp-t${i}`}
                    label={`Temp T${i}`}
                    value={`${batteryData[`temp_t${i}`]} °C`}
                  />
                ))}
                <InfoRow
                  label="Temp Sensor Count"
                  value={batteryData.temp_count}
                />
                {/* IMPROVEMENT: Mapped over an array for cleaner and more maintainable code. */}
                {thermalFlags.map((flag) => (
                  <StatusRow
                    key={flag.label}
                    label={flag.label}
                    value={flag.value}
                  />
                ))}
              </Section>
            </Grid>
          </Grid>

          {/* Faults & Voltages sections */}
          <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Box
              sx={{
                mb: 2,
                p: 2,
                backgroundColor: "#FFF1F2",
                borderRadius: 2,
                border: 1,
                borderColor: "#FFE4E6",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: "#9F1239",
                  mb: 2,
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: "bold",
                }}
              >
                Faults & Alerts
              </Typography>
              <Grid container spacing={1}>
                {/* IMPROVEMENT: Mapped over a data array for cleaner code. */}
                {faultItems.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.label}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        p: 1.5,
                        bgcolor: "white",
                        borderRadius: 1,
                        boxShadow: 1,
                        borderColor: "#FEE2E2",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", mr: 1 }}
                      >
                        {item.label}:
                      </Typography>
                      {renderStatus(item.value)}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box
              sx={{
                p: 2,
                backgroundColor: "#FBF9FF",
                borderRadius: 2,
                border: 1,
                borderColor: "#F3E8FF",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: "#581C87",
                  mb: 2,
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: "bold",
                }}
              >
                Individual Cell Voltages
              </Typography>
              <Grid container spacing={1}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Grid item xs={12} sm={6} md={3} key={`cell-${i}`}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        p: 1.5,
                        bgcolor: "white",
                        borderRadius: 1,
                        boxShadow: 1,
                        borderColor: "#F3E8FF",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        Cell {i}:
                      </Typography>
                      {formatCellVoltage(batteryData[`cell_${i}`])}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>

          <Typography
            sx={{
              textAlign: "center",
              color: "text.secondary",
              fontSize: "0.75rem",
              py: 2,
            }}
          >
            Generated on {new Date().toLocaleDateString("en-US")} at{" "}
            {new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            <br />
            This report is generated automatically by the KPI Green OMS system.
            <br />
            <b>
              KP House, BRTS, Near KP Circle, Opp. Ishwar Farm Junction BRTS,
              Vesu Canal Road, Bhatar, Athwa, Surat - 395017, Gujarat, India.
            </b>
          </Typography>
        </Box>
      </Box>
    </>
  );
};

// ========================================================================
//  CONTAINER COMPONENT: BatteryReportPage
//  This component handles data fetching and state management.
// ========================================================================
const BatteryReportPage = () => {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // This effect runs once on mount to retrieve report data.
    // The data is expected to be in localStorage, placed there by another part of the app.
    const dataString = localStorage.getItem("latestBmsReportData");
    if (dataString) {
      try {
        const parsedData = JSON.parse(dataString);
        setReportData(parsedData);
        // Clean up the item from localStorage to prevent re-using old data on a subsequent visit.
        localStorage.removeItem("latestBmsReportData");
      } catch (e) {
        console.error("Failed to parse battery report data:", e);
        setError("Report data is corrupted or in an invalid format.");
      }
    } else {
      setError("Could not find the necessary report data.");
    }
    setIsLoading(false);
  }, []);

  const handleClose = () => {
    window.close();
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={50} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Report...
        </Typography>
      </Box>
    );
  }

  if (error || !reportData) {
    return (
      <Box sx={{ p: 4, textAlign: "center", mt: 8 }}>
        <Typography variant="h5" color="error" gutterBottom>
          Battery Report Data Not Found
        </Typography>
        <Typography sx={{ mt: 2, color: "text.secondary" }}>
          {error ||
            "This page should be opened automatically from the main application."}
        </Typography>
        <Typography sx={{ mt: 1, color: "text.secondary" }}>
          Please close this tab and try generating the report again.
        </Typography>
        <Button variant="contained" onClick={handleClose} sx={{ mt: 3 }}>
          Close Tab
        </Button>
      </Box>
    );
  }

  // Render the presentational component with the data
  return <BatteryReport batteryData={reportData} onBack={handleClose} />;
};

export default BatteryReportPage;
