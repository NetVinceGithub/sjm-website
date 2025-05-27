import { toast } from 'react-toastify';

let hasShownChangeToast = false;   // track if toast shown
let toastId = null;                // store toast id for dismissal

export const notifyChangeRequests = (requests) => {
  const count = requests.length;

  if (count > 0) {
    if (!hasShownChangeToast) {
      // Show toast and save id
      toastId = toast.info(
        <div style={{ fontSize: '0.9rem', color: '#fff' }}>
          You have {count} change request{count > 1 ? 's' : ''} to review.
        </div>,
        {
          icon: '⚠️',
          autoClose: false,
          closeOnClick: true,
          closeButton: false,
          draggable: false,
          hideProgressBar: true,
          style: {
            backgroundColor: '#444',
          },
        }
      );
      hasShownChangeToast = true;
    }
  } else {
    // No requests, dismiss toast if previously shown
    if (hasShownChangeToast && toastId !== null) {
      toast.dismiss(toastId);
      hasShownChangeToast = false;
      toastId = null;
    }
  }
};
