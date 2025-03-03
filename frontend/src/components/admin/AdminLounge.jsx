import React from "react";
import Breadcrumb from "../dashboard/dashboard/Breadcrumb";
import Tab from "./Tab";
import Requests from "./Requests";
import AddAdmin from "./AddAdmin"; // ✅ Import AddAdmin
import Job from "./Job";

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
          { label: "Overview", content: <p>This is the Overview tab.</p> },
          { label: "Payroll Requests", content: <Requests /> },
          { label: "User Management", content: <AddAdmin /> },
          { label: "Jobs", content: <Job /> },
        ]}
      />
    </div>
  );
};

export default AdminLounge;
