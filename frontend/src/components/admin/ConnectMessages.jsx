import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FaSearch } from "react-icons/fa";
import { FaUpRightFromSquare } from "react-icons/fa6";

const ConnectMessages = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/api/connect/messages"
        );
        console.log("Full response data:", response);

        if (Array.isArray(response.data)) {
          const data = response.data.map((mes) => ({
            id: mes.id,
            firstname: mes.firstname,
            surname: mes.surname,
            type: mes.type,
            services: mes.services,
            email: mes.email,
            phone: mes.phone,
            message: mes.message,
            createdAt: new Date(mes.createdAt).toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              hour12: true,
            }), // Format the createdAt field with date and time
          }));
          console.log("Mapped data:", data);
          setMessages(data);
          setFilteredMessages(data);
        } else {
          console.error("API response is not an array:", response.data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleFilter = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const records = messages.filter((mes) =>
      mes.firstname.toLowerCase().includes(searchTerm)
    );
    setFilteredMessages(records);
  };

  return (
    <div className="p-6 bg-white rounded shadow-sm">
      <div className="text-center">
        <h3 className="text-2xl font-bold">Website Inquiry Messages</h3>
      </div>
      <div className="flex justify-end items-center gap-3">
        <div className="flex rounded items-center">
          <input
            type="text"
            placeholder="Search Employee"
            onChange={handleFilter}
            className="px-2 rounded py-0.5 border"
          />
          <FaSearch className="ml-[-20px] text-neutralDGray" />
        </div>
      </div>
      <hr className="mt-3" />
      <div className="mt-2 overflow-auto">
        <DataTable
          columns={[
            {
              name: "First Name",
              selector: (row) => row.firstname,
              sortable: false,
            },
            { name: "Surname", selector: (row) => row.surname },
            { name: "Type", selector: (row) => row.type, sortable: true },
            {
              name: "Services",
              selector: (row) => row.services,
              sortable: false,
            },
            { name: "Email", selector: (row) => row.email, sortable: true },
            {
              name: "Phone number",
              selector: (row) => row.phone,
              sortable: true,
            },
            { name: "Message", selector: (row) => row.message, sortable: true },
            { name: "Time sent", selector: (row) => row.createdAt },
            {
              name: "Action",
              cell: (row) => (
                <button
                  onClick={() => handleOpenModal(row.employeeId)}
                  title="View Inquiry"
                  className="px-3 py-0.5 w-auto h-8 border text-neutralDGray hover:bg-neutralSilver rounded flex items-center disabled:opacity-50"
                >
                  <FaUpRightFromSquare />
                </button>
              ),
            },
          ]}
          data={messages}
          progressPending={loading} // To show loading indicator
        />
      </div>
    </div>
  );
};

export default ConnectMessages;
