// Frontend Component - BulkEmployeeMessageModal.jsx
import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { FaSearch, FaPaperclip, FaTimes } from "react-icons/fa";
import axios from 'axios';

export default function BulkEmployeeMessageModal({ show, isOpen, handleCloseBulk, onClose }) {
    const [attachments, setAttachments] = useState([]); // Changed from single attachment to array
    const [message, setMessage] = useState("");
    const [subject, setSubject] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);

    const isModalOpen = show ?? isOpen;
    const closeHandler = handleCloseBulk ?? onClose;

    // Fetch employees when modal opens
    useEffect(() => {
        if (isModalOpen) {
            fetchEmployees();
        }
    }, [isModalOpen]);

    const fetchEmployees = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employee`);
            // Ensure we always set an array
            const employeeData = response.data;
            console.log('Employee API Response:', employeeData);

            if (Array.isArray(employeeData)) {
                setEmployees(employeeData);
            } else if (employeeData && Array.isArray(employeeData.data)) {
                // Handle case where data is nested under 'data' property
                setEmployees(employeeData.data);
            } else if (employeeData && Array.isArray(employeeData.employees)) {
                // Handle case where data is nested under 'employees' property
                setEmployees(employeeData.employees);
            } else {
                console.warn('Unexpected data format:', employeeData);
                setEmployees([]);
                setError('Unexpected data format received from server');
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            setEmployees([]);
            setError('Failed to fetch employees. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Safely filter employees - ensure employees is always an array
    const filteredEmployees = Array.isArray(employees) ? employees.filter(emp =>
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id?.toString().includes(searchTerm) ||
        emp.ecode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.emailaddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    // Enhanced file handling for multiple files
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        
        if (files.length === 0) return;

        // Check individual file sizes and total size
        const maxFileSize = 100 * 1024 * 1024; // 100MB per file
        const maxTotalSize = 500 * 1024 * 1024; // 500MB total
        
        const invalidFiles = files.filter(file => file.size > maxFileSize);
        if (invalidFiles.length > 0) {
            alert(`The following files exceed the 100MB limit:\n${invalidFiles.map(f => f.name).join('\n')}`);
            return;
        }

        // Check total size including existing attachments
        const currentTotalSize = attachments.reduce((sum, file) => sum + file.size, 0);
        const newTotalSize = files.reduce((sum, file) => sum + file.size, 0);
        
        if (currentTotalSize + newTotalSize > maxTotalSize) {
            alert('Total file size would exceed 500MB limit. Please remove some files or choose smaller files.');
            return;
        }

        // Add new files to existing attachments
        setAttachments(prev => [...prev, ...files]);
        
        // Clear the input to allow selecting the same files again if needed
        event.target.value = '';
    };

    // Remove a specific attachment
    const removeAttachment = (indexToRemove) => {
        setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    // Remove all attachments
    const removeAllAttachments = () => {
        setAttachments([]);
        const fileInput = document.getElementById('attachment');
        if (fileInput) fileInput.value = '';
    };

    const handleSelectAll = () => {
        // Use 'id' field instead of '_id'
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

    const handleSendMessage = async () => {
        if (!subject.trim()) {
            alert("Please enter a subject");
            return;
        }
        if (!message.trim()) {
            alert("Please enter a message");
            return;
        }
        if (selectedEmployees.length === 0) {
            alert("Please select at least one employee");
            return;
        }

        // DEBUG: Log what we're sending
        console.log("Selected Employee IDs:", selectedEmployees);
        console.log("Selected Employees Full Data:", 
            employees.filter(emp => selectedEmployees.includes(emp.id))
        );
        console.log("Attachments:", attachments.map(f => ({ name: f.name, size: f.size })));

        setSending(true);
        try {
            const formData = new FormData();
            formData.append('subject', subject);
            formData.append('message', message);
            formData.append('employeeIds', JSON.stringify(selectedEmployees));
            
            // Append all attachments
            attachments.forEach((file, index) => {
                formData.append(`attachment_${index}`, file);
            });
            
            // Also send the count of attachments
            formData.append('attachmentCount', attachments.length.toString());

            // DEBUG: Log the FormData contents
            console.log("FormData being sent:");
            for (let [key, value] of formData.entries()) {
                console.log(key, value instanceof File ? `File: ${value.name}` : value);
            }

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/employee/bulk-messaging`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            // DEBUG: Log the full response
            console.log("Full API Response:", response.data);

            if (response.data.success) {
                alert(`Message sent successfully to ${response.data.sentCount} employees!`);
                // Reset form and close modal
                setMessage("");
                setSubject("");
                setAttachments([]);
                setSelectedEmployees([]);
                setSearchTerm("");
                closeHandler?.();
            } else {
                alert('Failed to send messages. Please try again.');
            }
        } catch (error) {
            console.error('Error sending bulk message:', error);
            console.error('Error response:', error.response?.data);
            alert('Failed to send messages. Please try again.');
        } finally {
            setSending(false);
        }
    };

    // Calculate total file size for display
    const totalFileSize = attachments.reduce((sum, file) => sum + file.size, 0);
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
                                    placeholder="Search employee by name, ID, email, or department"
                                    className="px-2 h-8 w-80 text-xs font-normal rounded py-0.5 border pr-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <FaSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        <div className="mb-6 relative">
                            <label htmlFor="subject" className="block text-xs font-medium text-gray-700 -mt-4 mb-2">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="subject"
                                type="text"
                                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Type your email subject here..."
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                            
                            <label htmlFor="message" className="block text-xs font-medium text-gray-700 mb-2 mt-3">
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
                                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar,.xls,.xlsx,.ppt,.pptx"
                                    multiple // Enable multiple file selection
                                />
                            </div>
                        </div>

                        {/* File attachments display */}
                        {attachments.length > 0 && (
                            <div className="mb-4 -mt-10 ml-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-600 font-medium">
                                        Attachments ({attachments.length} files, {formatFileSize(totalFileSize)})
                                    </span>
                                    <button
                                        type="button"
                                        onClick={removeAllAttachments}
                                        className="text-xs text-red-500 hover:text-red-700 underline"
                                    >
                                        Remove All
                                    </button>
                                </div>
                                <div className="space-y-1 max-h-24 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50">
                                    {attachments.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between gap-2 text-[11px] text-gray-600 bg-white p-1 rounded">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span className="truncate" title={file.name}>
                                                    {file.name}
                                                </span>
                                                <span className="text-gray-400 text-[10px] whitespace-nowrap">
                                                    ({formatFileSize(file.size)})
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(index)}
                                                className="text-gray-400 hover:text-red-500 flex-shrink-0"
                                            >
                                                <FaTimes className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p className="text-xs -mt-5 text-red-400 text-center italic mb-3">
                            **Note: You can batch message or you can message employee individually. Multiple files supported (Max: 100MB per file, 500MB total).**
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
                                        disabled={loading}
                                    >
                                        Select All
                                    </button>
                                    <button
                                        onClick={handleDeselectAll}
                                        className="px-2 text-xs py-1 border h-8 w-36 text-gray-600 rounded hover:bg-red-400 hover:text-white transition-colors"
                                        disabled={loading}
                                    >
                                        Deselect All
                                    </button>
                                </div>
                            </div>

                            {/* Employee list */}
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {loading ? (
                                    <div className="text-center text-gray-400 py-4">
                                        Loading employees...
                                    </div>
                                ) : error ? (
                                    <div className="text-center text-red-400 py-4">
                                        {error}
                                        <button 
                                            onClick={fetchEmployees}
                                            className="block mx-auto mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                ) : filteredEmployees.length > 0 ? (
                                    filteredEmployees.map(employee => (
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
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{employee.name}</span>
                                                    <div className="text-xs text-gray-500">
                                                        <span>ID: {employee.ecode}</span>
                                                        <span className="ml-2">Email: {employee.emailaddress}</span>
                                                        <span className="ml-2">Dept: {employee.department}</span>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-400 py-4">
                                        {employees.length === 0 ? 'No employees found in the system.' : 'No employees found matching your search.'}
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
                    disabled={sending || selectedEmployees.length === 0}
                    className="px-4 py-2 text-sm h-8 border flex justify-center items-center text-center text-gray-600 rounded-lg hover:bg-green-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {sending ? 'Sending...' : 'Message Employees'}
                </button>
                <button
                    onClick={closeHandler}
                    disabled={sending}
                    className="px-4 py-2 text-sm h-8 border flex justify-center items-center text-center text-gray-600 rounded-lg hover:bg-red-400 hover:text-white transition-all disabled:opacity-50"
                >
                    Cancel
                </button>
            </Modal.Footer>
        </Modal>
    );
}