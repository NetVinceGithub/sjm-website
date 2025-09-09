import { toast } from "react-toastify";
import React from "react";

let hasShownChangeToast = false; // track if toast shown
let toastId = null; // store toast id for dismissal

export const notifyChangeRequests = (requests) => {
  if (!Array.isArray(requests)) return; // ✅ Prevents `.length` on undefined/null

  const count = requests.length;

  if (count > 0) {
    if (!hasShownChangeToast) {
      // Show toast and save id
      toastId = toast(
        `You have ${count} change request${count > 1 ? "s" : ""} to review.`,
        {
          position: "top-right",
          autoClose: 2000,
          closeButton: false,
          closeOnClick: true,
          hideProgressBar: true,
          icon: <span style={{ fontSize: "13px" }}>🔔</span>,
          style: {
            fontSize: "13px",
            padding: "6px 12px",
            width: "auto",
            minHeight: "10px",
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
