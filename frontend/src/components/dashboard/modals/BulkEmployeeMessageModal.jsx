import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { FaSearch, FaPaperclip, FaTimes } from "react-icons/fa";

export default function BulkEmployeeMessageModal({ show, isOpen, handleCloseBulk, onClose }) {
    const [attachment, setAttachment] = useState(null);
    const [message, setMessage] = useState("");
    const [subject, setSubject] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEmployees, setSelectedEmployees] = useState([]);

    const isModalOpen = show ?? isOpen;
    const closeHandler = handleCloseBulk ?? onClose;

    // Mock employee data
    const employees = [
        { id: 1, name: "John Doe", department: "Engineering" },
        { id: 2, name: "Jane Smith", department: "Marketing" },
        { id: 3, name: "Mike Johnson", department: "Sales" },
        { id: 4, name: "Sarah Wilson", department: "HR" },
        { id: 5, name: "David Brown", department: "Finance" },
    ];

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toString().includes(searchTerm)
    );

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setAttachment(file);
    };

    const removeAttachment = () => {
        setAttachment(null);
        // Reset file input
        const fileInput = document.getElementById('attachment');
        if (fileInput) fileInput.value = '';
    };

    const handleSelectAll = () => {
        setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    };

    const handleDeselectAll = () => {
        setSelectedEmployees([]);
    };

    const handleEmployeeSelect = (employeeId) => {
        setSelectedEmployees(prev =>
            prev.includes(employeeId)
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId]
        );
    };

    const handleSendMessage = () => {
        if (!message.trim()) {
            alert("Please enter a message");
            return;
        }
        if (selectedEmployees.length === 0) {
            alert("Please select at least one employee");
            return;
        }

        // Here you would typically send the message
        console.log("Sending message:", {
            message,
            attachment,
            selectedEmployees
        });

        // Reset form and close modal
        setMessage("");
        setAttachment(null);
        setSelectedEmployees([]);
        setSearchTerm("");
        closeHandler?.();
    };

    return (
        <Modal show={isModalOpen} onHide={closeHandler} centered size="lg" scrollable>
            <Modal.Header className="py-2 px-3 text-[12px]" closeButton>
                <Modal.Title as="h6" className="text-lg">Message Employee</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="flex flex-col">
                    <div className="w-full max-w-3xl bg-white p-6 border border-gray-300 rounded-md shadow-md min-h-[500px]">
                        <div className="flex rounded justify-end items-center -mt-2 mb-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search employee by name or ID"
                                    className="px-2 h-8 w-80 text-xs font-normal rounded py-0.5 border pr-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <FaSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        <div className="mb-6 relative">
                            <label htmlFor="message" className="block text-xs font-medium text-gray-700 -mt-4 mb-2">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="message"
                                rows="1"
                                className="w-full text-xs px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Type your email subject here..."
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                            <label htmlFor="message" className="block text-xs font-medium text-gray-700 mb-2">
                                Message <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="message"
                                rows="4"
                                className="w-full text-xs px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Type your message here..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />

                            {/* Paperclip icon */}
                            <div className="absolute bottom-2 right-2">
                                <label htmlFor="attachment" className="cursor-pointer text-gray-400 hover:text-gray-600">
                                    <FaPaperclip className="w-4 h-4" />
                                </label>
                                <input
                                    id="attachment"
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        {/* File name and remove below textarea */}
                        {attachment && (
                            <div className="mb-4 -mt-10 ml-2 flex items-center gap-2 text-[11px] text-gray-600">
                                <span className="truncate max-w-[200px]" title={attachment.name}>
                                    {attachment.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={removeAttachment}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <FaTimes className="w-3 h-3" />
                                </button>
                            </div>
                        )}

                        <p className="text-xs -mt-5 text-red-400 text-center italic mb-3">
                            **Note: You can batch message or you can message employee individually.**
                        </p>

                        <div className="border border-gray-400 rounded p-3 overflow-auto">
                            <div className="flex justify-between mb-3">
                                <div>
                                    <h5 className="text-gray-600 text-sm italic">
                                        List of Employees ({selectedEmployees.length} selected)
                                    </h5>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSelectAll}
                                        className="px-2 py-1 text-xs border h-8 w-36 text-gray-600 rounded hover:bg-green-400 hover:text-white transition-colors"
                                    >
                                        Select All
                                    </button>
                                    <button
                                        onClick={handleDeselectAll}
                                        className="px-2 text-xs py-1 border h-8 w-36 text-gray-600 rounded hover:bg-red-400 hover:text-white transition-colors"
                                    >
                                        Deselect All
                                    </button>
                                </div>
                            </div>

                            {/* Employee list */}
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {filteredEmployees.map(employee => (
                                    <div key={employee.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                                        <input
                                            type="checkbox"
                                            id={`employee-${employee.id}`}
                                            checked={selectedEmployees.includes(employee.id)}
                                            onChange={() => handleEmployeeSelect(employee.id)}
                                            className="w-4 h-4"
                                        />
                                        <label
                                            htmlFor={`employee-${employee.id}`}
                                            className="flex-1 cursor-pointer text-sm"
                                        >
                                            <span className="font-medium">{employee.name}</span>
                                            <span className="ml-2 text-gray-500">ID: {employee.id}</span>
                                            <span className="ml-2 text-gray-400 text-xs">({employee.department})</span>
                                        </label>
                                    </div>
                                ))}

                                {filteredEmployees.length === 0 && (
                                    <div className="text-center text-gray-400 py-4">
                                        No employees found matching your search.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 text-sm h-8 border flex justify-center items-center text-center text-gray-600 rounded-lg hover:bg-green-400 hover:text-white transition-all"
                >
                    Message Employees
                </button>
                <button
                    onClick={closeHandler}
                    className="px-4 py-2 text-sm h-8 border flex justify-center items-center text-center text-gray-600 rounded-lg hover:bg-red-400 hover:text-white transition-all"
                >
                    Cancel
                </button>
            </Modal.Footer>
        </Modal>
    );
}