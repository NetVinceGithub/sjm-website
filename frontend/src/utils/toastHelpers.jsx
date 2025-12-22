import { toast } from "react-toastify";
import React from "react";

let hasShownPayrollToast = false; // flag outside function, persists during session
let payrollToastId = null; // store toast id for dismissal

export const notifyPayrollRequests = (batches) => {
  if (!Array.isArray(batches)) return; // ✅ Prevents `.length` on undefined/null

  // Count only pending batches
  const pendingBatches = batches.filter((batch) =>
    batch.uniqueStatuses?.includes("pending")
  );
  const count = pendingBatches.length;

  if (count > 0) {
    if (!hasShownPayrollToast) {
      payrollToastId = toast(
        <div style={{ fontSize: "0.8rem" }}>
          You have {count} payroll batch{count > 1 ? "es" : ""} to review.
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          closeButton: false,
          closeOnClick: false,
          hideProgressBar: true,
          draggable: false,
          icon: <span style={{ fontSize: "13px" }}>🔔</span>,
          style: {
            fontSize: "13px",
            padding: "6px 12px",
            width: "auto",
            minHeight: "10px",
          },
        }
      );
      hasShownPayrollToast = true;
    }
  } else {
    if (hasShownPayrollToast && payrollToastId !== null) {
      toast.dismiss(payrollToastId);
      hasShownPayrollToast = false;
      payrollToastId = null;
    }
  }
};
