import React from "react";
import Breadcrumb from "../dashboard/dashboard/Breadcrumb";
import Tab from "./Tab";
import Requests from "./Requests";
import AddAdmin from "./AddAdmin"; // ✅ Import AddAdmin
import Job from "./Job";
import ConnectMessages from "./ConnectMessages";

const AdminLounge = () => {
  return (
    <div className="fixed p-6 pt-20">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "" },
          { label: "Payroll Overview", href: "/admin-dashboard" },
          { label: "Admin Settings", href: "" },
        ]}
      />

      <Tab
        tabs={[
          { label: "Payroll Requests", content: <Requests /> },
          { label: "User Management", content: <AddAdmin /> },
          { label: "Jobs", content: <Job /> },
          {label: "Messages", content: <ConnectMessages />}
        ]}
      />
    </div>
  );
};

export default AdminLounge;
