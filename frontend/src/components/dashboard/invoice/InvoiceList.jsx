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
import {Modal, Button} from "react-bootstrap";

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
  const [searchTerm, setSearchTerm] = useState("");


  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/invoice`);
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

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
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

  const filteredProjects = groupByCutoffAndProject().filter((group) =>
    group.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

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



    /** =================== PDF Export Function =================== */
    const downloadPDF = () => {
      const doc = new jsPDF();
      doc.text(
        `Invoices for Cutoff Date: ${selectedGroup.cutoffDate} | Project: ${selectedGroup.project}`,
        10,
        10
      );
      autoTable(doc, {
        startY: 20,
        head: [
          [
            "Ecode",
            "Name",
            "Position",
            "Daily Rate",
            "OT Hours",
            "OT Amount",
            "Normal Hours",
            "Normal Amount",
            "Gross Pay",
            "Total Deductions",
            "Net Pay",
          ],
        ],
        body: filteredInvoices.map((invoice) => [
          invoice.ecode,
          invoice.name,
          invoice.position,
          invoice.dailyrate,
          invoice.totalOvertime,
          invoice.overtimePay,
          invoice.totalHours,
          invoice.totalEarnings,
          invoice.gross_pay,
          invoice.totalDeductions,
          invoice.netPay,
        ]),
      });
      doc.save(`Invoices_${selectedGroup.cutoffDate}_${selectedGroup.project}.pdf`);
    };
  
    /** =================== Excel Export Function =================== */
    const downloadExcel = () => {
      const worksheet = XLSX.utils.json_to_sheet(filteredInvoices);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");
      XLSX.writeFile(
        workbook,
        `Invoices_${selectedGroup.cutoffDate}_${selectedGroup.project}.xlsx`
      );
    };
  
    /** =================== Print Function =================== */
    const printInvoices = () => {
      const printWindow = window.open("", "_blank");
      const tableContent = `
        <h3>Invoices for Cutoff Date: ${selectedGroup.cutoffDate} | Project: ${selectedGroup.project}</h3>
        <table border="1" style="width: 100%; border-collapse: collapse; text-align: center;">
          <tr>
            <th>Ecode</th>
            <th>Name</th>
            <th>Position</th>
            <th>Daily Rate</th>
            <th>OT Hours</th>
            <th>OT Amount</th>
            <th>Normal Hours</th>
            <th>Normal Amount</th>
            <th>Gross Pay</th>
            <th>Total Deductions</th>
            <th>Net Pay</th>
          </tr>
          ${filteredInvoices
            .map(
              (invoice) => `
            <tr>
              <td>${invoice.ecode}</td>
              <td>${invoice.name}</td>
              <td>${invoice.position}</td>
              <td>${invoice.dailyrate}</td>
              <td>${invoice.totalOvertime}</td>
              <td>${invoice.overtimePay}</td>
              <td>${invoice.totalHours}</td>
              <td>${invoice.totalEarnings}</td>
              <td>${invoice.gross_pay}</td>
              <td>${invoice.totalDeductions}</td>
              <td>${invoice.netPay}</td>
            </tr>
          `
            )
            .join("")}
        </table>
      `;
      printWindow.document.write(tableContent);
      printWindow.document.close();
      printWindow.print();
    };

  return (
    <div className="fixed top-0 right-0 bottom-0 min-h-screen w-[calc(100%-16rem)] bg-neutralSilver p-6 pt-16">
      <div className="bg-white  -mt-3 py-3 p-2 rounded-lg shadow">
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
                value={searchTerm}
                onChange={handleSearch}
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
            data={filteredProjects}
            highlightOnHover
            striped
          />
        </div>

        {isModalOpen && selectedGroup && (
          <Modal 
          show={isModalOpen} 
          onHide={closeModal} 
          backdrop="static" 
          centered
        >
          <div 
            className="modal-dialog" 
            style={{ 
              maxWidth: "80vw", 
              width: "80vw", 
              maxHeight: "80vh", 
              height: "80vh", 
              zIndex: "1051", 
              position: "fixed",  // Ensures it stays in place
              top: "50%",         // Centers it vertically
              left: "58%",        // Centers it horizontally
              transform: "translate(-50%, -50%)" // Adjusts centering
            }}
          >

            <div 
              className="modal-content" 
              style={{ 
                maxHeight: "80vh", 
                height: "100vh", 
                display: "flex", 
                flexDirection: "column",
                zIndex: "1052" 
              }}
            >
              <Modal.Header closeButton>
                <Modal.Title>
                  Invoices for Cutoff Date: {selectedGroup.cutoffDate} | Project: {selectedGroup.project}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ overflowY: "auto", flex: "1" }}>
                <DataTable 
                  data={filteredInvoices} 
                  columns={[
                    { name: "Ecode", selector: (row) => row.ecode },
                    { name: "Name", selector: (row) => row.name, width: "200px" },
                    { name: "Position", selector: (row) => row.position, width: "200px" },
                    { name: "Daily Rate", selector: (row) => row.dailyrate, width: "130px" },
                    { name: "Ot hours", selector: (row) => row.totalOvertime, width: "130px" },
                    { name: "Amount", selector: (row) => row.overtimePay, width: "130px" },
                    { name: "Normal Hours", selector: (row) => row.totalHours, width: "130px" },
                    { name: "Normal Amount", selector: (row) => row.totalEarnings, width: "130px" },
                    { name: "Gross Pay", selector: (row) => row.gross_pay, width: "130px" },
                    { name: "Total Deductions", selector: (row) => row.totalDeductions, width: "130px" },
                    { name: "Net Pay", selector: (row) => row.netPay, width: "130px" },
                  ]} 
                  highlightOnHover 
                  striped 
                />
              </Modal.Body>
              <Modal.Footer>
                <button
                  onClick={closeModal}
                  className="flex items-center h-auto w-auto justify-center px-4 py-2 border border-neutralDGray rounded hover:bg-neutralSilver"
                >
                  <FaXmark className="mr-2 text-neutralDGray" />
                  Close
                </button>
          
                <button onClick={printInvoices} className="w-20 h-8 border hover:bg-neutralSilver rounded-l-md border-neutralDGray border-l-0 flex items-center justify-center">
                  <FaPrint title="Print" className="text-neutralDGray w-5 h-5" />
                </button>
                <button onClick={downloadExcel} className="w-20 h-8 border hover:bg-neutralSilver border-neutralDGray border-l-0 flex items-center justify-center">
                  <FaRegFileExcel title="Export to Excel" className="text-neutralDGray w-5 h-5" />
                </button>
                <button onClick={downloadPDF} className="w-20 h-8 border hover:bg-neutralSilver border-neutralDGray rounded-r border-l-0 flex items-center justify-center transition">
                  <FaRegFilePdf title="Export to PDF" className="text-neutralDGray w-5 h-5" />
                </button>
              </Modal.Footer>
            </div>
          </div>
        </Modal>
        
        
        )}

      </div>
    </div>
  );
};

export default InvoiceList;
