// src/pages/reports/DiagnosticsReportPage.js

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import PagesIndex from "../../../../PagesIndex"; // Assuming this path is correct for your project

// ========================================================================
//  PRESENTATIONAL COMPONENT: DiagnosticsReport
//  This component renders the UI using MUI components and the `sx` prop for styling.
// ========================================================================
const DiagnosticsReport = ({ diagnosticsData, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  // --- Helper Functions for Styling & Formatting ---

  const getOverallRatingColor = (grade) => {
    if (!grade) return "#9ca3af"; // Gray
    const rating = grade.charAt(0).toUpperCase();
    switch (rating) {
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

  const getStatusStyles = (status) => {
    switch (status) {
      case "PASS":
        return { bgColor: "success.lightest", textColor: "success.dark" };
      case "FAIL":
        return { bgColor: "error.lightest", textColor: "error.dark" };
      case "WARNING":
        return { bgColor: "warning.lightest", textColor: "warning.dark" };
      case "NOT SUPPORTED":
      case "N/S":
        return { bgColor: "info.lightest", textColor: "info.dark" };
      case "NOT GRADED":
      case "N/G":
      case "N/A":
      default:
        return { bgColor: "grey.200", textColor: "text.secondary" };
    }
  };

  // --- Sub-components for cleaner rendering ---

  const Section = ({ title, children, sx = {} }) => (
    <Box sx={{ p: 2, ...sx }}>
      <Typography
        variant="h6"
        sx={{
          fontFamily: "Montserrat, sans-serif",
          fontWeight: "bold",
          color: "grey.800",
          mb: 1.5,
          fontSize: "1rem",
        }}
      >
        {title}
      </Typography>
      <Stack spacing={1}>{children}</Stack>
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
        sx={{ fontWeight: "bold", color: "text.primary", textAlign: "right" }}
      >
        {value}
      </Typography>
    </Box>
  );

  const StatusCell = ({ status }) => {
    const { bgColor, textColor } = getStatusStyles(status);
    let text = status;
    if (status === "NOT SUPPORTED") text = "N/S";
    if (status === "NOT GRADED") text = "N/G";

    return (
      <TableCell
        align="center"
        sx={{
          backgroundColor: bgColor,
          color: textColor,
          fontWeight: "600",
          fontSize: "0.8rem",
          py: 1,
        }}
      >
        {status === "PASS" && "✅ "}
        {status === "FAIL" && "❌ "}
        {text}
      </TableCell>
    );
  };

  const MotorDetailsCard = ({ motorName, data }) => {
    const TEMP_THRESHOLD_HIGH = 45;
    const VOLTAGE_THRESHOLD_HIGH = 160;

    return (
      <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: "bold",
            color: "grey.700",
            mb: 1.5,
            borderBottom: 1,
            borderColor: "divider",
            pb: 1,
          }}
        >
          {motorName} Motor
        </Typography>
        <Stack spacing={1}>
          <InfoRow label="Speed" value={`${data.speed} RPM`} />
          <InfoRow label="Voltage" value={`${data.voltage} mV`} />
          <InfoRow label="Current" value={`${data.current} mA`} />
          <InfoRow
            label="Temp"
            value={
              <Typography
                component="span"
                sx={{
                  fontWeight: "bold",
                  color:
                    data.temp > TEMP_THRESHOLD_HIGH
                      ? "error.main"
                      : "text.primary",
                }}
              >
                {data.temp} °C
              </Typography>
            }
          />
        </Stack>
      </Paper>
    );
  };

  const overallRatingColor = getOverallRatingColor(
    diagnosticsData.overallRating
  );

  return (
    <>
      {/* Styles for printing */}
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

      {/* Action Header - Not printed */}
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
          Robot Diagnostics Report
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

      {/* Printable Report Content */}
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
            maxWidth: "1100px",
            mx: "auto",
            backgroundColor: "white",
            boxShadow: { sm: 3 },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: "linear-gradient(to right, #1E40AF, #1C3A9A)",
              color: "white",
              p: { xs: 2, sm: 3 },
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  p: 1,
                  bgcolor: "white",
                  borderRadius: 1,
                  width: 60,
                  height: 60,
                  display: "flex",
                }}
              >
                <img
                  src={PagesIndex.Png.kp}
                  alt="Logo"
                  style={{ width: "100%", objectFit: "contain" }}
                />
              </Box>
              <Typography
                variant="h5"
                sx={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800 }}
              >
                RobotMRI™
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: "center", md: "right" } }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {diagnosticsData.robotInformation.year}{" "}
                {diagnosticsData.robotInformation.make}
              </Typography>
              <Typography sx={{ color: "#DBEAFE" }}>
                {diagnosticsData.robotInformation.model}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                sx={{
                  fontSize: "3rem",
                  fontWeight: 800,
                  color: overallRatingColor,
                  lineHeight: 1,
                }}
              >
                {diagnosticsData.overallRating}
              </Typography>
              <Typography variant="body2" sx={{ color: "#E0E7FF" }}>
                Overall Grade
              </Typography>
            </Box>
          </Box>

          {/* Summaries Grid */}
          <Grid container sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Grid
              item
              xs={12}
              md={4}
              sx={{ borderRight: { md: 1 }, borderColor: "divider" }}
            >
              <Section title="Report Summary">
                <InfoRow
                  label="Report Name"
                  value={diagnosticsData.reportSummary.reportTitle}
                />
                <InfoRow
                  label="Report Number"
                  value={diagnosticsData.reportSummary.reportNumber}
                />
                <InfoRow
                  label="Report Time"
                  value={diagnosticsData.reportSummary.reportTime}
                />
                <InfoRow
                  label="Performed By"
                  value={diagnosticsData.reportSummary.performedBy}
                />
                <InfoRow
                  label="Company ID"
                  value={diagnosticsData.reportSummary.companyID}
                />
              </Section>
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              sx={{
                borderRight: { md: 1 },
                borderTop: { xs: 1, md: 0 },
                borderColor: "divider",
              }}
            >
              <Section title="Robot Information">
                <InfoRow
                  label="VIN"
                  value={diagnosticsData.robotInformation.vin}
                />
                <InfoRow
                  label="Robot ID"
                  value={diagnosticsData.robotInformation.robotID}
                />
                <InfoRow
                  label="Engine"
                  value={diagnosticsData.robotInformation.engine}
                />
                <InfoRow
                  label="Odometer"
                  value={diagnosticsData.robotInformation.odometer}
                />
              </Section>
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              sx={{ borderTop: { xs: 1, md: 0 }, borderColor: "divider" }}
            >
              <Section title="Other Summary">
                <InfoRow
                  label="Items Checked"
                  value={diagnosticsData.otherSummary.itemsChecked}
                />
                <InfoRow
                  label="Duration"
                  value={diagnosticsData.otherSummary.duration}
                />
                <InfoRow
                  label="Firmware Version"
                  value={diagnosticsData.otherSummary.firmwareVersion}
                />
                <InfoRow
                  label="Database Version"
                  value={diagnosticsData.otherSummary.databaseVersion}
                />
              </Section>
            </Grid>
          </Grid>

          {/* Category Details Table */}
          <Box sx={{ p: { xs: 1, md: 3 } }}>
            <Section title="Category Details">
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead sx={{ bgcolor: "grey.100" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Category
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Overall
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Key On
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        In Operation
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {diagnosticsData.categoryDetails.map((item) => (
                      <TableRow key={item.category} hover>
                        <TableCell component="th" scope="row">
                          {item.category}
                        </TableCell>
                        <StatusCell status={item.overall} />
                        <StatusCell status={item.keyOn} />
                        <StatusCell status={item.engineRunning} />
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Section>
          </Box>

          {/* Detailed Data Sections */}
          <Box sx={{ p: { xs: 1, md: 3 }, pt: 0 }}>
            {/* IMU Data */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                IMU Data (Raw Readings)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: "info.lightest", borderRadius: 1 }}>
                    <Typography sx={{ fontWeight: "bold", color: "info.dark" }}>
                      Acceleration (mg)
                    </Typography>
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      <Grid item xs={4}>
                        <InfoRow
                          label="X"
                          value={diagnosticsData.imuData.accX}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <InfoRow
                          label="Y"
                          value={diagnosticsData.imuData.accY}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <InfoRow
                          label="Z"
                          value={diagnosticsData.imuData.accZ}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{ p: 2, bgcolor: "success.lightest", borderRadius: 1 }}
                  >
                    <Typography
                      sx={{ fontWeight: "bold", color: "success.dark" }}
                    >
                      Gyroscope (°/s)
                    </Typography>
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      <Grid item xs={4}>
                        <InfoRow
                          label="X"
                          value={diagnosticsData.imuData.gyroX}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <InfoRow
                          label="Y"
                          value={diagnosticsData.imuData.gyroY}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <InfoRow
                          label="Z"
                          value={diagnosticsData.imuData.gyroZ}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Motor Parameters */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Motor Parameters
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <MotorDetailsCard
                    motorName="Brush"
                    data={diagnosticsData.motors.brush}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <MotorDetailsCard
                    motorName="Left"
                    data={diagnosticsData.motors.left}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <MotorDetailsCard
                    motorName="Right"
                    data={diagnosticsData.motors.right}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* Footer */}
          <Typography
            sx={{
              textAlign: "center",
              color: "text.secondary",
              fontSize: "0.75rem",
              py: 2,
              borderTop: 1,
              borderColor: "divider",
              bgcolor: "grey.50",
            }}
          >
            © {new Date().getFullYear()} {diagnosticsData.companyName}. Report
            generated by {diagnosticsData.reportSummary.performedBy}.
          </Typography>
        </Box>
      </Box>
    </>
  );
};

// ========================================================================
//  CONTAINER COMPONENT: DiagnosticsReportPage
//  This component handles data fetching and state management.
// ========================================================================
const DiagnosticsReportPage = () => {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // This effect runs once on mount to retrieve report data from localStorage.
    const dataString = localStorage.getItem("latestDiagnosticsReportData");
    if (dataString) {
      try {
        const parsedData = JSON.parse(dataString);
        setReportData(parsedData);
        // Clean up to prevent re-using old data on a subsequent visit.
        localStorage.removeItem("latestDiagnosticsReportData");
      } catch (e) {
        console.error("Failed to parse diagnostics report data:", e);
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
          Loading Diagnostics Report...
        </Typography>
      </Box>
    );
  }

  if (error || !reportData) {
    return (
      <Box sx={{ p: 4, textAlign: "center", mt: 8 }}>
        <Typography variant="h5" color="error" gutterBottom>
          Diagnostics Report Data Not Found
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

  // To use this page, you would pass the `mockDiagnosticsData` from your sample
  // into localStorage with the key "latestDiagnosticsReportData" before navigating here.
  return (
    <DiagnosticsReport diagnosticsData={reportData} onBack={handleClose} />
  );
};

export default DiagnosticsReportPage;
