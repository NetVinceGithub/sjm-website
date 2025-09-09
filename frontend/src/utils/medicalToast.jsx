import { toast } from "react-toastify";

export const notifyMedicalExpirations = (employees) => {
  const dueSoon = employees.filter(
    (emp) => emp.medical && isMedicalExpiringSoon(emp.medical)
  );

  const count = dueSoon.length;
  if (count > 0) {
    toast(
      <div style={{ fontSize: "0.9rem", color: "#fff" }}>
        ⚕️ {count} employee{count > 1 ? "s are" : " is"} due for medical
        check-up.
      </div>,
      {
        position: "top-right",
        autoClose: 2000,
        closeButton: false,
        closeOnClick: true,
        hideProgressBar: true,
        icon: <span style={{ fontSize: "13px" }}>ℹ️</span>,
        style: {
          fontSize: "13px",
          padding: "6px 12px",
          width: "auto",
          minHeight: "10px",
        },
      }
    );
  }
};
