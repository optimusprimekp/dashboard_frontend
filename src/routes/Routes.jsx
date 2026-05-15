import { BrowserRouter, Route, Routes as Routess } from "react-router-dom";
import { createBrowserHistory } from "history";
// import { useSelector } from "react-redux";

//#start region Admin
import Login from "../component/admin/auth/login/Login";
import ForgotPassword from "../component/admin/auth/forgotPassword/ForgotPassword";
import Otp from "../component/admin/auth/otp/Otp";
import AdminLayOut from "../container/admin/pages/adminLayout/AdminLayOut";
import UserList from "../container/admin/pages/userList/UserList";
import DashBoard from "../container/admin/pages/dashBoard/DashBoard";
import AddUser from "../container/admin/pages/addUser/AddUser";
import UserCard from "../container/admin/pages/userCard/UserCard";
import AccountLayout from "../container/admin/pages/accountLayout/AccountLayout";
import PrivacyPolicy from "../container/admin/pages/privacyPolicy/PrivacyPolicy";
import TermsAndCondition from "../container/admin/pages/termsAndCondition/TermsAndCondition";
import ChirpStackMqttComponent from "../container/admin/pages/mqtt/Mqtt";
//#endregion

//#start region user
import DataNotFound from "../component/common/dataNotFound/DataNotFound";
import Loader from "../component/common/loader/Loader";
import Spinner from "../component/common/spinner/Spinner";
import PageLoader from "../component/common/loader/PageLoader";
import PermissionList from "../container/admin/pages/permissionList/PermissionList";
import RoleList from "../container/admin/pages/roleList/RoleList";
import PrivateRoutes from "./PrivateRoutes";
import SiteManagementList from "../container/admin/pages/siteManagement/SiteManagementList";
import GateWayManagementList from "../container/admin/pages/gatewayManagement/GateWayManagementList";
import RobotManagementList from "../container/admin/pages/robotManagement/RobotManagementList";
// import RobotControl from "../container/admin/pages/robotManagement/RobotControl";
import SiteDetail from "../container/admin/pages/siteManagement/SiteDetail";
import FuotaManagementList from "../container/admin/pages/fuotaManagement/FuotaManagementList";
import RobotControlNew from "../container/admin/pages/robotManagement/RobotControlNew";
import BlockManagementList from "../container/admin/pages/blockManagement/BlockManagementList";
import FirmwareUpdateManagement from "../container/admin/pages/firmwareUpdateManagement/FirmwareUpdateManagement";
import MultiFirmwareUpdateManagement from "../container/admin/pages/firmwareUpdateManagement/MultiFirmwareUpdate";
import RoleManagement from "../container/admin/pages/permissionList/RoleManagement";
import ResetPassword from "../component/admin/auth/resetPassword/ResetPassword";
import GsmFuotaManagementList from "../container/admin/pages/gsmFuotaManagement/GsmFuotaManagementList";
import RobotOverview from "../container/admin/pages/monitoring/RobotOverview";
import TaskReport from "../container/admin/pages/reports/TaskReport";
import LoginLog from "../container/admin/pages/reports/LoginLog";
import OperationalLog from "../container/admin/pages/reports/OperationalLog";
import RobotAlarm from "../container/admin/pages/systemAlarms/RobotAlarm";
import ProcessedAlarm from "../container/admin/pages/systemAlarms/ProcessedAlarm";
import FleetDashboard from "../container/admin/pages/fleetDashboard/FleetDashboard";
import Chirpstack from "../container/admin/pages/chirpstack/Chirpstack";
import BlockView from "../container/admin/pages/blockManagement/BlockView";
// import UnderMaintenance from "../component/common/underMaintenance/UnderMaintenance";
// import PageNotFound from "../component/common/pageNotFound/PageNotFound";
import BatteryReportPage from "../container/admin/pages/monitoring/components/BatteryReport";
import DiagnosticsReportPage from "../container/admin/pages/monitoring/components/DiagnosticsReport";
import MotorReport from "../container/admin/pages/reports/MotorReport";
import OtherReport from "../container/admin/pages/reports/OtherReport";
import WeatherView from "../container/admin/pages/monitoring/WeatherView";
import RowManagementList from "../container/admin/pages/rowManagement/RowManagementList";
import BlockLevelMap from "../container/admin/pages/blockManagement/BlockLevelMap";
const history = createBrowserHistory();
export default function Routes() {
  // const login = useSelector((state) => {
  //   return state.AdminReducer.isAdminLogin
  // });
  // const login = true;

  return (
    <BrowserRouter history={history}>
      <Routess>
        <Route path="/" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="otp-verify" element={<Otp />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/admin"
          element={
            <PrivateRoutes>
              <AdminLayOut />
            </PrivateRoutes>
          }
        >
          <Route path="dashboard" element={<DashBoard />} />
          <Route path="account" element={<AccountLayout />} />
          <Route path="user-list" element={<UserList />} />
          <Route path="site-list" element={<SiteManagementList />} />
          <Route path="view-site" element={<SiteDetail />} />
          <Route path="gateway-list" element={<GateWayManagementList />} />
          <Route path="robot-list" element={<RobotManagementList />} />
          <Route path="fuota-list" element={<FuotaManagementList />} />
          <Route path="gsm-fuota-list" element={<GsmFuotaManagementList />} />
          <Route path="permission-list" element={<PermissionList />} />
          <Route path="role-list" element={<RoleList />} />
          <Route path="user-card" element={<UserCard />} />
          <Route path="add-user" element={<AddUser />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-and-condition" element={<TermsAndCondition />} />
          <Route path="data-not-found" element={<DataNotFound />} />
          <Route path="loader" element={<Loader />} />
          <Route path="spinner" element={<Spinner />} />
          <Route
            path="control-flow/:appId/:devEui"
            element={<RobotControlNew />}
          />
          <Route path="page-loader" element={<PageLoader />} />
          <Route path="mqtt-data" element={<ChirpStackMqttComponent />} />
          <Route path="task-report" element={<TaskReport />} />
          <Route path="login-log" element={<LoginLog />} />
          <Route path="operation-log" element={<OperationalLog />} />
          <Route path="motor-report" element={<MotorReport />} />
          <Route path="other-report" element={<OtherReport />} />
          <Route path="role" element={<RoleManagement />} />
          <Route path="robot-overview" element={<RobotOverview />} />
          <Route path="weather-view" element={<WeatherView />} />
          <Route path="robot-alarm" element={<RobotAlarm />} />
          <Route path="processed-alarm" element={<ProcessedAlarm />} />
          <Route path="block-list" element={<BlockManagementList />} />
          <Route path="block-view/:id" element={<BlockView />} />
          <Route path="block-map-view/:id" element={<BlockLevelMap />} />
          <Route
            path="firmware-update"
            element={<FirmwareUpdateManagement />}
          />
          <Route
            path="multi-firmware-update"
            element={<MultiFirmwareUpdateManagement />}
          />
          <Route path="fleet-dashboard" element={<FleetDashboard />} />
          <Route path="chirpstack-management" element={<Chirpstack />} />
          <Route path="battery-report" element={<BatteryReportPage />} />
          <Route path="diagnostic-report" element={<DiagnosticsReportPage />} />
          <Route path="row-management" element={<RowManagementList />} />
        </Route>
        {/* start user routes */}

        {/* <Route path="login" element={<UserLogin />} />
        <Route path="under-maintenance" element={<UnderMaintenance />} />
        <Route path="page-not-found" element={<PageNotFound />} />
        <Route path="/user" element={<UserLayout />}>
          <Route path="home" element={<Home />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
        </Route> */}

        {/* end user routes */}
      </Routess>
    </BrowserRouter>
  );
}
