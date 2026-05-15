import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  KmlLayer,
} from "@react-google-maps/api";
import PagesIndex from "../../../PagesIndex";
import { useParams } from "react-router-dom";

const kmlUrl =
  "https://www.google.com/maps/d/u/0/kml?mid=1daXMx_xd7ll-uZzUmRy0I1DSQ8dAfAw&ehbc=2E312F";

// TODO: put your real API key here or use env variable
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAP_KEY;

const containerStyle = {
  width: "100%",
  height: "100vh",
};

function FleetMap({ devices }) {
  const [activeDevice, setActiveDevice] = useState(null);
console.log("devices in block level map", devices);
  // Center map on first device, or fallback to Khavda approx location
  const mapCenter = useMemo(() => {
    if (devices && devices.length > 0) {
      return { lat: devices[0].latitude, lng: devices[0].longitude };
    }
    // return { lat: 23.015, lng: 72.503 }; // fallback
  }, [devices]);

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={18}
        options={{
          mapTypeId: "terrain",
          tilt: 0,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        {/* KML overlay for plant layout */}
        <KmlLayer
          url={kmlUrl}
          options={{
            preserveViewport: true, // don't change zoom when KML loads
          }}
        />

        {/* Device markers */}
        {devices.map((dev) => (
          <Marker
            key={dev.id}
            position={{ lat: dev.latitude, lng: dev.longitude }}
            onClick={() => setActiveDevice(dev)}
            label={{
              text: dev.name,
              fontSize: "12px",
              fontWeight: "600",
            }}
          />
        ))}

        {/* Info window on marker click */}
        {activeDevice && (
          <InfoWindow
            position={{ lat: activeDevice.latitude, lng: activeDevice.longitude }}
            onCloseClick={() => setActiveDevice(null)}
          >
            <div style={{ minWidth: 160 }}>
              <h4 style={{ margin: "0 0 4px" }}>{activeDevice.name}</h4>
              <div style={{ fontSize: 12 }}>
                <div>Status: {activeDevice.status}</div>
                <div>
                  State: {activeDevice.state ? activeDevice.state : "N/A"}
                </div>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default function BlockLevelMap() {
  // In your real code, you will probably fetch devices from API and store in state
  const { id } = useParams();
  const blockId = id;
  const [devices, setDevices] = useState([]);
  const deviceList = useCallback(async () => {
    try {
      const res = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_ADD_EDIT_DEVICES + `/block-map/${blockId}`
      );
      if (res.status === 200) {
        setDevices(res?.data || []);
      } else {
        PagesIndex.toasterError(res?.message);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    deviceList();
  }, [deviceList]);
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <FleetMap devices={devices} />
    </div>
  );
}
