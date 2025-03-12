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

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/invoice");
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

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCutoff(null);
    setFilteredInvoices([]);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Invoices for Cutoff Date: ${selectedCutoff}`, 10, 10);
    autoTable(doc, {
      startY: 20,
      head: [
        [
          "Ecode",
          "Name",
          "Position",
          "Rate",
          "Ot Hrs",
          "Overtime Pay",
          "Normal Hrs",
          "Total Earnings",
          "Gross Pay",
          "Total Deductions",
          "Net Pay",
        ],
      ],
      body: filteredInvoices.map((row) => [
        row.ecode,
        row.name,
        row.position,
        row.dailyrate,
        row.totalOvertime,
        row.overtimePay,
        row.totalHours,
        row.totalEarnings,
        row.gross_pay,
        row.totalDeductions,
        row.netPay,
      ]),
    });
    doc.save(`invoices_${selectedCutoff}.pdf`);
  };

  const exportToExcel = () => {
    const excludedColumns = [
      "ecode",
      "email",
      "project",
      "department",
      "basicPay",
      "noOfDays",
      "nightDifferential",
      "allowance",
      "sss",
      "phic",
      "hdmf",
      "loan",
      "adjustment",
      "date",
    ]; // Add column keys to exclude

    // Filter out unwanted columns
    const filteredData = filteredInvoices.map((invoice) =>
      Object.fromEntries(
        Object.entries(invoice).filter(
          ([key]) => !excludedColumns.includes(key)
        )
      )
    );

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");
    XLSX.writeFile(workbook, `invoices_${selectedCutoff}.xlsx`);
  };

  const printTable = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(
      "<html><head><title>Print Invoice</title></head><body>"
    );
    printWindow.document.write(
      `<h3>Invoices for Cutoff Date: ${selectedCutoff}</h3>`
    );
    printWindow.document.write(
      "<table border='1' width='100%' style='border-collapse: collapse;'>"
    );
    printWindow.document.write(
      "<tr><th>Ecode</th><th>Name</th><th>Position</th><th>Rate</th><th>Ot Hrs</th><th>Overtime Pay</th><th>Normal Hrs</th><th>Total Earnings</th><th>Gross Pay</th><th>Total Deductions</th><th>Net Pay</th></tr>"
    );
    filteredInvoices.forEach((row) => {
      printWindow.document.write(
        `<tr><td>${row.ecode}</td><td>${row.name}</td><td>${row.position}</td><td>${row.dailyrate}</td><td>${row.totalOvertime}</td><td>${row.overtimePay}</td><td>${row.totalHours}</td><td>${row.totalEarnings}</td><td>${row.gross_pay}</td><td>${row.totalDeductions}</td><td>${row.netPay}</td></tr>`
      );
    });
    printWindow.document.write("</table></body></html>");
    printWindow.document.close();
    printWindow.print();
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
                cell: (row) => (
                  <button onClick={() => handleCutoffClick(row.cutoffDate)}>
                    {row.cutoffDate}
                  </button>
                ),
              },
            ]}
            data={[...new Set(invoices.map((invoice) => invoice.cutoffDate))].map(
              (cutoffDate) => ({ cutoffDate })
            )}
            highlightOnHover
            striped
          />
        </div>

        {isModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
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
              <h3>Invoices for Cutoff Date: {selectedCutoff}</h3>
              <DataTable
                columns={[
                  { name: "Ecode", selector: (row) => row.ecode },
                  { name: "Name", selector: (row) => row.name },
                  { name: "Position", selector: (row) => row.position },
                  { name: "Daily Rate", selector: (row) => row.dailyrate },
                  { name: "Ot hours", selector: (row) => row.totalOvertime },
                  { name: "Amount", selector: (row) => row.overtimePay },
                  { name: "Normal Hours", selector: (row) => row.totalHours },
                  {
                    name: "Normal Amount",
                    selector: (row) => row.totalEarnings,
                  },
                  { name: "Gross Pay", selector: (row) => row.gross_pay },
                  {
                    name: "Total Deductions",
                    selector: (row) => row.totalDeductions,
                  },
                  { name: "Net Pay", selector: (row) => row.netPay },
                ]}
                data={filteredInvoices}
                highlightOnHover
                striped
              />
              <button onClick={closeModal}>Close</button>
              <button onClick={printTable}>Print</button>
              <button onClick={exportToPDF}>PDF</button>
              <button onClick={exportToExcel}>Excel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;
