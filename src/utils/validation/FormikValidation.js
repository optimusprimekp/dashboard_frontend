import * as Yup from "yup";

const emailRegex =
  /\b^(?!.*\.\@)[a-zA-Z0-9.-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,3}(?:\.[A-Za-z]{2,3})?\b$/;
const firstLastNameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const nameWithSpaceAndSpecialCaracterAnd = /^(?! )(?!.*\s{2})[A-Za-z&_]*$/;
export const valueValidationError = (fieldName, str) => {
  return `${fieldName} can not contain ${str}`;
};
const getCharacterValidationError = (str) => {
  return `Your password must have at least 1 ${str} character`;
};
export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .test(
      "consecutive-dots",
      valueValidationError("Email", "consecutive dots(.)"),
      (value) => !/\.{2,}/.test(value || "")
    )
    .matches(emailRegex, "Please enter a valid email")
    .required("Please enter email"),
  password: Yup.string().required("Please enter password"),
});
export const permissionsSchema = Yup.object().shape({
  module: Yup.string()
    .required("Please enter module name")
    .matches(
      /^(?!\s)(.*\S)?(?<!\s)$/,
      valueValidationError("Module name", "spaces at start and end")
    )
    .matches(
      /^(?:(?!\s{2,}).)+$/,
      valueValidationError(
        "Module name",
        "more than one space between two words"
      )
    )
    .matches(
      nameWithSpaceAndSpecialCaracterAnd,
      valueValidationError(
        "Module name",
        "numbers and special characters except for & and _"
      )
    ),
  action: Yup.object({
    create: Yup.boolean(),
    read: Yup.boolean(),
    update: Yup.boolean(),
    delete: Yup.boolean(),
  }),
});
export const rolesSchema = Yup.object().shape({
  role: Yup.string()
    .required("Please enter role name")
    .matches(
      /^(?!\s)(.*\S)?(?<!\s)$/,
      valueValidationError("Role name", "spaces at start and end")
    )
    .matches(
      /^(?:(?!\s{2,}).)+$/,
      valueValidationError("Role name", "more than one space between two words")
    )
    .matches(
      nameWithSpaceAndSpecialCaracterAnd,
      valueValidationError(
        "Role name",
        "numbers and special characters except for & and _"
      )
    ),
  permissions: Yup.array()
    .required("Please select permission")
    .min(1, "Please select at least one permission"),
});
export const userSchema = Yup.object().shape({
  name: Yup.string()
    .required("Please enter name")
    .matches(
      /^(?!\s)(.*\S)?(?<!\s)$/,
      valueValidationError("Name", "spaces at start and end")
    )
    .matches(
      /^(?:(?!\s{2,}).)+$/,
      valueValidationError("Name", "more than one space between two words")
    )
    .matches(
      firstLastNameRegex,
      valueValidationError("Name", "numbers and special characters")
    ),
  email: Yup.string()
    .test(
      "consecutive-dots",
      valueValidationError("Email", "consecutive dots(.)"),
      (value) => !/\.{2,}/.test(value || "")
    )
    .matches(emailRegex, "Please enter a valid email")
    .required("Please enter email"),
  role: Yup.string().required("Please select role"),
});
export const deviceSchema = Yup.object().shape({
  robot_name: Yup.string()
    .required("Please enter name")
    .matches(
      /^(?!\s)(.*\S)?(?<!\s)$/,
      valueValidationError("Name", "spaces at start and end")
    )
    .matches(
      /^(?:(?!\s{2,}).)+$/,
      valueValidationError("Name", "more than one space between two words")
    ),
  // application_id: Yup.string().required("Please enter Application id"),
  device_eui: Yup.string().required("Please enter device eui"),
  serial_no: Yup.string().required("Please enter serial no"),
  model_no: Yup.string().required("Please enter model no"),
  // latitude: Yup.string()
  //   .required("Please enter latitude")
  //   .matches(
  //     /^(?!\s)(.*\S)?(?<!\s)$/,
  //     valueValidationError("Latitude", "spaces at start and end")
  //   )
  //   .matches(/^(?:(?!\s{1,}).)+$/, valueValidationError("Latitude", "space"))
  //   .matches(
  //     /^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/,
  //     "Please enter valid latitude"
  //   ),
  // longitude: Yup.string()
  //   .required("Please enter longitude")
  //   .matches(
  //     /^(?!\s)(.*\S)?(?<!\s)$/,
  //     valueValidationError("Longitude", "spaces at start and end")
  //   )
  //   .matches(/^(?:(?!\s{1,}).)+$/, valueValidationError("Longitude", "space"))
  //   .matches(
  //     /^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/,
  //     "Please enter valid longitude"
  //   ),
  // mac_address: Yup.string(),
  // device_profile: Yup.string()
  //   .test(
  //     "consecutive-dots",
  //     valueValidationError("Email", "consecutive dots(.)"),
  //     (value) => !/\.{2,}/.test(value || "")
  //   )
  //   .required("Please enter device profile"),
  site: Yup.string().required("Please select site"),
  type: Yup.string().required("Please select type"),
});

