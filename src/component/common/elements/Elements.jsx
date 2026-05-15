import React from "react";

// In this page We create some elements

// Input Field
// Password Field
// Dropdown
// Text Area Field ( Address Field / Description Field )
// radio group
// Create custom switch design */
// Create custom file upload design */
// Create grid ( colum and row ) */
// mui grid colum
// Select2
// accordian
// table
// checkbox

// for custom checkbox design

const BpIcon = styled("span")(({ theme }) => ({
  borderRadius: 0,
  border: "1px solid #114A65",
  width: 16,
  height: 16,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  boxShadow: "none",
  backgroundColor: theme.palette.mode === "dark" ? "#394b59" : "transparent",
}));

const BpCheckedIcon = styled(BpIcon)({
  backgroundColor: "transparent",
  "&:before": {
    display: "block",
    width: 12,
    height: 12,
    backgroundImage:
      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
      " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
      "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23114A65'/%3E%3C/svg%3E\")",
    content: '""',
  },
  "input:hover ~ &": {
    backgroundColor: "transparent",
  },
});

// Inspired by blueprintjs
function BpCheckbox(props) {
  return (
    <Index.Checkbox
      sx={{
        "&:hover": { bgcolor: "transparent" },
      }}
      disableRipple
      color="default"
      checkedIcon={<BpCheckedIcon />}
      icon={<BpIcon />}
      inputProps={{ "aria-label": "Checkbox demo" }}
      {...props}
    />
  );
}

