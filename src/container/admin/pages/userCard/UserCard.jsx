import { useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
};
export default function UserCard() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(1);

  const handleIncrease = () => {
    if (value < 100) {
      setValue(value + 1);
    }
  };

  const handleDecrease = () => {
    if (value > 0) {
      setValue(value - 1);
    }
  };
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
      <Index.Box className="admin-dashboard-content admin-user-card-content">
        <Index.Box className="admin-user-list-flex admin-page-title-main">
          <Index.Typography
            className="admin-page-title admin-user-list-page-title"
            component="h2"
            variant="h2"
          >
            Robots
          </Index.Typography>
        </Index.Box>
        <Index.Box className="admin-user-card-row">
          {["", "", "", "", "", ""]?.map((_, index) => {
            return (
              <Index.Box className="grid-column" key={index}>
                <Index.Box className="admin-card-box common-card">
                  <Index.Box className="admin-user-card-flex">
                    <Index.Box className="admin-card-img-main">
                      <img
                        src={PagesIndex.Png.user1}
                        className="admin-card-img"
                        alt="User"
                      />
                    </Index.Box>
                    <Index.Box className="admin-card-containt-main">
                      <Index.Typography
                        className="admin-card-user-title"
                        component="p"
                        variant="p"
                      >
                        Robo {index + 1}
                      </Index.Typography>
                      <Index.Box className="admin-card-data-flex">
                        <Index.Typography
                          className="admin-card-user-lable"
                          component="p"
                          variant="p"
                        >
                          Speed:-
                        </Index.Typography>
                        <Index.Box
                          className="admin-card-user-data"
                          component="p"
                          variant="p"
                        >
                          {Math.floor(Math.random() * 100)} RPM
                        </Index.Box>
                      </Index.Box>
                      <Index.Box className="admin-card-data-flex">
                        <Index.Typography
                          className="admin-card-user-lable"
                          component="p"
                          variant="p"
                        >
                          Efficiency:-
                        </Index.Typography>
                        <Index.Box
                          className="admin-card-user-data"
                          component="p"
                          variant="p"
                        >
                          {(Math.random() * 100).toFixed(2)} %
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                  <Index.Box
                    className="admin-card-delete-box"
                    onClick={handleOpen}
                  >
                    <img
                      src={PagesIndex.Svg.edit}
                      className="admin-card-delete-icon"
                      alt="Delete"
                    />
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            );
          })}
        </Index.Box>
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
                Edit Robot
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
            <Index.Box className="modal-body">
              <Index.Box className="admin-modal-hgt-scroll cus-scrollbar">
                <Index.Box className="admin-input-box admin-modal-input-box">
                  <Index.FormHelperText className="admin-form-lable">
                    Robo Name
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
                    Code
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
                  <Index.FormHelperText className="admin-form-lable input-flex">
                    <Index.Box>
                      Speed
                      <span className="admin-span-text admin-common-para">
                        (RPM)
                      </span>
                    </Index.Box>
                    <div className="number">
                      <button className="minus" onClick={handleDecrease}>
                        -
                      </button>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => {
                          let newValue = parseInt(e.target.value);
                          if (
                            !isNaN(newValue) &&
                            newValue >= 0 &&
                            newValue <= 100
                          ) {
                            setValue(newValue);
                          }
                        }}
                      />
                      <button className="plus" onClick={handleIncrease}>
                        +
                      </button>
                    </div>
                  </Index.FormHelperText>
                </Index.Box>
                {/* <Index.Box className="admin-input-box admin-modal-input-box">
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
                </Index.Box> */}
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
      </Index.Box>
    </>
  );
}