export const changePasswordValidationSchema = Yup.object({
  oldPassword: Yup.string().required("Please enter old password"),
  newPassword: Yup.string()
    .required("Please enter new password")
    .min(8, "New password must be at least 8 characters")
    .max(16, "New password must be at most 16 characters")
    .matches(/\d/, getCharacterValidationError("digit"))
    .matches(/[a-z]/, getCharacterValidationError("lowercase"))
    .matches(/[A-Z]/, getCharacterValidationError("uppercase"))
    .matches(/[^\w\s]/, getCharacterValidationError("special")),
  confirmPassword: Yup.string()
    .oneOf(
      [Yup.ref("newPassword"), null],
      "Confirm passwords should be same as new password"
    )
    .required("Please enter confirm password"),
});
export const siteSchema = Yup.object({
  name: Yup.string()
    .required("Please enter name")
    .matches(
      /^(?!\s)(.*\S)?(?<!\s)$/,
      valueValidationError("Name", "spaces at start and end")
    )
    .matches(
      /^(?:(?!\s{2,}).)+$/,
      valueValidationError("Name", "more than one space between two words")
    )
    .matches(
      firstLastNameRegex,
      valueValidationError("Name", "numbers and special characters")
    ),
  mwp: Yup.string()
    .required("Please enter mwp")
    .matches(
      /^(?!\s)(.*\S)?(?<!\s)$/,
      valueValidationError("MWP", "spaces at start and end")
    ),
  client_name: Yup.string()
    .required("Please enter client name")
    .matches(
      /^(?!\s)(.*\S)?(?<!\s)$/,
      valueValidationError("Client name", "spaces at start and end")
    )
    .matches(
      /^(?:(?!\s{2,}).)+$/,
      valueValidationError(
        "Client name",
        "more than one space between two words"
      )
    ),
  location: Yup.string()
    .required("Please enter location")
    .matches(
      /^(?!\s)(.*\S)?(?<!\s)$/,
      valueValidationError("Location", "spaces at start and end")
    )
    .matches(
      /^(?:(?!\s{2,}).)+$/,
      valueValidationError("Location", "more than one space between two words")
    )
    .matches(
      firstLastNameRegex,
      valueValidationError("Location", "numbers and special characters")
    ),
  latitude: Yup.string()
    .required("Please enter latitude")
    .matches(
      /^(?!\s)(.*\S)?(?<!\s)$/,
      valueValidationError("Latitude", "spaces at start and end")
    )
    .matches(/^(?:(?!\s{1,}).)+$/, valueValidationError("Latitude", "space"))
    .matches(
      /^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/,
      "Please enter valid latitude"
    ),
  longitude: Yup.string()
    .required("Please enter longitude")
    .matches(
      /^(?!\s)(.*\S)?(?<!\s)$/,
      valueValidationError("Longitude", "spaces at start and end")
    )
    .matches(/^(?:(?!\s{1,}).)+$/, valueValidationError("Longitude", "space"))
    .matches(
      /^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/,
      "Please enter valid longitude"
    ),
  total_inverter: Yup.string()
    .required("Please enter total invertors")
    .matches(
      /^(?!\s)(.*\S)?(?<!\s)$/,
      valueValidationError("Total invertors", "spaces at start and end")
    ),
  total_blocks: Yup.string()
    .required("Please enter total blocks")
    .matches(
      /^(?!\s)(.*\S)?(?<!\s)$/,
      valueValidationError("Total blocks", "spaces at start and end")
    ),

  // O&M Contact
  om_name: Yup.string()
    .required("Please enter name")
    .matches(
      /^(?!\s)(.*\S)?(?<!\s)$/,
      valueValidationError("O&M Name", "spaces at start and end")
    ),
  om_contact: Yup.string()
    .required("Please enter mobile no.")
    .matches(/^[0-9]{10}$/, "Please enter a valid 10 digit mobile number"),
  om_email: Yup.string()
    .test(
      "consecutive-dots",
      valueValidationError("Email", "consecutive dots(.)"),
      (value) => !/\.{2,}/.test(value || "")
    )
    .matches(emailRegex, "Please enter a valid email")
    .required("Please enter email"),
  om_employee_id: Yup.string()
    .required("Please enter employee ID")
    .matches(
      /^(?!\s)(.*\S)?(?<!\s)$/,
      valueValidationError("O&M Employee ID", "spaces at start and end")
    ),

  // Maintenance Contact
  maintenance_name: Yup.string()
    .required("Please enter name")
    .matches(
      /^(?!\s)(.*\S)?(?<!\s)$/,
      valueValidationError("Maintenance Name", "spaces at start and end")
    ),
  maintenance_contact: Yup.string()
    .required("Please enter mobile no.")
    .matches(/^[0-9]{10}$/, "Please enter a valid 10 digit mobile number"),
  maintenance_email: Yup.string()
    .test(
      "consecutive-dots",
      valueValidationError("Email", "consecutive dots(.)"),
      (value) => !/\.{2,}/.test(value || "")
    )
    .matches(emailRegex, "Please enter a valid email")
    .required("Please enter email"),
  maintenance_employee_id: Yup.string()
    .required("Please enter employee ID")
    .matches(
      /^(?!\s)(.*\S)?(?<!\s)$/,
      valueValidationError("Maintenance Employee ID", "spaces at start and end")
    ),
});
export const gatewaySchema = Yup.object({
  gateway_eui: Yup.string()
    .required("Please enter Gateway EUI")
    .length(16, "Gateway EUI must be 16 characters"),
  confirm_gateway_eui: Yup.string()
    .oneOf([Yup.ref("gateway_eui"), null], "Gateway EUI does not match")
    .required("Please confirm Gateway EUI"),
  gateway_name: Yup.string().required("Please enter Gateway Name"),
  gateway_details: Yup.string().required("Please enter Gateway Details"),
  site: Yup.string().required("Please select Site"),
  rf_region: Yup.string().required("Please enter RF Region"),
  model: Yup.string().required("Please enter Model"),
  tenant_id: Yup.string().required("Please select Tenant"),
  location: Yup.string(),
  latitude: Yup.number().nullable().typeError("Latitude must be a number"),
  longitude: Yup.number().nullable().typeError("Longitude must be a number"),
  commissioning_date: Yup.date().nullable().typeError("Invalid date"),
});
export const rowSchema = Yup.object({
  row_name: Yup.string().required("Please enter row Name"),
  home_lat: Yup.number().nullable().typeError("Latitude must be a number"),
  home_lng: Yup.number().nullable().typeError("Longitude must be a number"),
  reverse_station_lat: Yup.number()
    .nullable()
    .typeError("Latitude must be a number"),
  reverse_station_lng: Yup.number()
    .nullable()
    .typeError("Longitude must be a number"),
});

