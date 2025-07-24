import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FaSearch } from "react-icons/fa";
import { FaUpRightFromSquare } from "react-icons/fa6";
import { Modal, Button } from "react-bootstrap";
import { ThreeDots } from "react-loader-spinner";

const ConnectMessages = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/connect/messages`
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

    if (searchTerm === "") {
      // If search is empty, show all messages
      setFilteredMessages(messages);
    } else {
      // Filter across multiple fields
      const records = messages.filter((mes) => {
        const searchableFields = [
          mes.firstname?.toLowerCase() || "",
          mes.surname?.toLowerCase() || "",
          mes.type?.toLowerCase() || "",
          mes.services?.toLowerCase() || "",
          mes.email?.toLowerCase() || "",
          mes.phone?.toLowerCase() || "",
          mes.message?.toLowerCase() || "",
          // You can also search by formatted date if needed
          mes.createdAt?.toLowerCase() || "",
        ];

        // Check if any field contains the search term
        return searchableFields.some((field) => field.includes(searchTerm));
      });
      setFilteredMessages(records);
    }
  };

  const handleOpenModal = (message) => {
    setSelectedMessage(message); // Store the entire message object
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedMessage(null);
  };

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#f9fafb",
        fontSize: "13px",
        fontWeight: "600",
        color: "#374151",
        padding: "8px",
      },
    },
    rows: {
      style: {
        fontSize: "13px",
        color: "#4B5563",
        minHeight: "40px",
        borderBottom: "1px solid #e5e7eb",
      },
    },
    cells: {
      style: {
        padding: "8px",
      },
    },
  };

  return (
    <div>
      <div className="flex justify-between items-center mt-2 mb-2">
        <div className="text-left">
          <h3 className="text-base -mt-2 font-medium text-neutralDGray"></h3>
        </div>
        <div className="flex justify-end items-center w-1/2 -mt-5 gap-3">
          <div className="flex rounded w-full items-center">
            <input
              type="text"
              placeholder="Search messages by Name, Type, Services, Date..."
              onChange={handleFilter}
              className="px-2 text-xs h-8 bg-neutralSilver w-full rounded py-0.5 border"
            />
            <FaSearch className="ml-[-20px] text-neutralDGray" />
          </div>
        </div>
      </div>
      <div className="-mt-1 overflow-auto rounded-md border">
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
            { name: "Time sent", selector: (row) => row.createdAt },
            {
              name: "Action",
              width: "60px",
              cell: (row) => (
                <button
                  onClick={() => handleOpenModal(row)}
                  title="View Inquiry"
                  className="px-2 py-1 h-8 border text-neutralDGray hover:bg-neutralSilver rounded flex items-center justify-center disabled:opacity-50"
                >
                  <FaUpRightFromSquare />
                </button>
              ),
            },
          ]}
          data={filteredMessages} // Changed from messages to filteredMessages
          progressPending={loading}
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
          customStyles={customStyles}
          pagination
          responsive
          highlightOnHover
          striped
          dense
        />
      </div>
      <Modal show={show} onHide={handleClose} centered size="lg" scrollable>
        <Modal.Header className="py-2 px-3 text-[12px]" closeButton>
          <Modal.Title as="h6" className="text-lg">
            Inquiry Message
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-3 pb-4 px-4">
          <div className="flex justify-center">
            <div className="w-full max-w-3xl bg-white p-6 border border-gray-300 rounded-md shadow-md min-h-[500px] flex flex-col">
              {/* Sender Details */}
              <div>
                <p className="text-left text-base mb-4">Sender Details:</p>
                <p className="-mt-5 text-sm ml-5 text-neutralDGray">
                  <span>Name:</span> {selectedMessage?.firstname}{" "}
                  {selectedMessage?.surname}
                </p>
                <p className="-mt-4 text-sm ml-5 text-neutralDGray">
                  <span>Sender Type:</span> {selectedMessage?.type}
                </p>
                <p className="-mt-4 text-sm ml-5 text-neutralDGray">
                  <span>Email:</span> {selectedMessage?.email}
                </p>
                <p className="-mt-4 text-sm ml-5 text-neutralDGray">
                  <span>Phone:</span> {selectedMessage?.phone}
                </p>
                <p className="-mt-4 text-sm ml-5 text-neutralDGray">
                  <span>Inquired About:</span> {selectedMessage?.services}
                </p>
                <hr />
                <p className="text-justify ml-5 mt-3 text-neutralDGray text-sm whitespace-pre-wrap">
                  {selectedMessage?.message || "No message available"}
                </p>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ConnectMessages;
