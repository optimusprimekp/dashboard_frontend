import DataService from "./DataService";

function normalizeGetResponse(res) {
  const body = res?.data ?? {};
  return {
    data: body.data,
    status: body.success ?? body.status,
    message: body.message,
  };
}

function normalizeErrorResponse(err) {
  const body = err?.response?.data ?? {};
  return {
    data: body.data,
    status: body.success ?? body.status,
    message: body.message ?? body.error ?? "Request failed",
  };
}

const apiGetHandler = (url, payload) => {
  const path = payload ? `${url}/${payload}` : url;
  return DataService.get(path)
    .then((res) => normalizeGetResponse(res))
    .catch((err) => {
      console.error("apiGetHandler", path, err?.response?.status, err?.message);
      return normalizeErrorResponse(err);
    });
};

const apiPostHandler = (url, payload) => {
  return DataService.post(url, payload)
    .then((res) => ({
      data: res?.data?.data,
      status: res?.data?.status,
      message: res?.data?.message,
    }))
    .catch((err) => {
      console.error("apiPostHandler", url, err?.response?.status, err?.message);
      return {
        data: err?.response?.data?.data,
        status: err?.response?.data?.status,
        message: err?.response?.data?.message ?? err?.response?.data?.error,
      };
    });
};

const apiPutHandler = (url, id, payload) => {
  const path = `${url}/${id}`;
  return DataService.put(path, payload)
    .then((res) => ({
      data: res?.data?.data,
      status: res?.data?.status,
      message: res?.data?.message,
    }))
    .catch((err) => {
      console.error("apiPutHandler", path, err?.response?.status, err?.message);
      return {
        data: err?.response?.data?.data,
        status: err?.response?.data?.status,
        message: err?.response?.data?.message ?? err?.response?.data?.error,
      };
    });
};

const apiDeleteHandler = (url, id) => {
  const path = `${url}/${id}`;
  return DataService.delete(path)
    .then((res) => ({
      data: res?.data?.data,
      status: res?.data?.status,
      message: res?.data?.message,
    }))
    .catch((err) => {
      console.error("apiDeleteHandler", path, err?.response?.status, err?.message);
      return {
        data: err?.response?.data?.data,
        status: err?.response?.data?.status,
        message: err?.response?.data?.message ?? err?.response?.data?.error,
      };
    });
};

export { apiGetHandler, apiPostHandler, apiPutHandler, apiDeleteHandler };
