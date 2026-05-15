import Index from "../../Index";
import PagesIndex from "../../PagesIndex";
import { MODAL_BOX_STYLE } from "../../../utils/constants";

export default function PopupModal(props) {
  const { open, handleClose, handleFunction, buttonSpinner } = props;
  return (
    <Index.Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      className="admin-modal"
    >
      <Index.Box
        sx={MODAL_BOX_STYLE}
        className="admin-delete-modal-inner-main admin-modal-inner"
      >
        <Index.Box className="modal-body">
          <Index.Box className="admin-modal-hgt-scroll cus-scrollbar">
            <Index.Box className="admin-modal-circle-main">
              <img
                src={PagesIndex.Svg.closecircle}
                className="admin-user-circle-img"
                alt="Close"
              />
            </Index.Box>
            <Index.Typography
              className="admin-delete-modal-title"
              component="h2"
              variant="h2"
            >
              Are you sure?
            </Index.Typography>
            <Index.Typography
              className="admin-delete-modal-para admin-common-para"
              component="p"
              variant="p"
            >
              Do you really want to delete these record? This process cannot be
              undone.
            </Index.Typography>
            <Index.Box className="admin-delete-modal-btn-flex border-btn-main btn-main">
              <Index.Button
                className="admin-modal-cancel-btn border-btn"
                onClick={handleClose}
              >
                Cancel
              </Index.Button>
              <PagesIndex.PrimaryButton
                className="admin-save-user-btn btn-primary"
                onClick={handleFunction}
                btnLabel={
                  <>
                    {buttonSpinner ? (
                      <PagesIndex.Spinner />
                    ) : (
                      <>
                        <img
                          src={PagesIndex.Svg.save}
                          className="admin-user-save-icon"
                          alt="Save"
                        ></img>
                        <span>Delete</span>
                      </>
                    )}
                  </>
                }
              />
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Box>
    </Index.Modal>
  );
}
