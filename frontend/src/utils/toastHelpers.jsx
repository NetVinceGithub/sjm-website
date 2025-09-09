import { toast } from "react-toastify";
import React from "react";

let hasShownPayrollToast = false; // flag outside function, persists during session
let payrollToastId = null; // store toast id for dismissal

export const notifyPayrollRequests = (requests) => {
  if (!Array.isArray(requests)) return; // ✅ Prevents `.length` on undefined/null

  const count = requests.length;

  if (count > 0) {
    if (!hasShownPayrollToast) {
      payrollToastId = toast(
        `You have ${count} payroll request${count > 1 ? "s" : ""} to review.`,
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
