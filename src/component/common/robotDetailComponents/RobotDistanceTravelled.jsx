import Index from "../../../container/Index";
import PagesIndex from "../../../container/PagesIndex";

const NUM_CELLS = 12; // Number of solar panel cells

const RobotDistanceTravelled = ({ totalDistance }) => {
  // Clamp: if totalDistance > 99.75, treat as 100
  const clampedDistance =
    totalDistance > 99.75 ? 100 : Math.min(Math.max(totalDistance, 0), 100);

  return (
    <Index.Box
      className="admin-progress-bar-main"
      sx={{
        overflow: "hidden", // Ensures anything outside is clipped
        position: "relative", // Required for absolute children to be clipped
        height: "46px", // Slightly taller than rover for guaranteed fit
        minHeight: "46px",
      }}
    >
      <Index.Box
        sx={{
          marginBottom: "20px",
          height: "40px", // Bar height matches container
          borderRadius: "8px",
          border: "2px solid #246",
          boxShadow: "0 2px 10px #0f222b22, 0 0 16px 3px #c3b09155",
          display: "flex",
          alignItems: "center",
          position: "relative", // Needed for children to be clipped
          justifyContent: "flex-start",
          background:
            "linear-gradient(90deg, rgb(75, 123, 181) 60%, #2360a5 100%)",
          overflow: "hidden", // This also ensures the bar is a clipping context
        }}
      >
        {/* Shine Reflection Overlay */}
        <Index.Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "30%",
            top: 0,
            left: 0,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.05))",
            borderRadius: "8px",
            zIndex: 3,
            pointerEvents: "none",
          }}
        />

        {/* Soft beige shadow overlay */}
        <Index.Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "55%",
            borderRadius: "8px 8px 0 0",
            background:
              "linear-gradient(180deg, rgba(195, 176, 145, 0.36) 45%, rgba(195, 176, 145, 0.12) 100%)",
            zIndex: 4,
            pointerEvents: "none",
          }}
        />

        {/* Solar Panel Cells */}
        {Array.from({ length: NUM_CELLS }).map((_, i) => (
          <Index.Box
            key={i}
            sx={{
              flex: "1 1 0",
              height: "88%",
              margin: "0 1px",
              borderRadius: "2px",
              background:
                "linear-gradient(180deg, rgb(74, 117, 157) 83%, #65a3c6 100%)",
              border: "1.2px solid #edf2fc",
              boxShadow: "inset 0 1px 4px #648ec755",
              position: "relative",
              zIndex: 5,
            }}
          />
        ))}

        {/* Shaded Portion on the Right (beige shadow) */}
        <Index.Box
          sx={{
            height: "100%",
            background: "#c3b091",
            opacity: 0.6,
            position: "absolute",
            width: `${100 - clampedDistance}%`,
            right: "0",
            top: 0,
            zIndex: 6,
            pointerEvents: "none",
            borderRadius: "0 8px 8px 0",
          }}
        />

        {/* Rover Progress Marker */}
        <Index.Box
          sx={{
            position: "absolute",
            top: "50%",
            left:
              clampedDistance === 0
                ? "-5px"
                : `calc(${clampedDistance}% - 25px)`, // Centers the rover image (half width=15px)
            transition: "left 0.2s",
            zIndex: 8, // Lower than sticky/fixed headers, high enough for marker
            transform: "translateY(-50%)",
            filter: "drop-shadow(0px 0px 1px #ffee77cc)",
            pointerEvents: "none",
          }}
        >
          <img
            src={PagesIndex.Png.rover}
            alt="rover"
            height={40} // Slightly smaller than bar for a guaranteed fit
            width={30}
            style={{ verticalAlign: "middle" }}
          />
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
};

export default RobotDistanceTravelled;