export const uploadExcelValidationSchema = Yup.object({
  file: Yup.mixed()
    .required("Please upload file")
    .test(
      "fileType",
      "Invalid file. Only .xlsx files are allowed.",
      (value) => {
        if (!value) return true;
        const allowedFormats = [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ];
        return allowedFormats.includes(value.type);
      }
    ),
});
export const uploadFuotaValidationSchema = Yup.object({
  block: Yup.string().required("Please select block"),
  file: Yup.mixed()
    .required("Please upload file")
    .test("fileType", "Invalid file. Only .bin files are allowed.", (value) => {
      if (!value) return true;
      const allowedFormats = ["application/octet-stream"];
      const allowedExtensions = [".bin"];
      const fileExtension = value.name.split(".").pop()?.toLowerCase();
      return (
        allowedFormats.includes(value.type) &&
        allowedExtensions.includes(`.${fileExtension}`)
      );
    }),
  percentage: Yup.number()
    .required("Value is required")
    .positive("Must be greater than 0")
    .max(99, "Must be less than 100")
    .typeError("Must be a number"),
});
export const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .test(
      "consecutive-dots",
      valueValidationError("Email", "consecutive dots(.)"),
      (value) => !/\.{2,}/.test(value || "")
    )
    .matches(emailRegex, "Please enter a valid email")
    .required("Please enter email"),
});
export const resetPasswordValidationSchema = Yup.object({
  newPassword: Yup.string()
    .required("Please enter new password")
    .min(8, "New password must be at least 8 characters")
    .max(16, "New password must be at most 16 characters")
    .matches(/\d/, getCharacterValidationError("digit"))
    .matches(/[a-z]/, getCharacterValidationError("lowercase"))
    .matches(/[A-Z]/, getCharacterValidationError("uppercase"))
    .matches(/[^\w\s]/, getCharacterValidationError("special")),
  confirmNewPassword: Yup.string()
    .required("Please enter confirm password")
    .oneOf([Yup.ref("newPassword"), null], "Password does not match"),
});
export const editProfileSchema = Yup.object().shape({
  image: Yup.mixed().test(
    "fileType",
    "Invalid file. Only .png, .jpeg and .jpg files are allowed.",
    (value) => {
      if (!value) return true;

      // If value is a string (URL), skip validation
      if (typeof value === "string") {
        return true;
      }

      const allowedFormats = ["image/png", "image/jpeg", "image/jpg"];
      const allowedExtensions = [".png", "jpeg", ".jpg"];
      const fileExtension = value.name.split(".").pop()?.toLowerCase();

      return (
        allowedFormats.includes(value.type) &&
        allowedExtensions.includes(`.${fileExtension}`)
      );
    }
  ),
  name: Yup.string()
    .required("Please enter name")
    .matches(
      /^(?!\s)(.*\S)?(?<!\s)$/,
      valueValidationError("Name", "spaces at start and end")
    )
    .matches(
      /^(?:(?!\s{2,}).)+$/,
      valueValidationError("Name", "more than one space between two words")
    )
    .matches(
      firstLastNameRegex,
      valueValidationError("Name", "numbers and special characters")
    ),
  email: Yup.string()
    .test(
      "consecutive-dots",
      valueValidationError("Email", "consecutive dots(.)"),
      (value) => !/\.{2,}/.test(value || "")
    )
    .matches(emailRegex, "Please enter a valid email")
    .required("Please enter email"),
});
export const uploadGsmFuotaValidationSchema = Yup.object({
  macAddress: Yup.string().required("Please enter mac address"),
  // .matches(
  //   /^([A-Fa-f0-9]{2}[:-]){5}([A-Fa-f0-9]{2})$/,
  //   "Please enter valid mac address"
  // ),
  url: Yup.string()
    .required("Please enter url")
    .matches(
      /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
      "Please enter valid url"
    ),
});

export const blockSchema = Yup.object({
  name: Yup.string()
    .required("Please enter name")
    .matches(
      /^(?!\s)(.*\S)?(?<!\s)$/,
      valueValidationError("Name", "spaces at start and end")
    )
    .matches(
      /^(?:(?!\s{2,}).)+$/,
      valueValidationError("Name", "more than one space between two words")
    ),
  site: Yup.string().required("Please select site"),
});

export const alarmFormSchema = Yup.object({
  alarmCode: Yup.string(),
  alarmName: Yup.string(),
  startDate: Yup.date().nullable().typeError("Please select from date"),
  endDate: Yup.date().when("startDate", {
    is: (startDate) => startDate,
    then: () =>
      Yup.date()
        .required("Please select to date")
        .typeError("Please select to date"),
    otherwise: () => Yup.date().nullable(),
  }),
});
