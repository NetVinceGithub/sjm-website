import React, { useState } from "react";

const Tab = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex w-[77rem] -mt-3 border-b">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`py-1 px-4 h-10 w-auto ${
              activeTab === index ? "border-b-2 text-sm border-brandPrimary bg-gradient-to-t from-brandPrimary/30 to-neutralSilver/30 font-bold" : "text-gray-500"
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-3">{tabs[activeTab].content}</div>
    </div>
  );
};

export default Tab;
