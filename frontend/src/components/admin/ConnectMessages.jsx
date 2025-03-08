import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";

const ConnectMessages = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/api/connect/messages");
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
            createdAt: new Date(mes.createdAt).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
              hour12: true
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
    const records = messages.filter((mes)=>
      mes.firstname.toLowerCase().includes(searchTerm)
    );
    setFilteredMessages(records); 
  }

  return (
    <div className="p-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold">Messages</h3>
      </div>
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by Name"
          onClick={handleFilter}
          className="px-4 py-0.5 border"
        />
      </div>
      <div className="mt-6">
        <DataTable
          columns={[
            { name: "First Name", selector: (row) => row.firstname, sortable: false },
            { name: "Surname", selector: (row) => row.surname },
            { name: "Type", selector: (row) => row.type, sortable: true },
            { name: "Services", selector: (row) => row.services, sortable: false },
            { name: "Email", selector: (row) => row.email, sortable: true },
            { name: "Phone number", selector: (row) => row.phone, sortable: true },
            { name: "Message", selector: (row) => row.message, sortable: true },
            { name: "Time sent", selector: (row) => row.createdAt }
          ]}
          data={messages}
          progressPending={loading} // To show loading indicator
        />
      </div>
    </div>
  );
};

export default ConnectMessages;
