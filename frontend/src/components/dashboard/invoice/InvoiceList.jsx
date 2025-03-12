import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { FaSearch, FaSyncAlt } from "react-icons/fa";

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCutoff, setSelectedCutoff] = useState(null);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState({ cutoffDate: null, project: null });

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/invoice");
        console.log(response.data);
        if (response.data.success && Array.isArray(response.data.invoice)) {
          setInvoices(response.data.invoice);
        } else {
          console.error("API response is not an array", response.data);
        }
      } catch (error) {
        setError("Error fetching invoice data");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const handleCutoffClick = (cutoffDate) => {
    const filtered = invoices.filter(
      (invoice) => invoice.cutoffDate === cutoffDate
    );
    setFilteredInvoices(filtered);
    setSelectedCutoff(cutoffDate);
    setIsModalOpen(true);
  };

  const handleGroupClick = (cutoffDate, project) => {
    const filtered = invoices.filter(
      (invoice) => invoice.cutoffDate === cutoffDate && invoice.project === project
    );
    setFilteredInvoices(filtered);
    setSelectedGroup({ cutoffDate, project });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCutoff(null);
    setFilteredInvoices([]);
    setSelectedGroup({ cutoffDate: null, project: null });
  };

  const groupByCutoffAndProject = () => {
    const groups = {};
    invoices.forEach((invoice) => {
      const key = `${invoice.cutoffDate}-${invoice.project}`;
      if (!groups[key]) {
        groups[key] = { cutoffDate: invoice.cutoffDate, project: invoice.project };
      }
    });
    return Object.values(groups);
  };

  return (
    <div className="p-6 pt-20">
      <div className="bg-white w-[77rem] -mt-3 py-3 p-2 rounded-lg shadow">
        <div className="flex -mt-3 justify-between">
          <h6 className="p-3 mb-0 ml-1 text-md text-neutralDGray">
            <strong>Invoice List</strong>
          </h6>
          <div className="flex items-center gap-3">
            <div className="flex rounded items-center">
              <input
                type="text"
                placeholder="Search Employee"
                className="px-2 rounded py-0.5 text-sm border"
              />
              <FaSearch className="ml-[-20px] mr-3 text-neutralDGray" />
            </div>
          </div>
        </div>
        <div className="mt-2 border h-[31rem]  border-neutralDGray rounded overflow-x-auto">
          <DataTable
            columns={[
              {
                name: "Cutoff Date",
                selector: (row) => row.cutoffDate,
                sortable: true,
              },
              {
                name: "Project",
                selector: (row) => row.project,
                sortable: true,
              },
              {
                name: "Action",
                cell: (row) => (
                  <button onClick={() => handleGroupClick(row.cutoffDate, row.project)}>
                    View Details
                  </button>
                ),
              },
            ]}
            data={groupByCutoffAndProject()}
            highlightOnHover
            striped
          />
        </div>

        {isModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: "8%",
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                backgroundColor: "#fff",
                padding: "30px",
                borderRadius: "10px",
                width: "80%",
                maxWidth: "80%",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <h3>Invoices for Cutoff Date: {selectedGroup.cutoffDate} | Project: {selectedGroup.project}</h3>
              <DataTable
                columns={[
                  { name: "Ecode", selector: (row) => row.ecode },
                  { name: "Name", selector: (row) => row.name },
                  { name: "Position", selector: (row) => row.position },
                  { name: "Daily Rate", selector: (row) => row.dailyrate },
                  { name: "Ot hours", selector: (row) => row.totalOvertime },
                  { name: "Amount", selector: (row) => row.overtimePay },
                  { name: "Normal Hours", selector: (row) => row.totalHours },
                  { name: "Normal Amount", selector: (row) => row.totalEarnings },
                  { name: "Gross Pay", selector: (row) => row.gross_pay },
                  { name: "Total Deductions", selector: (row) => row.totalDeductions },
                  { name: "Net Pay", selector: (row) => row.netPay },
                ]}
                data={filteredInvoices}
                highlightOnHover
                striped
              />
              <button onClick={closeModal}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;