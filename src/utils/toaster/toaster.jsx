import toast from "react-hot-toast";

const toasterSuccess = (msg) => {
  toast.success(msg);
};

const toasterError = (msg) => {
  if (msg) {
    toast.error(msg);
  }
};

const toasterInfo = (msg) => {
  toast(() => (
    <span>
      <p>
        <b>{msg.title}</b>
      </p>
      <p>{msg.body}</p>
    </span>
  ));
};

export { toasterSuccess, toasterError, toasterInfo };
