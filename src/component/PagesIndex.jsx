import Svg from "../assets/Svg";
import Png from "../assets/Png";
import Sidebar from "./admin/defaulLayout/Sidebar";
import Header from "./admin/defaulLayout/Header";
import PaidLable from "./common/lables/PaidLable";
import FailedLable from "./common/lables/FailedLable";
import PendingLable from "./common/lables/PendingLable";
import PrimaryButton from "./common/Button/PrimaryButton";
import BorderButton from "./common/Button/BorderButton";
import AuthFooter from "./admin/defaulLayout/AuthFooter";
import AuthBackground from "./admin/defaulLayout/AuthBackground";
import { useLocation, useNavigate } from "react-router-dom";
import EditProfile from "./admin/pages/account/editProfile/EditProfile";
import ChangePassword from "./admin/pages/account/changePassword/ChangePassword";
import DataNotFound from "./common/dataNotFound/DataNotFound";
import Loader from "./common/loader/Loader";
import PageLoader from "./common/loader/PageLoader";
import Spinner from "./common/spinner/Spinner";
import { Form, Formik } from "formik";
import {
  changePasswordValidationSchema,
  resetPasswordValidationSchema,
  loginSchema,
  forgotPasswordSchema,
  editProfileSchema,
} from "../utils/validation/FormikValidation";
import { Api } from "../config/Api";
import { apiGetHandler, apiPostHandler } from "../config/ApiHandler";
import { toasterError, toasterSuccess } from "../utils/toaster/toaster";
import { ProfileContext } from "../container/admin/pages/adminLayout/AdminLayOut";

export default {
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
  useLocation,
  useNavigate,
  BorderButton,
  EditProfile,
  ChangePassword,
  DataNotFound,
  PageLoader,
  Loader,
  Spinner,
  Formik,
  Form,
  loginSchema,
  Api,
  apiGetHandler,
  apiPostHandler,
  toasterSuccess,
  toasterError,
  changePasswordValidationSchema,
  forgotPasswordSchema,
  resetPasswordValidationSchema,
  ProfileContext,
  editProfileSchema,
};
