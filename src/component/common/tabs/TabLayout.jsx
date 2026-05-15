import { useState } from "react";
import Index from "../../Index";
const TabLayout = ({ tabs, children }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const changeTab = (_, index) => {
    setSelectedTab(index);
  };
  return (
    <Index.Box
      sx={{
        boxShadow: "0 2px 4px 0 rgba(0,0,0,0.1)",
        borderRadius: "10px",
        border: "0.5px solid rgba(0,0,0,0.3)",
      }}
    >
      <Index.Tabs
        value={selectedTab}
        onChange={changeTab}
        sx={{
          borderTopLeftRadius: "10px",
          borderTopRightRadius: "10px",
          bgcolor: "#e0e0e0",
          "& .MuiTab-root": {
            color: "#000",
            fontWeight: 500,
            textTransform: "none",
          },
          "& .Mui-selected": {
            bgcolor: "#fff",
            borderBottom: "none",
          },
          "& .MuiTabs-indicator": {
            display: "none", // Remove default Material-UI indicator
          },
        }}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {tabs.map((tab, i) => (
          <Index.Tab key={i} label={tab} disableRipple />
        ))}
      </Index.Tabs>
      <Index.Box
        sx={{
          p: 2,
          bgcolor: "#fff",
          borderBottomLeftRadius: "10px",
          borderBottomRightRadius: "10px",
          // border: "1px solid #ccc",
          // borderTop: "none",
        }}
      >
        <Index.Box className="common-card">{children[selectedTab]}</Index.Box>
        {/* {selectedTab === 0 && (
          <Index.Typography>Display parameters content</Index.Typography>
        )}
        {selectedTab === 1 && (
          <Index.Typography>Control instruction content</Index.Typography>
        )} */}
      </Index.Box>
    </Index.Box>
  );
};

export default TabLayout;
