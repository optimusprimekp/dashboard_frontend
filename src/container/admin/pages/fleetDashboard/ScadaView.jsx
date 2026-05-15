import { Box, Paper, Typography } from "@mui/material";
import { useState } from "react";
import { ncuConfig } from "./ncuConfig";
import TrackerGrid from "./TrackerGrid";

// ── Super-block grouping ──────────────────────────────────────────────────────
const SUPER_BLOCKS = [
  {
    name: "BLOCK-4",
    label: "Blocks 01–04",
    blocks: ["01", "02", "03", "04"],
    color: "#185FA5",
    bgColor: "#E6F1FB",
  },
  {
    name: "BLOCK-9",
    label: "Blocks 05–09",
    blocks: ["05", "06", "07", "08", "09"],
    color: "#0F6E56",
    bgColor: "#E1F5EE",
  },
  {
    name: "BLOCK-14",
    label: "Blocks 10–14",
    blocks: ["10", "11", "12", "13", "14"],
    color: "#534AB7",
    bgColor: "#EEEDFE",
  },
  {
    name: "BLOCK-15",
    label: "Blocks 15–16",
    blocks: ["15", "16"],
    color: "#993C1D",
    bgColor: "#FAECE7",
  },
];

export default function ScadaView({ mqttData }) {
  const [selectedSuperBlock, setSelectedSuperBlock] = useState(null);
  const { ncuTrackers } = mqttData;

  // ── Status helpers ────────────────────────────────────────────────────────

  /**
   * A tracker is considered "online" if:
   *  - data exists
   *  - updatedAt is within last 30 seconds
   *  - it has a value (angle data is arriving)
   */
  const isTrackerOnline = (data) => {
    if (!data) return false;
    if (Date.now() - data.updatedAt > 30000) return false;
    return data.value !== undefined && data.value !== null;
  };

  /**
   * NCU status:
   *   "online"  — at least one tracker has live angle data
   *   "offline" — no trackers have any data at all
   *   "warning" — data exists but all trackers are stale/offline
   */
  const getNcuStatus = (ncuId) => {
    const trackers = ncuTrackers[ncuId] || {};
    const values = Object.values(trackers);
    if (values.length === 0) return "offline";
    const hasLive = values.some(isTrackerOnline);
    if (hasLive) return "online";
    return "warning";
  };

  /**
   * Super-block status:
   *   "online"  — at least one NCU is online (angle data arriving)
   *   "warning" — data exists but no live angle data
   *   "offline" — no data at all
   */
  const getSuperBlockStatus = (sb) => {
    const blockSet = new Set(sb.blocks);
    const ncuIds = Object.keys(ncuConfig).filter((id) =>
      blockSet.has(ncuConfig[id].block),
    );
    const statuses = ncuIds.map(getNcuStatus);
    if (statuses.includes("online")) return "online";
    if (statuses.includes("warning")) return "warning";
    return "offline";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "#22c55e";
      case "warning":
        return "#f59e0b";
      case "offline":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "online":
        return "ONLINE";
      case "warning":
        return "WARNING";
      case "offline":
        return "OFFLINE";
      default:
        return "OFFLINE";
    }
  };

  // ── Active super-block ───────────────────────────────────────────────────
  const activeSb = SUPER_BLOCKS.find((sb) => sb.name === selectedSuperBlock);

  const activeNcuIds = activeSb
    ? (() => {
        const blockSet = new Set(activeSb.blocks);
        return Object.keys(ncuConfig)
          .filter((id) => blockSet.has(ncuConfig[id].block))
          .sort((a, b) => Number(a) - Number(b));
      })()
    : [];

  // ── Shared page wrapper ──────────────────────────────────────────────────
  const PageWrap = ({ children }) => (
    <Box
      sx={{
        p: 2,
        bgcolor: "#ffffff",
        minHeight: "100vh",
        color: "#0f172a",
        borderRadius: 3,
      }}
    >
      {/* Breadcrumb */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 15, color: "#0f172a" }}>
          <span
            style={{ cursor: "pointer", color: "#38bdf8", fontWeight: 600 }}
            onClick={() => setSelectedSuperBlock(null)}
          >
            BLOCKS
          </span>
          {selectedSuperBlock && (
            <>
              {" › "}
              <span style={{ color: "#0f172a", fontWeight: 600 }}>
                {selectedSuperBlock}
              </span>
            </>
          )}
        </Typography>
      </Box>
      {children}
    </Box>
  );

  // ── View 1: Super-block cards ────────────────────────────────────────────
  if (!selectedSuperBlock) {
    return (
      <PageWrap>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 2,
          }}
        >
          {SUPER_BLOCKS.map((sb) => {
            const status = getSuperBlockStatus(sb);
            const statusColor = getStatusColor(status);
            const blockSet = new Set(sb.blocks);
            const ncuCount = Object.keys(ncuConfig).filter((id) =>
              blockSet.has(ncuConfig[id].block),
            ).length;

            return (
              <Paper
                key={sb.name}
                onClick={() => setSelectedSuperBlock(sb.name)}
                elevation={0}
                sx={{
                  p: 2.5,
                  cursor: "pointer",
                  border: "1.5px solid #e2e8f0",
                  borderLeft: `6px solid ${statusColor}`,
                  borderRadius: 2,
                  background: "#ffffff",
                  "&:hover": { background: sb.bgColor },
                  transition: "background 0.15s",
                }}
              >
                <Typography
                  sx={{ fontWeight: 800, fontSize: 16, color: sb.color }}
                >
                  {sb.name}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.4 }}>
                  {sb.label}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "#94a3b8", mt: 0.3 }}>
                  {ncuCount} NCUs
                </Typography>

                {/* Status badge */}
                <Box
                  sx={{
                    mt: 1.2,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.6,
                  }}
                >
                  {/* Pulsing dot for online */}
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: statusColor,
                      flexShrink: 0,
                      ...(status === "online" && {
                        animation: "pulse 1.8s ease-in-out infinite",
                        "@keyframes pulse": {
                          "0%, 100%": { opacity: 1 },
                          "50%": { opacity: 0.35 },
                        },
                      }),
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: statusColor,
                      letterSpacing: 0.4,
                    }}
                  >
                    {getStatusLabel(status)}
                  </Typography>
                </Box>
              </Paper>
            );
          })}
        </Box>
      </PageWrap>
    );
  }

  // ── View 2: All NCUs + trackers for selected super-block ─────────────────
  const sbStatus = getSuperBlockStatus(activeSb);
  const sbStatusColor = getStatusColor(sbStatus);

  return (
    <PageWrap>
      {/* Super-block header bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.2,
          mb: 2,
          borderRadius: 2,
          background: activeSb.bgColor,
          borderLeft: `5px solid ${activeSb.color}`,
        }}
      >
        <Typography
          sx={{ fontSize: 14, fontWeight: 800, color: activeSb.color }}
        >
          {activeSb.name}
        </Typography>
        <Typography sx={{ fontSize: 13, color: activeSb.color, opacity: 0.7 }}>
          {activeSb.label}
        </Typography>

        <Box sx={{ flex: 1 }} />

        {/* Live status in header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: sbStatusColor,
              flexShrink: 0,
              ...(sbStatus === "online" && {
                animation: "pulse 1.8s ease-in-out infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.35 },
                },
              }),
            }}
          />
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: sbStatusColor,
              letterSpacing: 0.4,
            }}
          >
            {getStatusLabel(sbStatus)}
          </Typography>
        </Box>

        <Typography
          sx={{ fontSize: 12, color: activeSb.color, opacity: 0.7, ml: 1 }}
        >
          {activeNcuIds.length} NCUs
        </Typography>
      </Box>

      {/* All NCU TrackerGrids — each has its own collapse toggle */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {activeNcuIds.map((ncuId) => (
          <TrackerGrid
            key={ncuId}
            ncuId={ncuId}
            trackersData={ncuTrackers}
            accentColor={activeSb.color}
          />
        ))}
      </Box>
    </PageWrap>
  );
}
