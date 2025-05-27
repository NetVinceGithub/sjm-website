import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FaSearch } from "react-icons/fa";
import { FaUpRightFromSquare } from "react-icons/fa6";
import { Modal, Button } from "react-bootstrap";

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
    const records = messages.filter((mes) =>
      mes.firstname.toLowerCase().includes(searchTerm)
    );
    setFilteredMessages(records);
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
        backgroundColor: '#f9fafb',
        fontSize: '13px',
        fontWeight: '600',
        color: '#374151',
        padding: '8px',
      },
    },
    rows: {
      style: {
        fontSize: '13px',
        color: '#4B5563',
        minHeight: '40px',
        borderBottom: '1px solid #e5e7eb',
      },
    },
    cells: {
      style: {
        padding: '8px',
      },
    },
  };

  return (

    <div className="p-6">
      <div className="text-center">
        <h3 className="text-lg -mt-4 font-semibold">Website Inquiry Messages</h3>
      </div>
      <div className="flex justify-end items-center -mt-5 gap-3">
        <div className="flex rounded items-center">
          <input
            type="text"
            placeholder="Search"
            onChange={handleFilter}
            className="px-2 rounded py-0.5 border"
          />
          <FaSearch className="ml-[-20px] text-neutralDGray" />
        </div>
      </div>
      <hr className="mt-2" />
      <div className="mt-2 overflow-auto rounded-md border">
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
              width: '60px',
              cell: (row) => (
                <button
                  onClick={() => handleOpenModal(row)}
                  title="View Inquiry"
                  className="px-2 py-1 h-8 border text-neutralDGray hover:bg-neutralSilver rounded flex items-center justify-center disabled:opacity-50"
                >
                  <FaUpRightFromSquare />
                </button>
              ),
            }
          ]}
          data={messages}
          progressPending={loading}
          customStyles={customStyles}
          pagination
          responsive
          highlightOnHover
          striped
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
                  <span >Name:</span> {selectedMessage ?.firstname}{" "}
                  {selectedMessage ?.surname}
                </p>
                <p className="-mt-4 text-sm ml-5 text-neutralDGray">
                  <span >Sender Type:</span> {selectedMessage ?.type}
                </p>
                <p className="-mt-4 text-sm ml-5 text-neutralDGray">
                  <span >Email:</span> {selectedMessage ?.email}
                </p>
                <p className="-mt-4 text-sm ml-5 text-neutralDGray">
                  <span >Phone:</span> {selectedMessage ?.phone}
                </p>
                <p className="-mt-4 text-sm ml-5 text-neutralDGray">
                  <span >Inquired About:</span> {selectedMessage ?.services}
                </p>
                <hr />
                <p className="text-justify ml-5 mt-3 text-neutralDGray text-sm whitespace-pre-wrap">
                  {selectedMessage ?.message || "No message available"}
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
