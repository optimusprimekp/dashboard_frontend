import { Paper, Box, Typography } from "@mui/material";
import { ncuConfig } from "../../utils/ncuConfig";

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

/**
 * NcuGrid
 * Props:
 *   selected  {string}              - currently selected NCU id
 *   onSelect  {(id: string) => void}
 */
export default function NcuGrid({ selected, onSelect }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {SUPER_BLOCKS.map((sb) => {
        const blockSet = new Set(sb.blocks);
        const ncuIds = Object.keys(ncuConfig)
          .filter((id) => blockSet.has(ncuConfig[id].block))
          .sort((a, b) => Number(a) - Number(b));

        return (
          <Box key={sb.name}>
            {/* Super-block header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 0.8,
                mb: 1,
                borderRadius: 1,
                background: sb.bgColor,
                borderLeft: `4px solid ${sb.color}`,
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: sb.color,
                  letterSpacing: 0.3,
                }}
              >
                {sb.name}
              </Typography>
              <Typography sx={{ fontSize: 11, color: sb.color, opacity: 0.7 }}>
                {sb.label}
              </Typography>
            </Box>

            {/* NCU buttons */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(8, 1fr)",
                gap: 1,
              }}
            >
              {ncuIds.map((id) => (
                <Paper
                  key={id}
                  onClick={() => onSelect(id)}
                  sx={{
                    p: 1,
                    textAlign: "center",
                    cursor: "pointer",
                    background: selected === id ? sb.color : "#1e293b",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 600,
                    borderLeft:
                      selected === id ? `4px solid ${sb.bgColor}` : "none",
                    "&:hover": {
                      background: selected === id ? sb.color : "#273549",
                    },
                    transition: "background 0.15s",
                  }}
                >
                  NCU {id}
                </Paper>
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
