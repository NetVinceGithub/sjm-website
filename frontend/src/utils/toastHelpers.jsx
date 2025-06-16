import { toast } from 'react-toastify';
import React from 'react';

let hasShownPayrollToast = false;  // flag outside function, persists during session
let payrollToastId = null;         // store toast id for dismissal

export const notifyPayrollRequests = (requests) => {
  if (!Array.isArray(requests)) return;  // ✅ Prevents `.length` on undefined/null

  const count = requests.length;

  if (count > 0) {
    if (!hasShownPayrollToast) {
      payrollToastId = toast.info(
        <div style={{ fontSize: '0.9rem', color: '#fff' }}>
          You have {count} payroll request{count > 1 ? 's' : ''} to review.
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
