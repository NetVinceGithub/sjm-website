import React from "react";
import Breadcrumb from "../dashboard/Breadcrumb";
import Tab from "../../../components/admin/Tab";
import Job from "../../admin/Job";
import ConnectMessages from "../../admin/ConnectMessages";
import Contributions from "../../admin/Contributions";
import RequestStatus from "../../admin/RequestStatus";

const Menu = () => {
  return (
    <div className=" right-0 bottom-0  min-h-screen w-full bg-neutralSilver p-3 pt-16">
      <div className="flex flex-col h-full">
        <Breadcrumb
          items={[
            { label: "Dashboard" },
            { label: "Overview", href: "/admin-dashboard/overview" },
            { label: "Menu", href: "/admin-dashboard/menu" },
          ]}
        />

        <Tab
          tabs={[
            { label: "Request Status", content: <RequestStatus /> },
            { label: "Contributions", content: <Contributions /> },
            { label: "Jobs", content: <Job /> },
            { label: "Messages", content: <ConnectMessages /> },
          ]}
        />
      </div>
    </div>
  );
};

export default Menu;
