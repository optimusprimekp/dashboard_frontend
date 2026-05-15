import React from "react";
import PropTypes from "prop-types";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";

// for tabs design

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Index.Box sx={{ p: 3 }}>
          <Index.Typography>{children}</Index.Typography>
        </Index.Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function AccountLayout() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Index.Box className="admin-dashboard-content admin-edit-profile-containt">
      <Index.Box className="admin-user-list-flex admin-page-title-main">
        <Index.Typography
          className="admin-page-title"
          component="h2"
          variant="h2"
        >
          Account Settings
        </Index.Typography>
      </Index.Box>
      <Index.Box className="admin-tabs-main-box">
        <Index.Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Index.Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
            className="admin-tabs-main"
          >
            <Index.Tab
              label="Edit Profile"
              {...a11yProps(0)}
              className="admin-tab"
            />
            <Index.Tab
              label="Change Password"
              {...a11yProps(1)}
              className="admin-tab"
            />
          </Index.Tabs>
        </Index.Box>
        <TabPanel value={value} index={0} className="admin-tabpanel">
          <Index.Box className="admin-tabpanel-main">
            <PagesIndex.EditProfile />
          </Index.Box>
        </TabPanel>
        <TabPanel value={value} index={1} className="admin-tabpanel">
          <Index.Box className="admin-tabpanel-main">
            <PagesIndex.ChangePassword />
          </Index.Box>
        </TabPanel>
      </Index.Box>
    </Index.Box>
  );
}
