import { Box, Typography, Collapse } from "@mui/material";
import { useMemo, useState } from "react";
import { ncuConfig } from "./ncuConfig";
import TrackerCell from "./TrackerCell";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import WifiOffIcon from "@mui/icons-material/WifiOff";

function rangeStr(ranges) {
  return ranges
    .map((r) => (r.start === r.stop ? `${r.start}` : `${r.start}–${r.stop}`))
    .join(", ");
}

/**
 * TrackerGrid
 * Props:
 *   ncuId        {string}   NCU id
 *   trackersData {object}   { [ncuId]: { [trackerId]: mqttData } }
 *   accentColor  {string}   left-border color from parent super-block
 */
export default function TrackerGrid({
  ncuId,
  trackersData,
  accentColor = "#334155",
}) {
  const [open, setOpen] = useState(true);

  const cfg = ncuConfig[ncuId];
  const blockId = cfg?.block;

  const trackers = useMemo(() => {
    const ranges = cfg?.ranges || [];
    const list = [];
    ranges.forEach((r) => {
      for (let i = r.start; i <= r.stop; i++) list.push(i);
    });
    return list;
  }, [ncuId]);

  // ── Check if the entire NCU has no data at all ───────────────────────────
  const ncuData = trackersData[ncuId];
  const isNcuNoData = !ncuData || Object.keys(ncuData).length === 0;

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: isNcuNoData ? "#e2e8f0" : "#e2e8f0",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {/* ── NCU header ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1,
          background: isNcuNoData ? "#f8fafc" : "#f8fafc",
          borderLeft: `4px solid ${isNcuNoData ? "#cbd5e1" : accentColor}`,
          borderBottom: open ? "1px solid #e2e8f0" : "none",
          cursor: "pointer",
          userSelect: "none",
          "&:hover": { background: "#f1f5f9" },
          transition: "background 0.12s",
        }}
        onClick={() => setOpen((v) => !v)}
      >
        {/* Left: chevron + NCU label + block chip */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ color: "#64748b", display: "flex", alignItems: "center" }}>
            {open ? (
              <ExpandLessIcon sx={{ fontSize: 18 }} />
            ) : (
              <ExpandMoreIcon sx={{ fontSize: 18 }} />
            )}
          </Box>

          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
            NCU {ncuId}
          </Typography>

          <Typography
            sx={{
              fontSize: 11,
              color: "#64748b",
              background: "#e2e8f0",
              px: 0.8,
              py: 0.2,
              borderRadius: 1,
            }}
          >
            Block {blockId}
          </Typography>

          {/* "Not Connected" badge on NCU header if no data */}
          {isNcuNoData && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.4,
                px: 0.8,
                py: 0.2,
                borderRadius: 1,
                background: "#fee2e2",
                border: "1px solid #fecaca",
              }}
            >
              <WifiOffIcon sx={{ fontSize: 11, color: "#ef4444" }} />
              <Typography
                sx={{ fontSize: 10, fontWeight: 700, color: "#ef4444" }}
              >
                Not Connected
              </Typography>
            </Box>
          )}
        </Box>

        {/* Right: tracker count + ranges */}
        <Typography sx={{ fontSize: 13, color: "#94a3b8" }}>
          {trackers.length}&nbsp;Tracker&nbsp;·&nbsp;
          {rangeStr(cfg?.ranges || [])}
        </Typography>
      </Box>

      {/* ── Tracker cells (collapsible) ── */}
      <Collapse in={open} timeout={180}>
        {isNcuNoData ? (
          /* ── Full NCU not connected banner ── */
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
              gap: 1,
              background: "#fafafa",
            }}
          >
            <WifiOffIcon sx={{ fontSize: 32, color: "#cbd5e1" }} />
            <Typography
              sx={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}
            >
              NCU {ncuId} is not connected with our system
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#cbd5e1" }}>
              No data received from any tracker in this NCU
            </Typography>
          </Box>
        ) : (
          /* ── Normal tracker grid ── */
          <Box
            sx={{
              p: 1,
              display: "grid",
              gridTemplateColumns: "repeat(13, minmax(0, 1fr))",
              gap: "3px",
              background: "#ffffff",
            }}
          >
            {trackers.map((t) => (
              <TrackerCell
                key={t}
                id={t}
                data={trackersData[ncuId]?.[t]}
                blockId={blockId}
              />
            ))}
          </Box>
        )}
      </Collapse>
    </Box>
  );
}
