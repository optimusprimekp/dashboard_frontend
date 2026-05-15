import React, { createContext, useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { getStoredToken } from "../../../../utils/authUtils";

export const ProfileContext = createContext();

export default function AdminLayOut() {
  const [open, setOpen] = useState(true);
  const [profile, setProfile] = useState(null);

  const getProfile = useCallback(async () => {
    try {
      const res = await PagesIndex.apiGetHandler(PagesIndex.Api.GET_PROFILE);
      if (res?.status === true || res?.status === 200 || res?.status === 201) {
        setProfile(res?.data ?? null);
      } else {
        PagesIndex.toasterError(res?.message ?? "Failed to load profile");
      }
    } catch (error) {
      console.error("AdminLayOut getProfile:", error);
      PagesIndex.toasterError("Failed to load profile");
    }
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      getProfile();
    }
  }, [getProfile]);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, getProfile }}>
      <Index.Box className="admin-dashboard-main">
        <Index.Box
          className={`admin-dashboard-left-main ${
            open ? "active" : "admin-sidebar-deactive"
          }`}
        >
          <PagesIndex.Sidebar open={open} setOpen={setOpen} />
        </Index.Box>
        <Index.Box className="admin-dashboard-right-main">
          <PagesIndex.Header setOpen={setOpen} open={open} />
          <Index.Box className="admin-dashboard-containt-main">
            <Outlet />
          </Index.Box>
        </Index.Box>
      </Index.Box>
    </ProfileContext.Provider>
  );
}
