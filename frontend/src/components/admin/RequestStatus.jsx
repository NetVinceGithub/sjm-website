import React from "react";
import { FaSearch } from "react-icons/fa";
import DataTable from "react-data-table-component";
import { ThreeDots } from "react-loader-spinner";

const RequestStatus = () => {
  return (
    <div>
      <div className="flex justify-between items-center mt-2 mb-2">
        <div className="text-left">
          <h3 className="text-base -mt-2 font-medium text-neutralDGray">
            Request Status
          </h3>
        </div>
        <div className="flex justify-end items-center w-1/2 -mt-5 gap-3">
          <div className="flex rounded w-full items-center">
            <input
              type="text"
              placeholder="Search"
              // onChange={handleFilter}
              className="px-2 bg-neutralSilver w-full rounded py-0.5 border"
            />
            <FaSearch className="ml-[-20px] text-neutralDGray" />
          </div>
        </div>
      </div>
      <hr className="mt-2" />
      <div className="mt-2 overflow-auto rounded-md border">
        <DataTable
          columns={[
            {
              name: "Request ID",
              sortable: true,
            },
            { name: "Request Type", sortable: true },
            { name: "Date Created", sortable: true },
            {
              name: "Requestor",
              sortable: true,
            },
            {
              name: "Request Status",
              sortable: true,
            },
            { name: "Action Taken By", sortable: true },
          ]}
          // progressPending={loading}
          progressComponent={
            <div className="flex justify-center items-center gap-2 text-gray-600 text-sm">
              <ThreeDots
                visible={true}
                height="60"
                width="60"
                color="#4fa94d"
                radius="9"
                ariaLabel="three-dots-loading"
                wrapperStyle={{}}
                wrapperClass=""
              />
            </div>
          }
          noDataComponent={
            <div className="text-gray-500 text-sm italic py-4 text-center">
              *** No data found ***
            </div>
          }
          // customStyles={customStyles}
          pagination
          responsive
          highlightOnHover
          striped
        />
      </div>
    </div>
  );
};

export default RequestStatus;
