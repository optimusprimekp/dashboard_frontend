import Svg from "../assets/Svg";
import Png from "../assets/Png";
import Sidebar from "../component/admin/defaulLayout/Sidebar";
import Header from "../component/admin/defaulLayout/Header";
import PaidLable from "../component/common/lables/PaidLable";
import FailedLable from "../component/common/lables/FailedLable";
import PendingLable from "../component/common/lables/PendingLable";
import PrimaryButton from "../component/common/Button/PrimaryButton";
import BorderButton from "../component/common/Button/BorderButton";
import AuthBackground from "../component/admin/defaulLayout/AuthBackground";
import AuthFooter from "../component/admin/defaulLayout/AuthFooter";
import EditProfile from "../component/admin/pages/account/editProfile/EditProfile";
import ChangePassword from "../component/admin/pages/account/changePassword/ChangePassword";
import ReactApexChart from "react-apexcharts";
import DataNotFound from "../component/common/dataNotFound/DataNotFound";
import DataService from "../config/DataService";
import {
  apiDeleteHandler,
  apiGetHandler,
  apiPostHandler,
  apiPutHandler,
} from "../config/ApiHandler";
import { Form, Formik } from "formik";
import { Api } from "../config/Api";
import { toasterError, toasterSuccess } from "../utils/toaster/toaster";
import { FormControlLabel } from "@mui/material";
import Loader from "../component/common/loader/Loader";
import Spinner from "../component/common/spinner/Spinner";
import {
  gatewaySchema,
  rowSchema,
  permissionsSchema,
  rolesSchema,
  siteSchema,
  userSchema,
  deviceSchema,
  uploadExcelValidationSchema,
  uploadFuotaValidationSchema,
  uploadGsmFuotaValidationSchema,
  alarmFormSchema,
} from "../utils/validation/FormikValidation";
import PopupModal from "../component/common/popupModal/PopupModal";
import moment from "moment";
import * as XLSX from "xlsx";

export default {
  moment,
  Svg,
  Png,
  Sidebar,
  Header,
  PaidLable,
  FailedLable,
  PendingLable,
  PrimaryButton,
  AuthFooter,
  AuthBackground,
  BorderButton,
  EditProfile,
  ChangePassword,
  DataNotFound,
  ReactApexChart,
  DataService,
  apiGetHandler,
  Formik,
  Form,
  Api,
  toasterSuccess,
  toasterError,
  FormControlLabel,
  Loader,
  Spinner,
  apiPostHandler,
  apiPutHandler,
  permissionsSchema,
  apiDeleteHandler,
  PopupModal,
  rolesSchema,
  userSchema,
  siteSchema,
  gatewaySchema,
  deviceSchema,
  rowSchema,
  XLSX,
  uploadExcelValidationSchema,
  uploadFuotaValidationSchema,
  uploadGsmFuotaValidationSchema,
  alarmFormSchema,
};
