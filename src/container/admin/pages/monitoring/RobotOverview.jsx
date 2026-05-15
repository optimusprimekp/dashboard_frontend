import { useState, useEffect } from "react";
import Index from "../../../Index";
import InputElements from "../../../../component/common/InputElements/InputElements";
import SiteInfo from "./components/SiteInfo";
import BlockInfo from "./components/BlockInfo";
import Robotinfo from "./components/Robotinfo";
import { CircularProgress, Typography } from "@mui/material";
import PagesIndex from "../../../PagesIndex";

const RobotOverview = () => {
  const [treeData, setTreeData] = useState([]);
  const [filteredTree, setFilteredTree] = useState([]);
  const [isTreeLoading, setIsTreeLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsData, setDetailsData] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        const res = await PagesIndex.apiGetHandler(
          PagesIndex.Api.GET_OVERVIEW_DATA
        );

        if (res.status === 200) {
          const transformedData = res.data.map((site) => ({
            ...site,
            type: "site",
            siteName: site?.name,
            blocks: site?.blocks?.map((block) => ({
              ...block,
              type: "block",
              blockName: block?.name,
              robots: block?.devices?.map((device) => ({
                ...device,
                type: "robot",
                robotName: device?.name,
              })),
            })),
          }));

          setTreeData(transformedData);
          setFilteredTree(transformedData);
        } else {
          PagesIndex.toasterError(
            "Failed to fetch robot overview data. Please try again later."
          );
        }
      } catch (error) {
        console.error("Failed to fetch robot overview data:", error);
        PagesIndex.toasterError(
          "An error occurred while fetching the overview."
        );
      } finally {
        setIsTreeLoading(false);
      }
    };

    fetchTreeData();
  }, []);

  useEffect(() => {
    const filterTree = (data, search) => {
      if (!search) return data;

      const searchLower = search.toLowerCase();

      return data
        .map((site) => {
          const filteredBlocks = site.blocks
            .map((block) => {
              const filteredRobots = block.robots.filter((robot) =>
                robot.robotName?.toLowerCase().includes(searchLower)
              );

              const blockMatch = block.blockName
                ?.toLowerCase()
                .includes(searchLower);

              if (blockMatch || filteredRobots.length) {
                return {
                  ...block,
                  robots: filteredRobots,
                };
              }

              return null;
            })
            .filter(Boolean);

          const siteMatch = site.siteName?.toLowerCase().includes(searchLower);

          if (siteMatch || filteredBlocks.length) {
            return {
              ...site,
              blocks: filteredBlocks,
            };
          }

          return null;
        })
        .filter(Boolean);
    };

    setFilteredTree(filterTree(treeData, searchText));
  }, [searchText, treeData]);

  const handleSelect = async (item) => {
    setSelectedItem(item);
    setDetailsData(null);

    switch (item.type) {
      case "site":
        setDetailsData(item);
        break;

      case "block":
        setIsDetailsLoading(true);
        try {
          const res = await PagesIndex.apiGetHandler(
            PagesIndex.Api.GET_ADD_EDIT_BLOCKS + `/overview/${item.id}`
          );
          if (res.status === 200) {
            setDetailsData(res.data);
          } else {
            PagesIndex.toasterError(
              `Failed to fetch details for block: ${item.blockName}`
            );
          }
        } catch (error) {
          console.error(`Failed to fetch block details:`, error);
          PagesIndex.toasterError(
            "An error occurred while fetching block details."
          );
        } finally {
          setIsDetailsLoading(false);
        }
        break;

      case "robot":
        setIsDetailsLoading(true);
        try {
          const res = await PagesIndex.apiGetHandler(
            PagesIndex.Api.GET_ADD_EDIT_DEVICES + `/overview/${item.id}`
          );
          if (res.status === 200) {
            const data = res.data;
            setDetailsData(data);
          } else {
            PagesIndex.toasterError(
              `Failed to fetch details for robot: ${item.robotName}`
            );
          }
        } catch (error) {
          console.error(`Failed to fetch robot details:`, error);
          PagesIndex.toasterError(
            "An error occurred while fetching robot details."
          );
        } finally {
          setIsDetailsLoading(false);
        }
        break;

      default:
        break;
    }
  };

  const handleDataRefreshed = (newRobotData) => {
    console.log(
      "Parent (RobotOverview) received new data. Updating state.",
      newRobotData
    );
    setDetailsData(newRobotData);
  };

  const renderDetails = () => {
    if (isDetailsLoading) {
      return (
        <Index.Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <CircularProgress />
        </Index.Box>
      );
    }

    if (!selectedItem || !detailsData) {
      return (
        <Index.Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Select an item from the tree to see details.
          </Typography>
        </Index.Box>
      );
    }

    switch (selectedItem.type) {
      case "site":
        return <SiteInfo site={detailsData} />;
      case "block":
        return <BlockInfo block={detailsData} />;
      case "robot":
        return (
          <Robotinfo
            robot={detailsData}
            onRefreshSuccess={handleDataRefreshed}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Index.Grid container sx={{ height: "100%" }} rowGap={2}>
      <Index.Grid
        item
        className="common-card"
        xs={12}
        md={2}
        sx={{
          minHeight: { xs: "50%", md: "100%" },
          maxHeight: { xs: "50%", md: "100%" },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <InputElements.SearchField
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Index.Box
          sx={{
            overflowY: "auto",
            flexGrow: 1,
            marginTop: "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: isTreeLoading ? "center" : "flex-start",
          }}
        >
          {isTreeLoading ? (
            <CircularProgress />
          ) : (
            <Index.SimpleTreeView sx={{ width: "100%" }}>
              {filteredTree.map((site) => (
                <Index.TreeItem
                  itemId={site.id}
                  label={site.siteName}
                  key={site.id}
                  onClick={() => handleSelect(site)}
                >
                  {site.blocks.map((block) => (
                    <Index.TreeItem
                      itemId={block.id}
                      label={block.blockName}
                      key={block.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(block);
                      }}
                    >
                      {block.robots.map((robot) => (
                        <Index.TreeItem
                          itemId={robot.id}
                          label={robot.robotName}
                          key={robot.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(robot);
                          }}
                        />
                      ))}
                    </Index.TreeItem>
                  ))}
                </Index.TreeItem>
              ))}
            </Index.SimpleTreeView>
          )}
        </Index.Box>
      </Index.Grid>

      <Index.Grid
        item
        xs={12}
        md={10}
        sx={{
          minHeight: { xs: "50%", md: "100%" },
          maxHeight: { xs: "50%", md: "100%" },
          paddingLeft: { xs: 0, md: "10px" },
        }}
      >
        <Index.Box
          className="common-card"
          sx={{ height: "100%", overflow: "auto" }}
        >
          {renderDetails()}
        </Index.Box>
      </Index.Grid>
    </Index.Grid>
  );
};

export default RobotOverview;
