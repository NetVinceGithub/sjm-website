import React from "react";
import Breadcrumb from "../dashboard/dashboard/Breadcrumb";
import Tab from "./Tab";
import Requests from "./Requests";
import AddAdmin from "./AddAdmin"; // ✅ Import AddAdmin
import Job from "./Job";
import ConnectMessages from "./ConnectMessages";
import Logins from "./Logins";
import Contributions from "./Contributions"

const AdminLounge = () => {
  return (
    <div className="fixed top-0 right-0 bottom-0 min-h-screen w-[calc(100%-16rem)] bg-white p-6 pt-16">
      <div className="flex flex-col h-full">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "" },
            { label: "Payroll Overview", href: "/admin-dashboard" },
            { label: "Admin Settings", href: "" },
          ]}
        />

        <Tab
          tabs={[
            { label: "Requests", content: <Requests /> },
            { label: "User Management", content: <AddAdmin /> },
            { label: "Contributions", content: <Contributions /> },
            { label: "Jobs", content: <Job /> },
            { label: "Messages", content: <ConnectMessages /> },
            { label: "Activity Log", content: <Logins /> },
          ]}
        />
      </div>
    </div>
  );
};

export default AdminLounge;
