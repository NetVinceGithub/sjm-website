import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import {
  FaArrowUpRightFromSquare,
  FaPrint,
  FaRegFileExcel,
  FaRegFilePdf,
  FaXmark,
} from "react-icons/fa6";

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCutoff, setSelectedCutoff] = useState(null);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState({
    cutoffDate: null,
    project: null,
  });

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
      (invoice) =>
        invoice.cutoffDate === cutoffDate && invoice.project === project
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
        groups[key] = {
          cutoffDate: invoice.cutoffDate,
          project: invoice.project,
        };
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
                placeholder="Search Project"
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
                  <button
                    className="w-10 h-8 border hover:bg-neutralSilver border-neutralDGray rounded-l flex items-center justify-center"
                    onClick={() =>
                      handleGroupClick(row.cutoffDate, row.project)
                    }
                  >
                    <FaArrowUpRightFromSquare
                    title="View Details"
                    className="text-neutralDGray w-5 h-5"
                  />
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
              <h3>
                Invoices for Cutoff Date: {selectedGroup.cutoffDate} | Project:{" "}
                {selectedGroup.project}
              </h3>
              <DataTable
                columns={[
                  { name: "Ecode", selector: (row) => row.ecode },
                  { name: "Name", selector: (row) => row.name, width: "200px" },
                  {
                    name: "Position",
                    selector: (row) => row.position,
                    width: "200px",
                  },
                  {
                    name: "Daily Rate",
                    selector: (row) => row.dailyrate,
                    width: "130px",
                  },
                  {
                    name: "Ot hours",
                    selector: (row) => row.totalOvertime,
                    width: "130px",
                  },
                  {
                    name: "Amount",
                    selector: (row) => row.overtimePay,
                    width: "130px",
                  },
                  {
                    name: "Normal Hours",
                    selector: (row) => row.totalHours,
                    width: "130px",
                  },
                  {
                    name: "Normal Amount",
                    selector: (row) => row.totalEarnings,
                    width: "130px",
                  },
                  {
                    name: "Gross Pay",
                    selector: (row) => row.gross_pay,
                    width: "130px",
                  },
                  {
                    name: "Total Deductions",
                    selector: (row) => row.totalDeductions,
                    width: "130px",
                  },
                  {
                    name: "Net Pay",
                    selector: (row) => row.netPay,
                    width: "130px",
                  },
                ]}
                data={filteredInvoices}
                highlightOnHover
                striped
              />
              <div className="flex justify-between items-center mt-3 w-full">
                <button
                  onClick={closeModal}
                  className="flex items-center h-auto w-auto justify-center px-4 py-2 border border-neutralDGray rounded hover:bg-neutralSilver"
                >
                  <FaXmark className="mr-2 text-neutralDGray" />
                  Close
                </button>

                <div className="flex">
                  <button className="w-20 h-8 border hover:bg-neutralSilver rounded-l-md border-neutralDGray b  border-l-0 flex items-center justify-center">
                    <FaPrint
                      title="Print"
                      className="text-neutralDGray w-5 h-5"
                    />
                  </button>
                  <button className="w-20 h-8 border hover:bg-neutralSilver border-neutralDGray border-l-0 flex items-center justify-center">
                    <FaRegFileExcel
                      title="Export to Excel"
                      className="text-neutralDGray w-5 h-5"
                    />
                  </button>
                  <button className="w-20 h-8 border hover:bg-neutralSilver border-neutralDGray rounded-r border-l-0 flex items-center justify-center transition">
                    <FaRegFilePdf
                      title="Export to PDF"
                      className="text-neutralDGray w-5 h-5"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;
