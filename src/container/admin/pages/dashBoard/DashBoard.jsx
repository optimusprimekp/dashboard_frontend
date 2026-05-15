import { styled } from "@mui/material/styles";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { useCallback, useEffect, useState } from "react";
import { GoogleMap, MarkerF, useLoadScript } from "@react-google-maps/api";

// for custom progressbar design

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === "light" ? "#1a90ff" : "#308fe8",
  },
}));

// for tabal data

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

export default function Dashboard() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_KEY,
  });
  const responsive = [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 200,
        },
        legend: {
          position: "bottom",
        },
      },
    },
  ];
  const [seriesPie, setSeriesPie] = useState([44, 55, 13]);
  const [optionsPie, setOptionsPie] = useState({
    chart: {
      width: 500,
      height: 400,
      type: "pie",
    },
    labels: ["WORKING", "STOPPED", "MAINTENANCE"],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  });

  const [seriesBar, setSeriesBar] = useState([
    {
      name: "Inflation",
      data: [20, 50, 30],
    },
  ]);
  const [optionsBar, setOptionsBar] = useState({
    chart: {
      height: 300,
      type: "bar",
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        dataLabels: {
          position: "top", // top, center, bottom
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val + "%";
      },
      offsetY: -20,
      style: {
        fontSize: "12px",
        colors: ["#304758"],
      },
    },

    xaxis: {
      categories: ["HIGH RATED", "MED RATED", "LOW RATED"],
      position: "top",
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      crosshairs: {
        fill: {
          type: "gradient",
          gradient: {
            colorFrom: "#D8E3F0",
            colorTo: "#BED1E6",
            stops: [0, 100],
            opacityFrom: 0.4,
            opacityTo: 0.5,
          },
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    yaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        show: false,
        formatter: function (val) {
          return val + "%";
        },
      },
    },
  });
  const [siteListData, setSiteListData] = useState([]);
  const getSiteList = useCallback(async () => {
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_ADD_EDIT_SITE
      );
      if (res.status == 200) {
        setSiteListData(res?.data);
      } else {
        PagesIndex.toasterError(res?.message);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);
  useEffect(() => {
    getSiteList();
  }, [getSiteList]);
  return (
    <Index.Box className="admin-dashboard-content">
      <Index.Box className="admin-user-list-flex admin-page-title-main">
        <Index.Typography
          className="admin-page-title"
          component="h2"
          variant="h2"
        >
          Dashboard
        </Index.Typography>
      </Index.Box>
      <Index.Box className="admin-dashboad-row">
        <Index.Box className="admin-dash-card-row">
          <Index.Box className="grid-column">
            <Index.Box className="admin-dashboard-box common-card">
              <Index.Box className="admin-dashboard-inner-box">
                <Index.Box className="admin-dash-left">
                  <Index.Typography
                    className="admin-dash-text"
                    variant="p"
                    component="p"
                  >
                    Robots Deployed
                  </Index.Typography>
                  <Index.Typography
                    className="admin-dash-price"
                    variant="h1"
                    component="h1"
                  >
                    132
                  </Index.Typography>
                </Index.Box>
                <Index.Box className="admin-dash-right">
                  <Index.Box className="admin-dash-icon-box">
                    <img
                      src={PagesIndex.Svg.dashicon1}
                      className="admin-dash-icons"
                      alt="dashboard icon"
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
          <Index.Box className="grid-column">
            <Index.Box className="admin-dashboard-box common-card">
              <Index.Box className="admin-dashboard-inner-box">
                <Index.Box className="admin-dash-left">
                  <Index.Typography
                    className="admin-dash-text"
                    variant="p"
                    component="p"
                  >
                    Active Robots
                  </Index.Typography>
                  <Index.Typography
                    className="admin-dash-price"
                    variant="h1"
                    component="h1"
                  >
                    54
                  </Index.Typography>
                </Index.Box>
                <Index.Box className="admin-dash-right">
                  <Index.Box className="admin-dash-icon-box">
                    <img
                      src={PagesIndex.Svg.dashicon2}
                      className="admin-dash-icons"
                      alt="dashboard icon"
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
          <Index.Box className="grid-column">
            <Index.Box className="admin-dashboard-box common-card">
              <Index.Box className="admin-dashboard-inner-box">
                <Index.Box className="admin-dash-left">
                  <Index.Typography
                    className="admin-dash-text"
                    variant="p"
                    component="p"
                  >
                    Deactive Robots
                  </Index.Typography>
                  <Index.Typography
                    className="admin-dash-price"
                    variant="h1"
                    component="h1"
                  >
                    123
                  </Index.Typography>
                </Index.Box>
                <Index.Box className="admin-dash-right">
                  <Index.Box className="admin-dash-icon-box">
                    <img
                      src={PagesIndex.Svg.dashicon3}
                      className="admin-dash-icons"
                      alt="dashboard icon"
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
          <Index.Box className="grid-column">
            <Index.Box className="admin-dashboard-box common-card">
              <Index.Box className="admin-dashboard-inner-box">
                <Index.Box className="admin-dash-left">
                  <Index.Typography
                    className="admin-dash-text"
                    variant="p"
                    component="p"
                  >
                    Robots Under Maintenace
                  </Index.Typography>
                  <Index.Typography
                    className="admin-dash-price"
                    variant="h1"
                    component="h1"
                  >
                    985K
                  </Index.Typography>
                </Index.Box>
                <Index.Box className="admin-dash-right">
                  <Index.Box className="admin-dash-icon-box">
                    <img
                      src={PagesIndex.Svg.dashicon4}
                      className="admin-dash-icons"
                      alt="dashboard icon"
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Box>

      <Index.Box className="title-row-flex">
        <Index.Box className="admin-sub-title-main">
          <Index.Typography
            className="admin-sub-title"
            component="h2"
            variant="h2"
          >
            Analytics
          </Index.Typography>
        </Index.Box>
        <Index.Box className="admin-userlist-inner-btn-flex">
          <Index.Box className="admin-adduser-btn-main border-btn-main">
            <Index.Button className="admin-adduser-btn border-btn">
              Watch History
            </Index.Button>
          </Index.Box>
        </Index.Box>
      </Index.Box>

      <Index.Box className="chart-row-main">
        <Index.Box className="chart-col common-card">
          <Index.Box className="chart-title-main">
            <Index.Typography
              className="chart-title"
              component="h2"
              variant="h2"
            >
              Robots Analytics
            </Index.Typography>
          </Index.Box>
          <Index.Box className="pie-chart-main">
            <Index.Box className="chart-box">
              <PagesIndex.ReactApexChart
                options={optionsPie}
                series={seriesPie}
                type="pie"
                width={optionsPie.chart.width}
                height={optionsPie.chart.height}
              />
            </Index.Box>
          </Index.Box>
        </Index.Box>
        <Index.Box className="chart-col common-card">
          <Index.Box className="chart-title-main">
            <Index.Typography
              className="chart-title"
              component="h2"
              variant="h2"
            >
              Robots Efficiency
            </Index.Typography>
          </Index.Box>
          <Index.Box className="chart-box">
            <PagesIndex.ReactApexChart
              options={optionsBar}
              series={seriesBar}
              type="bar"
            />
          </Index.Box>
        </Index.Box>
      </Index.Box>
      <Index.Box className="common-card dashboard-common-card">
        <Index.Box className="dashboard-card-title-flex">
          <Index.Typography className="dashboard-common-title card-title">
            Top Cities
          </Index.Typography>
        </Index.Box>
        <Index.Box className="dashboard-chart-main">
          <div
            style={{ height: "100%", width: "100%" }}
            className="google-map-main"
          >
            {isLoaded ? (
              <GoogleMap
                center={{ lat: 20.5937, lng: 78.9629 }}
                zoom={4}
                // mapContainerStyle={{ width: "100%", height: "325px" }}
              >
                {siteListData?.map(({ id, latitude, longitude }) => {
                  return (
                    <MarkerF
                      key={id}
                      position={{
                        lat: parseFloat(latitude),
                        lng: parseFloat(longitude),
                      }}
                    ></MarkerF>
                  );
                })}
              </GoogleMap>
            ) : null}
          </div>
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
}