export default function Elements() {
  // add user modal
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // for password eye hide and show

  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // for custom switch design

  const IOSSwitch = Index.styled((props) => (
    <Index.Switch
      focusVisibleClassName=".Mui-focusVisible"
      disableRipple
      {...props}
    />
  ))(({ theme }) => ({
    width: 34,
    height: 20,
    padding: 0,
    "& .MuiSwitch-switchBase": {
      padding: 0,
      margin: 3,
      transitionDuration: "300ms",
      "&.Mui-checked": {
        transform: "translateX(16px)",
        color: "#fff",
        "& + .MuiSwitch-track": {
          backgroundColor:
            theme.palette.mode === "dark" ? "#2ECA45" : "#114A65",
          opacity: 1,
          border: 0,
        },
        "&.Mui-disabled + .MuiSwitch-track": {
          opacity: 0.5,
        },
      },
      "&.Mui-focusVisible .MuiSwitch-thumb": {
        color: "#33cf4d",
        border: "6px solid #fff",
      },
      "&.Mui-disabled .MuiSwitch-thumb": {
        color:
          theme.palette.mode === "light"
            ? theme.palette.grey[100]
            : theme.palette.grey[600],
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
      },
    },
    "& .MuiSwitch-thumb": {
      boxSizing: "border-box",
      width: 14,
      height: 14,
      boxShadow: "none",
    },
    "& .MuiSwitch-track": {
      borderRadius: 26 / 2,
      backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
      opacity: 1,
      transition: theme.transitions.create(["background-color"], {
        duration: 500,
      }),
    },
  }));

  // for open handleChangedropdown

  const [age, setAge] = React.useState("");

  const handleChangedropdown = (event) => {
    setAge(event.target.value);
  };

  return (
    <>
      {/* input field */}
      <Index.Box className="admin-input-box add-user-input">
        <Index.FormHelperText className="admin-form-lable">
          User Name
        </Index.FormHelperText>
        <Index.Box className="admin-form-group">
          <Index.TextField
            fullWidth
            id="fullWidth"
            className="admin-form-control"
            placeholder=""
          />
        </Index.Box>
      </Index.Box>

      {/* password input field */}
      <Index.Box className="admin-input-box password-input-box">
        <Index.FormHelperText className="admin-form-lable">
          Password
        </Index.FormHelperText>
        <Index.Box className="admin-form-group">
          <Index.OutlinedInput
            className="admin-form-control-eye"
            autoComplete="off"
            id="outlined-adornment-password"
            type={showPassword ? "text" : "password"}
            endAdornment={
              <Index.InputAdornment position="end">
                <Index.IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? (
                    <Index.VisibilityOff />
                  ) : (
                    <Index.Visibility />
                  )}
                </Index.IconButton>
              </Index.InputAdornment>
            }
          />
        </Index.Box>
      </Index.Box>

      {/* dropdown field */}

      <Index.Box className="admin-input-box add-user-input">
        <Index.FormHelperText className="admin-form-lable">
          SKU
        </Index.FormHelperText>
        <Index.Box className="admin-form-group">
          <Index.Box className="admin-dropdown-box">
            <Index.FormControl className="admin-form-control">
              <Index.Select
                className="admin-dropdown-select "
                value={age}
                onChange={handleChangedropdown}
                displayEmpty
                inputProps={{ "aria-label": "Without label" }}
              >
                <Index.MenuItem value="" className="admin-menuitem">
                  USD
                </Index.MenuItem>
                <Index.MenuItem value={10} className="admin-menuitem">
                  USD
                </Index.MenuItem>
                <Index.MenuItem value={20} className="admin-menuitem">
                  USD
                </Index.MenuItem>
                <Index.MenuItem value={30} className="admin-menuitem">
                  USD
                </Index.MenuItem>
              </Index.Select>
            </Index.FormControl>
          </Index.Box>
        </Index.Box>
      </Index.Box>

      {/* radio group */}

      <Index.Box className="admin-input-box add-user-input admin-radio-main">
        <Index.FormHelperText className="admin-form-lable">
          Price Limit
        </Index.FormHelperText>
        <Index.RadioGroup
          row
          aria-labelledby="demo-row-radio-buttons-group-label"
          name="row-radio-buttons-group"
          className="admin-radiogroup"
        >
          <Index.FormControlLabel
            value="female"
            control={<Index.Radio className="admin-radio" />}
            label="$100k"
          />
          <Index.FormControlLabel
            value="male"
            control={<Index.Radio className="admin-radio" />}
            label="$200k"
          />
          <Index.FormControlLabel
            value="other"
            control={<Index.Radio className="admin-radio" />}
            label="$300k"
          />
        </Index.RadioGroup>
      </Index.Box>

      {/* text area */}

      <Index.Box className="admin-input-box add-user-input">
        <Index.FormHelperText className="admin-form-lable">
          Description
        </Index.FormHelperText>
        <Index.Box className="admin-form-group">
          <Index.TextareaAutosize
            aria-label="minimum height"
            // minRows={3}
            placeholder=""
            className="admin-form-control-textarea"
          />
        </Index.Box>
      </Index.Box>

      {/* checkbox */}

      <Index.Box className="admin-checkbox-main">
        <BpCheckbox />
        <Index.Typography className="admin-checkbox-lable">
          Remember Me
        </Index.Typography>
      </Index.Box>

      {/* Create custom switch design */}

      <Index.Box className="admin-switch-main">
        <Index.FormControlLabel
          control={<IOSSwitch sx={{ m: 1 }} defaultChecked />}
          label="Public Profile"
          className="admin-switch-lable"
        />
      </Index.Box>

      {/* Create custom file upload design */}

      <Index.Box className="admin-file-upload-btn-main">
        <img
          src={Index.Png.usericon}
          className="admin-upload-profile-img"
          alt="upload img"
        ></img>
        <Index.Button
          variant="contained"
          component="label"
          className="admin-file-upload-btn"
        >
          <img
            src={Index.Svg.edit}
            className="admin-upload-icon-img"
            alt="upload img"
          ></img>
          <input hidden accept="image/*" multiple type="file" />
        </Index.Button>
      </Index.Box>

      {/* Create custom grid ( colum and row ) */}
      <Index.Box className="admin-row">
        <Index.Box className="grid-column">
          <Index.Box className="cust-col"></Index.Box>
        </Index.Box>
        <Index.Box className="grid-column">
          <Index.Box className="cust-col"></Index.Box>
        </Index.Box>
        <Index.Box className="grid-column">
          <Index.Box className="cust-col"></Index.Box>
        </Index.Box>
      </Index.Box>

      {/* Select 2  */}
      {/* import Select2 from 'react-select2-wrapper'; */}

      <Index.Box className="admin-select2-main">
        <Index.Select2
          multiple
          style={{ width: "100%" }}
          data={["bug", "feature", "documents", "discussion"]}
          options={{
            placeholder: "search by tags",
          }}
        />
      </Index.Box>

      {/* start mui grid colum */}
      <Index.Box className="grid-row">
        <Index.Box sx={{ width: 1 }} className="grid-main">
          <Index.Box
            display="grid"
            gridTemplateColumns="repeat(12, 1fr)"
            gap={{ xs: 2, sm: 2, md: 0, lg: 0 }}
          >
            <Index.Box
              gridColumn={{
                xs: "span 12",
                sm: "span 6",
                md: "span 4",
                lg: "span 6",
              }}
              className="grid-column"
            >
              <Index.Box className="auth-input-main"></Index.Box>
            </Index.Box>
            <Index.Box
              gridColumn={{
                xs: "span 12",
                sm: "span 6",
                md: "span 8",
                lg: "span 6",
              }}
              className="grid-column"
            >
              <Index.Box className="auth-input-main"></Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Box>

      {/* start accordian */}

      <Index.Box className="faq-accordian-main">
        <Index.Box className="accordian-main common-card">
          <Index.Accordion className="accordian">
            <Index.AccordionSummary
              className="accordian-summary"
              expandIcon={
                <Index.ExpandMoreIcon className="accordian-expan-icon" />
              }
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Index.Box className="accordian-title-flex">
                <Index.Box className="accordian-title-left-main">
                  Accordion 1
                </Index.Box>
                <Index.Box className="accordian-title-right-main">
                  <Index.Box className="admin-table-data-btn-flex">
                    <Index.Tooltip
                      title="Edit"
                      arrow
                      placement="bottom"
                      className="admin-tooltip"
                    >
                      <Index.Button className="admin-table-data-btn">
                        <img
                          src={PagesIndex.Svg.blueedit}
                          className="admin-icon"
                          alt="Edit"
                        ></img>
                      </Index.Button>
                    </Index.Tooltip>
                    <Index.Tooltip
                      title="Delete"
                      arrow
                      placement="bottom"
                      className="admin-tooltip"
                    >
                      <Index.Button className="admin-table-data-btn">
                        <img
                          src={PagesIndex.Svg.trash}
                          className="admin-icon"
                          alt="Delete"
                        ></img>
                      </Index.Button>
                    </Index.Tooltip>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.AccordionSummary>
            <Index.AccordionDetails className="accordian-details">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Suspendisse malesuada lacus ex, sit amet blandit leo lobortis
              eget.
            </Index.AccordionDetails>
          </Index.Accordion>

          <Index.Accordion className="accordian">
            <Index.AccordionSummary
              className="accordian-summary"
              expandIcon={
                <Index.ExpandMoreIcon className="accordian-expan-icon" />
              }
              aria-controls="panel1-content"
              id="panel2-header"
            >
              <Index.Typography>Accordion 1</Index.Typography>
            </Index.AccordionSummary>
            <Index.AccordionDetails className="accordian-details">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Suspendisse malesuada lacus ex, sit amet blandit leo lobortis
              eget.
            </Index.AccordionDetails>
          </Index.Accordion>
        </Index.Box>
      </Index.Box>

      {/* start table */}

      <Index.Box className="card-border common-card">
        <Index.Box className="admin-userlist-table-main page-table-main">
          <Index.TableContainer
            component={Index.Paper}
            className="table-container"
          >
            <Index.Table aria-label="simple table" className="table">
              <Index.TableHead className="table-head">
                <Index.TableRow className="table-row">
                  <Index.TableCell
                    component="th"
                    variant="th"
                    className="table-th"
                    width="10%"
                  >
                    NAME
                  </Index.TableCell>
                  <Index.TableCell
                    component="th"
                    variant="th"
                    className="table-th"
                    width="10%"
                  >
                    ADDRESS
                  </Index.TableCell>
                  <Index.TableCell
                    component="th"
                    variant="th"
                    className="table-th"
                    width="10%"
                  >
                    CITY
                  </Index.TableCell>
                  <Index.TableCell
                    component="th"
                    variant="th"
                    className="table-th"
                    width="10%"
                  >
                    NUMBER
                  </Index.TableCell>
                  <Index.TableCell
                    component="th"
                    variant="th"
                    className="table-th"
                    width="10%"
                  >
                    STATUS
                  </Index.TableCell>
                  <Index.TableCell
                    component="th"
                    variant="th"
                    className="table-th"
                    width="10%"
                  >
                    ACTION
                  </Index.TableCell>
                </Index.TableRow>
              </Index.TableHead>
              <Index.TableBody className="table-body">
                <Index.TableRow
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <Index.TableCell
                    component="td"
                    variant="td"
                    scope="row"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <img
                        src={PagesIndex.Png.userlist1}
                        className="admin-table-data-img "
                        alt="User"
                      ></img>{" "}
                      <Index.Typography className="admin-table-data-text">
                        GASTON
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-flex">
                      <Index.Typography className="admin-table-data-text">
                        {" "}
                        12974 Keebler Prairie, South Brendon, Id, Cl
                      </Index.Typography>
                    </Index.Box>
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    className="table-td"
                  >
                    {" "}
                    Id, Cl New Kaelachester
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    className="table-td"
                  >
                    623-880-0509 X6880
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    className="table-td"
                  >
                    Status
                  </Index.TableCell>
                  <Index.TableCell
                    component="td"
                    variant="td"
                    className="table-td"
                  >
                    <Index.Box className="admin-table-data-btn-flex">
                      <Index.Tooltip
                        title="Edit"
                        arrow
                        placement="bottom"
                        className="admin-tooltip"
                      >
                        <Index.Button className="admin-table-data-btn">
                          <img
                            src={PagesIndex.Svg.blueedit}
                            className="admin-icon"
                            alt="Edit"
                          />
                        </Index.Button>
                      </Index.Tooltip>

                      <Index.Tooltip
                        title="View"
                        arrow
                        placement="bottom"
                        className="admin-tooltip"
                      >
                        <Index.Button className="admin-table-data-btn">
                          <img
                            src={PagesIndex.Svg.yelloweye}
                            className="admin-icon"
                            alt="View"
                          />
                        </Index.Button>
                      </Index.Tooltip>

                      <Index.Tooltip
                        title="Delete"
                        arrow
                        placement="bottom"
                        className="admin-tooltip"
                      >
                        <Index.Button className="admin-table-data-btn">
                          <img
                            src={PagesIndex.Svg.trash}
                            className="admin-icon"
                            alt="Trash"
                          />
                        </Index.Button>
                      </Index.Tooltip>
                    </Index.Box>
                  </Index.TableCell>
                </Index.TableRow>
              </Index.TableBody>
            </Index.Table>
          </Index.TableContainer>
        </Index.Box>
        <Index.Box className="admin-pagination-main">
          <Index.Pagination
            count={3}
            variant="outlined"
            shape="rounded"
            className="admin-pagination"
          />
        </Index.Box>
      </Index.Box>

      {/* modal */}

      <Index.Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className="admin-modal"
      >
        <Index.Box
          sx={style}
          className="admin-add-user-modal-inner-main admin-modal-inner"
        >
          <Index.Box className="admin-modal-header">
            <Index.Typography
              id="modal-modal-title"
              className="admin-modal-title"
              variant="h6"
              component="h2"
            >
              Add User Modal
            </Index.Typography>
            <Index.Button className="modal-close-btn" onClick={handleClose}>
              <span>
                <img
                  src={PagesIndex.Svg.closeblack}
                  className="admin-modal-close-icon"
                  alt="Close"
                />
              </span>
            </Index.Button>
          </Index.Box>
          <Index.Box className="admin-modal-hgt-scroll cus-scrollbar">
            <Index.Box className="admin-input-box admin-modal-input-box">
              <Index.FormHelperText className="admin-form-lable">
                First Name
              </Index.FormHelperText>
              <Index.Box className="admin-form-group">
                <Index.TextField
                  fullWidth
                  id="fullWidth"
                  className="admin-form-control"
                  placeholder=""
                />
              </Index.Box>
            </Index.Box>
            <Index.Box className="admin-input-box admin-modal-input-box">
              <Index.FormHelperText className="admin-form-lable">
                Language
              </Index.FormHelperText>
              <Index.Box className="admin-dropdown-box">
                <Index.FormControl className="admin-form-control admin-drop-form-control">
                  <Index.Select
                    className="admin-dropdown-select admin-drop-select"
                    value={age}
                    onChange={handleChangedropdown}
                    displayEmpty
                    inputProps={{ "aria-label": "Without label" }}
                  >
                    <Index.MenuItem value="" className="admin-drop-menuitem">
                      English
                    </Index.MenuItem>
                    <Index.MenuItem value={10} className="admin-drop-menuitem">
                      English
                    </Index.MenuItem>
                    <Index.MenuItem value={20} className="admin-drop-menuitem">
                      English
                    </Index.MenuItem>
                    <Index.MenuItem value={30} className="admin-drop-menuitem">
                      English
                    </Index.MenuItem>
                  </Index.Select>
                  {/* <span><img src={Index.Svg.instagram} className="grey-down pay-down" alt='down arrow'></img></span> */}
                </Index.FormControl>
              </Index.Box>
            </Index.Box>
            <Index.Box className="admin-input-box admin-modal-input-box">
              <Index.FormHelperText className="admin-form-lable">
                Last Name
              </Index.FormHelperText>
              <Index.Box className="admin-form-group">
                <Index.TextField
                  fullWidth
                  id="fullWidth"
                  className="admin-form-control"
                  placeholder=""
                />
              </Index.Box>
            </Index.Box>
            <Index.Box className="admin-input-box admin-modal-input-box">
              <Index.FormHelperText className="admin-form-lable">
                Email
                <span className="admin-span-text admin-common-para">
                  (Optional)
                </span>
              </Index.FormHelperText>
              <Index.Box className="admin-form-group">
                <Index.TextField
                  fullWidth
                  id="fullWidth"
                  className="admin-form-control"
                  placeholder=""
                />
              </Index.Box>
            </Index.Box>
            <Index.Box className="admin-input-box admin-modal-input-box">
              <Index.FormHelperText className="admin-form-lable">
                Date
              </Index.FormHelperText>
              <Index.Box className="admin-form-group">
                <Index.TextField
                  type="date"
                  fullWidth
                  id="fullWidth"
                  className="admin-form-control"
                  placeholder=""
                />
              </Index.Box>
            </Index.Box>
          </Index.Box>
          <Index.Box className="admin-modal-footer">
            <Index.Box className="admin-modal-user-btn-flex">
              <Index.Box className="admin-discard-btn-main border-btn-main">
                <Index.Button className="admin-discard-user-btn border-btn">
                  Discard
                </Index.Button>
              </Index.Box>
              <Index.Box className="admin-save-btn-main btn-main-primary">
                <Index.Button className="admin-save-user-btn btn-primary">
                  <img
                    src={PagesIndex.Svg.save}
                    className="admin-user-save-icon"
                    alt="Save"
                  ></img>
                  Save
                </Index.Button>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Modal>
    </>
  );
}
