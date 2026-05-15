import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tooltip,
  IconButton,
  Avatar,
  Badge,
  Collapse,
  Stack,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as EmployeeIcon,
  Place as LocationIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Devices as DevicesIcon,
  Error as ErrorIcon,
  Build as MaintIcon,
  Update as UpdateIcon,
  PauseCircleOutline as IdleIcon,
  ChargingStation as ChargingStationIcon,
  CleaningServices  as CleaningIcon,
} from "@mui/icons-material";

// Copy-to-clipboard utility
const handleCopy = (value) => {
  navigator.clipboard.writeText(value);
};

// Contact/detail field with icon
const InteractiveDetail = ({ icon, label, value, clickable }) => (
  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
    <Avatar sx={{ bgcolor: "primary.light", width: 28, height: 28, mr: 1 }}>
      {icon}
    </Avatar>
    <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 88 }}>
      {label}:
    </Typography>
    <Typography
      variant="body2"
      sx={{
        ml: 1,
        mr: 2,
        textDecoration: clickable ? "underline dotted" : "none",
        cursor: clickable ? "copy" : "default",
      }}
      onClick={clickable ? () => handleCopy(value) : undefined}
    >
      {value}
    </Typography>
    {clickable && (
      <IconButton onClick={() => handleCopy(value)} size="small">
        <CopyIcon fontSize="small" />
      </IconButton>
    )}
  </Box>
);

// Circular battery progress indicators for each group

const BatteryGroups = ({ batteryLevelGroups }) => {
  const groups = [
    { label: "100%", group: "group4", color: "success.main", value: 100 },
    { label: "75%", group: "group3", color: "primary.main", value: 75 },
    { label: "50%", group: "group2", color: "warning.main", value: 50 },
    { label: "25%", group: "group1", color: "error.main", value: 25 },
  ];
  return (
    <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
      {groups.map(({ label, group, color, value }) => {
        const count = batteryLevelGroups?.[group] || 0;
        return (
          <Box
            key={group}
            sx={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <Tooltip
              title={`${label} Battery: ${count} device${
                count !== 1 ? "s" : ""
              }`}
              arrow
            >
              <CircularProgress
                variant="determinate"
                value={value}
                size={55}
                thickness={5}
                sx={{
                  color: color,
                  backgroundColor: "grey.100",
                  borderRadius: "50%",
                }}
              />
            </Tooltip>
            {/* Count & label in center */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <Typography variant="caption" fontWeight={700} fontSize={16}>
                {count}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
};

// State row for each robot state
const StateRow = ({ icon, label, count, color = "default" }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      p: 1,
      borderRadius: 1,
      bgcolor: "grey.100",
      minHeight: 36,
    }}
  >
    {React.cloneElement(icon, { color })}
    <Typography variant="body2" sx={{ minWidth: 70, fontWeight: 500 }}>
      {label}:
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 700 }}>
      {count}
    </Typography>
  </Box>
);

const BlockCard = ({ block }) => {
  const [expanded, setExpanded] = React.useState(false);
  const statusColor =
    block.counts?.error > 0
      ? "error.main"
      : block.counts?.maintenance > 0
      ? "warning.main"
      : "success.main";
  const totalRobots = block?.devices?.length || 0;

  // All state rows in order
  const stateRows = [
    {
      label: "Idle",
      icon: <IdleIcon />,
      count: block?.counts?.idle || 0,
      color: "info",
    },
    {
      label: "Charging",
      icon: <ChargingStationIcon />,   // Your charging icon
      count: block?.counts?.charging || 0,
      color: "success",
    },
    {
      label: "Cleaning",
      icon: <CleaningIcon/>,           // Your cleaning icon
      count: block?.counts?.cleaning || 0,
      color: "primary",
    },
    {
      label: "Error",
      icon: <ErrorIcon />,
      count: block?.counts?.error || 0,
      color: "error",
    },
    {
      label: "Maintenance",
      icon: <MaintIcon />,
      count: block?.counts?.maintenance || 0,
      color: "warning",
    },
    {
      label: "Update",
      icon: <UpdateIcon />,
      count: block?.counts?.update || 0,
      color: "info",
    },
  ];

  return (
    <Card
      sx={{
        mt: 2,
        boxShadow: expanded ? 6 : 2,
        borderLeft: `8px solid`,
        borderColor: statusColor,
        transition: "box-shadow .2s",
        position: "relative",
      }}
      onClick={() => setExpanded((exp) => !exp)}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 1,
            cursor: "pointer",
            justifyContent: "space-between",
          }}
        >
          {/* Block name at left */}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {block.blockName}
          </Typography>
          {/* Total robots as StateRow-style, but compact */}
          <StateRow
            icon={<DevicesIcon />}
            label="Total Robots"
            count={totalRobots}
            color="secondary"
          />
          <ExpandMoreIcon
            sx={{
              ml: 1,
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: ".2s",
            }}
          />
        </Box>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <BatteryGroups batteryLevelGroups={block.batteryLevelGroups} />
          <Box sx={{ mt: 2, mb: 1 }}>
            <Grid container spacing={1}>
              {stateRows.map((row, idx) => (
                <Grid item xs={12} sm={6} key={row.label}>
                  <StateRow {...row} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};


const SiteInfo = ({ site }) => (
  <Box
    sx={{
      px: { xs: 1, md: 4 },
      py: 2,
      display: "flex",
      flexDirection: "column",
      gap: 4,
    }}
  >
    {/* Site Details Box */}
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography
        variant="h4"
        sx={{ mb: 2, fontWeight: 700, letterSpacing: 0.5 }}
      >
        Site Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <InteractiveDetail
            icon={<PersonIcon />}
            label="Site name"
            value={site.siteName}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InteractiveDetail
            icon={<LocationIcon />}
            label="Location"
            value={site.location}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InteractiveDetail
            icon={<LocationIcon color="action" />}
            label="GPS"
            value={site.latitude + "," + site.longitude}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InteractiveDetail
            icon={<PersonIcon />}
            label="Client name"
            value={site.clientName}
          />
        </Grid>
      </Grid>
      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="h5"
            sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
          >
            O&M Contact
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <InteractiveDetail
                icon={<PersonIcon />}
                label="Name"
                value={site.omName}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <InteractiveDetail
                icon={<PhoneIcon />}
                label="Mobile"
                value={site.omMobile}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <InteractiveDetail
                icon={<EmailIcon />}
                label="Email"
                value={site.omEmail}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <InteractiveDetail
                icon={<EmployeeIcon />}
                label="Employee ID"
                value={site.omEmpId}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="h5"
            sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
          >
            Maintenance Contact
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <InteractiveDetail
                icon={<PersonIcon />}
                label="Name"
                value={site.maintenanceName}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <InteractiveDetail
                icon={<PhoneIcon />}
                label="Mobile"
                value={site.maintenanceMobile}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <InteractiveDetail
                icon={<EmailIcon />}
                label="Email"
                value={site.maintenanceEmail}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <InteractiveDetail
                icon={<EmployeeIcon />}
                label="Employee ID"
                value={site.maintenanceEmpId}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
    {/* Blocks Box */}
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Site Blocks
      </Typography>
      <Grid container spacing={3}>
        {site.blocks.map((block) => (
          <Grid key={block.id} item xs={12} sm={6} md={4}>
            <BlockCard block={block} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  </Box>
);

export default SiteInfo;
