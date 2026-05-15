import { useLocation } from "react-router-dom";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";

function SiteDetail() {
  const { state } = useLocation();
  console.log("state", state);
  return (
    <>
      <Index.Box className="admin-dashboard-content admin-user-list-content">
        <Index.Box className="admin-user-list-flex admin-page-title-main">
          <Index.Typography
            className="admin-page-title admin-user-list-page-title"
            component="h2"
            variant="h2"
          >
            Site Details
          </Index.Typography>
        </Index.Box>

        <Index.Box className="details-sec">
          {/* Site Info */}
          <div className="details-section">
            <div className="details-section-title">Site Information</div>
            <Index.Box className="details-box">
              <Index.Typography className="details-label">Site Name:</Index.Typography>
              <Index.Typography className="details-value">{state.name}</Index.Typography>
            </Index.Box>
            <Index.Box className="details-box">
              <Index.Typography className="details-label">Client Name:</Index.Typography>
              <Index.Typography className="details-value">{state.clientName}</Index.Typography>
            </Index.Box>
            <Index.Box className="details-box">
              <Index.Typography className="details-label">Location:</Index.Typography>
              <Index.Typography className="details-value">{state.location}</Index.Typography>
            </Index.Box>
            <Index.Box className="details-box">
              <Index.Typography className="details-label">Latitude:</Index.Typography>
              <Index.Typography className="details-value">{state.latitude}</Index.Typography>
            </Index.Box>
            <Index.Box className="details-box">
              <Index.Typography className="details-label">Longitude:</Index.Typography>
              <Index.Typography className="details-value">{state.longitude}</Index.Typography>
            </Index.Box>
            <Index.Box className="details-box">
              <Index.Typography className="details-label">MWP:</Index.Typography>
              <Index.Typography className="details-value">{state.mwp}</Index.Typography>
            </Index.Box>
            <Index.Box className="details-box">
              <Index.Typography className="details-label">Total Blocks:</Index.Typography>
              <Index.Typography className="details-value">{state.totalBlocks}</Index.Typography>
            </Index.Box>
            <Index.Box className="details-box">
              <Index.Typography className="details-label">Total Inverters:</Index.Typography>
              <Index.Typography className="details-value">{state.totalInverters}</Index.Typography>
            </Index.Box>
            <Index.Box className="details-box">
              <Index.Typography className="details-label">Is Active:</Index.Typography>
              <Index.Typography className="details-value">{state.isActive ? "Yes" : "No"}</Index.Typography>
            </Index.Box>
          </div>

          {/* O&M Contact */}
          <div className="details-section">
            <div className="details-section-title">O&amp;M Contact</div>
            <Index.Box className="details-box">
              <Index.Typography className="details-label">Name:</Index.Typography>
              <Index.Typography className="details-value">{state.omName}</Index.Typography>
            </Index.Box>
            <Index.Box className="details-box">
              <Index.Typography className="details-label">Email:</Index.Typography>
              <Index.Typography className="details-value">{state.omEmail}</Index.Typography>
            </Index.Box>
            <Index.Box className="details-box">
              <Index.Typography className="details-label">Mobile No.:</Index.Typography>
              <Index.Typography className="details-value">{state.omMobile}</Index.Typography>
            </Index.Box>
            <Index.Box className="details-box">
              <Index.Typography className="details-label">Employee ID:</Index.Typography>
              <Index.Typography className="details-value">{state.omEmpId}</Index.Typography>
            </Index.Box>
          </div>

          {/* Maintenance Contact */}
          <div className="details-section">
            <div className="details-section-title">Maintenance Contact</div>
            <Index.Box className="details-box">
              <Index.Typography className="details-label">Name:</Index.Typography>
              <Index.Typography className="details-value">{state.maintenanceName}</Index.Typography>
            </Index.Box>
            <Index.Box className="details-box">
              <Index.Typography className="details-label">Email:</Index.Typography>
              <Index.Typography className="details-value">{state.maintenanceEmail}</Index.Typography>
            </Index.Box>
            <Index.Box className="details-box">
              <Index.Typography className="details-label">Mobile No.:</Index.Typography>
              <Index.Typography className="details-value">{state.maintenanceMobile}</Index.Typography>
            </Index.Box>
            <Index.Box className="details-box">
              <Index.Typography className="details-label">Employee ID:</Index.Typography>
              <Index.Typography className="details-value">{state.maintenanceEmpId}</Index.Typography>
            </Index.Box>
          </div>
        </Index.Box>
      </Index.Box>
    </>
  );
}

export default SiteDetail;
