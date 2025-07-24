import React from "react";
import Breadcrumb from "../dashboard/dashboard/Breadcrumb";
import Tab from "./Tab";
import Requests from "./Requests";
import AddAdmin from "./AddAdmin"; // ✅ Import AddAdmin
import Logins from "./Logins";

const AdminLounge = () => {
  return (
    <div className=" right-0 bottom-0  min-h-screen w-full bg-neutralSilver p-3 pt-16">
      <div className="flex flex-col h-full">
        <Breadcrumb
          items={[
            { label: "Dashboard" },
            { label: "Overview", href: "/admin-dashboard/overview" },
            { label: "Menu", href: "/admin-dashboard/menu" },
            {
              label: "Admin Settings",
              href: "/admin-dashboard/admin-settings",
            },
          ]}
        />

        <div className="w-full -mt-3 text-sm">
          <Tab
            tabs={[
              { label: "Requests", content: <Requests /> },
              { label: "User Management", content: <AddAdmin /> },
              { label: "Activity Log", content: <Logins /> },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminLounge;
