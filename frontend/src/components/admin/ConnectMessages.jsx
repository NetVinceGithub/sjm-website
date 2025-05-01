import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FaSearch } from "react-icons/fa";
import { FaUpRightFromSquare } from "react-icons/fa6";
import {Modal, Button} from "react-bootstrap";

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

  const handleOpenModal = (message) => {
    setSelectedMessage(message); // Store the entire message object
    setShow(true);
  };
  

  const handleClose = () => {
    setShow(false);
    setSelectedMessage(null);
  };


  return (
    
    <div className="p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Website Inquiry Messages</h3>
      </div>
      <div className="flex justify-end items-center gap-3">
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
            { name: "Time sent", selector: (row) => row.createdAt },
            {
              name: "Action",
              cell: (row) => (
                <button
                  onClick={() => handleOpenModal(row)} // Pass the full row object
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
      <Modal show={show} onHide={handleClose} centered size="xl" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="flex justify-center">
            <div className="w-full max-w-3xl bg-white p-6 border border-gray-300 rounded-md shadow-md min-h-[500px]">
              <h3 className="text-center text-lg font-bold mb-4">Inquiry Message</h3>
              <p className="text-justify whitespace-pre-wrap">
                {selectedMessage?.message || "No message available"}
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={handleClose}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default ConnectMessages;
