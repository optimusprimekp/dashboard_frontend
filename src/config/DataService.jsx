import axios from "axios";

// Create Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

// Request: Add access token to headers (safe parse to avoid crash on invalid token)
api.interceptors.request.use(
  (config) => {
    try {
      const raw = sessionStorage.getItem("token");
      if (raw) {
        const parsed = JSON.parse(raw);
        const accessToken = typeof parsed === "string" ? parsed : parsed?.accessToken ?? parsed?.token;
        if (accessToken) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
      }
    } catch {
      // Invalid token; leave header unset
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to avoid multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

// Response: Refresh on 401
// Backend expects refreshToken in cookies (req.cookies?.refreshToken) and returns { data: { accessToken } }.
// withCredentials: true sends cookies so the backend can read refreshToken.
const REFRESH_TOKEN_URL = `${import.meta.env.VITE_BASE_URL}/user/refresh-token`;

function getAccessTokenFromRefreshResponse(res) {
  const data = res?.data;
  return data?.data?.accessToken ?? data?.accessToken ?? null;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.get(REFRESH_TOKEN_URL, {
          withCredentials: true, // sends refreshToken cookie (backend reads req.cookies?.refreshToken)
        });
        const newAccessToken = getAccessTokenFromRefreshResponse(res);
        if (newAccessToken) {
          sessionStorage.setItem("token", JSON.stringify(newAccessToken));
          api.defaults.headers.common["Authorization"] =
            "Bearer " + newAccessToken;
          processQueue(null, newAccessToken);
          return api(originalRequest);
        }
        processQueue(new Error("No access token in refresh response"), null);
        sessionStorage.removeItem("token");
        window.location.href = "/";
        return Promise.reject(error);
      } catch (refreshError) {
        processQueue(refreshError, null);
        sessionStorage.removeItem("token");
        window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
