import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import DataService from "../config/DataService";
import { getStoredToken } from "../utils/authUtils";

const PrivateRoutes = ({ children }) => {
  const token = getStoredToken();
  if (token) {
    DataService.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
  return token ? <>{children}</> : <Navigate to="/" replace />;
};

export default PrivateRoutes;

// PropTypes validation (optional in TypeScript)
PrivateRoutes.propTypes = {
  children: PropTypes.node.isRequired,
};
