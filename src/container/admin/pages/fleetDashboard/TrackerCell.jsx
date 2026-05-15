import { Box, Tooltip } from "@mui/material";
import WifiOffIcon from "@mui/icons-material/WifiOff";

const getColor = (data) => {
  if (!data) return "#f1f5f9"; // no data — very light grey

  const isOffline = Date.now() - data.updatedAt > 30000;
  if (isOffline) return "#f1f5f9"; // stale — same light grey

  const angle = data.value * 0.01;
  if (angle >= 28 && angle <= 32) return "#22c55e"; // ✅ GREEN  28–32°
  return "#faae2c"; // ⚠️ ORANGE everything else
};

const getTextColor = (data) => {
  if (!data) return "#94a3b8";
  const isOffline = Date.now() - data.updatedAt > 30000;
  if (isOffline) return "#94a3b8";
  return "#000000";
};

/**
 * TrackerCell
 * Props:
 *   id        {number}  tracker id
 *   data      {object}  tracker mqtt data (or undefined)
 *   blockId   {string}  block label e.g. "05"
 */
export default function TrackerCell({ id, data, blockId }) {
  const isOffline = data ? Date.now() - data.updatedAt > 30000 : true;
  const hasNoData = !data || isOffline;
  const angle = !hasNoData ? (data.value * 0.01).toFixed(2) : null;

  const bg = getColor(data);
  const textClr = getTextColor(data);

  // ── No data / offline ────────────────────────────────────────────────────
  if (hasNoData) {
    return (
      <Tooltip
        title={`Tracker ${id} · Block ${blockId} · Not Connected`}
        placement="top"
        arrow
      >
        <Box
          sx={{
            height: 52,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "5px",
            background: bg,
            border: "1.5px dashed #cbd5e1",
            color: "#94a3b8",
            cursor: "default",
            userSelect: "none",
            gap: "2px",
          }}
        >
          <Box
            sx={{
              fontSize: 11,
              fontWeight: 700,
              lineHeight: 1.2,
              color: "#64748b",
            }}
          >
            {id}
          </Box>
          <WifiOffIcon sx={{ fontSize: 12, color: "#cbd5e1" }} />
          <Box
            sx={{
              fontSize: 9,
              fontWeight: 500,
              lineHeight: 1,
              color: "#cbd5e1",
              textAlign: "center",
              px: 0.3,
            }}
          >
            Not Connected
          </Box>
        </Box>
      </Tooltip>
    );
  }

  // ── Live data ────────────────────────────────────────────────────────────
  return (
    <Tooltip
      title={`Tracker ${id} · Position: ${angle}° · Block ${blockId}`}
      placement="top"
      arrow
    >
      <Box
        sx={{
          height: 52,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "5px",
          background: bg,
          color: textClr,
          cursor: "default",
          userSelect: "none",
          "&:hover": {
            filter: "brightness(0.93)",
            zIndex: 1,
            position: "relative",
          },
          transition: "filter 0.1s",
        }}
      >
        <Box sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.25 }}>{id}</Box>
        <Box
          sx={{ fontSize: 13, fontWeight: 500, lineHeight: 1.2, opacity: 0.85 }}
        >
          {angle}°
        </Box>
      </Box>
    </Tooltip>
  );
}
