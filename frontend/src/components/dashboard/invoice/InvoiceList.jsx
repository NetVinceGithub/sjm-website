import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Breadcrumb from "../dashboard/Breadcrumb";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import { ThreeDots } from "react-loader-spinner";
import {
  FaArrowUpRightFromSquare,
  FaPrint,
  FaRegFileExcel,
  FaRegFilePdf,
  FaXmark,
  FaPenToSquare,
} from "react-icons/fa6";
import { Modal, Button } from "react-bootstrap";
import Logo from "../../../assets/logo.png";
import LongLogo from "../../../assets/long-logo.png";

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCutoff, setSelectedCutoff] = useState(null);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [particular, setParticular] = useState("");
  const [selectedGroup, setSelectedGroup] = useState({
    cutoffDate: null,
    project: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [particulars, setParticulars] = useState([]);
  const [currentParticular, setCurrentParticular] = useState({
    description: "",
    quantity: "",
    unitPrice: "",
    amount: 0,
  });
  const [invoiceNumber, setInvoiceNumber] = useState(1); // or fetch from a DB/API
  const [nextControlNumber, setNextControlNumber] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [nextBillingSummary, setNextBillingSummary] = useState(1);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/invoice`
        );
        console.log("this is the data", response.data);
        if (response.data.success && Array.isArray(response.data.invoice)) {
          setInvoices(response.data.invoice);

          const nextBillingSummary = response.data.invoice.reduce(
            (max, invoice) => {
              return invoice.billingSummary > max
                ? invoice.billingSummary
                : max;
            },
            0
          );

          // Get the latest control number and calculate the next one
          const latestControlNumber = response.data.invoice.reduce(
            (latest, invoice) => {
              return invoice.controlNumber > latest
                ? invoice.controlNumber
                : latest;
            },
            ""
          );

          // Extract last 4 digits, convert to number, add 1, and format back with full prefix
          const getNextControlNumber = (currentNumber) => {
            if (!currentNumber) return "MBS-2025-06-0001"; // Default if no existing numbers

            const lastFourDigits = currentNumber.slice(-4);
            const nextNumber = parseInt(lastFourDigits, 10) + 1;
            const nextNumberFormatted = nextNumber.toString().padStart(4, "0");

            // Keep the prefix (everything except last 4 digits) and append new number
            const prefix = currentNumber.slice(0, -4);
            return prefix + nextNumberFormatted;
          };

          const nextControlNumberFormatted =
            getNextControlNumber(latestControlNumber);

          setNextControlNumber(nextControlNumberFormatted);
          setNextBillingSummary(nextBillingSummary + 1); // next available index
          console.log("next control number", nextControlNumberFormatted);
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

  console.log("currentIndex", currentIndex);

  const getControlNumber = (invoices = []) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    // Defensive: default invoices to empty array if undefined
    const invoicesThisMonth = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.createdAt); // or invoice.date
      return (
        invoiceDate.getFullYear() === year &&
        String(invoiceDate.getMonth() + 1).padStart(2, "0") === month
      );
    });

    const nextNumber = invoicesThisMonth.length + 1;
    const paddedNumber = String(nextNumber).padStart(4, "0");

    return `SJM${year}-${month}-${paddedNumber}`;
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const groupByBatchId = () => {
    const groups = {};
    invoices.forEach((invoice) => {
      if (!groups[invoice.batchId]) {
        groups[invoice.batchId] = {
          batchId: invoice.batchId,
          cutoffDate: invoice.cutoffDate,
          project: invoice.project,
        };
      }
    });
    return Object.values(groups);
  };

  const filteredProjects = groupByBatchId().filter((group) =>
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

  const handleGroupClick = (batchId) => {
    console.log("Clicked batchId:", batchId);

    const filtered = invoices
      .filter((invoice) => {
        if (Array.isArray(invoice.batchId)) {
          return invoice.batchId.includes(batchId);
        }
        return invoice.batchId === batchId;
      })
      .map((invoice, index) => ({
        ...invoice,
        index, // assign index in filtered list
      }));

    setFilteredInvoices(filtered);

    // Optional: if you still want to highlight one item (like the first)
    if (filtered.length > 0) {
      const sample = filtered[0];
      setSelectedGroup(sample); // now includes index
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCutoff(null);
    setFilteredInvoices([]);
    setSelectedGroup({ cutoffDate: null, project: null });
  };

  /** =================== PDF Export Function =================== */
  const downloadPDF = async () => {
    try {
      // Create new PDF document with A5 size for the first page (portrait by default)
      const doc = new jsPDF({
        format: "a5",
        unit: "mm",
      });

      // A5 dimensions in mm
      const a5Width = 148;
      const a5Height = 210;

      // Get the billing summary element (first div in modal body)
      const billingSummaryElement = document.querySelector(
        ".modal-body > div:first-child"
      );

      if (billingSummaryElement) {
        const originalStyle = billingSummaryElement.style.cssText;

        // Style to match A5 size (in inches for CSS)
        billingSummaryElement.style.width = "5.8in";
        billingSummaryElement.style.height = "8.3in";

        const summaryCanvas = await html2canvas(billingSummaryElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          width: 5.8 * 96, // Convert to px at 96 DPI
          height: 8.3 * 96,
        });

        const summaryImgData = summaryCanvas.toDataURL("image/png");

        doc.addImage(
          summaryImgData,
          "PNG",
          0, // Start at top-left of page
          0,
          a5Width,
          a5Height
        );

        billingSummaryElement.style.cssText = originalStyle;
      }

      // PAGE 2: Billing Details (Landscape orientation)
      doc.addPage("legal", "landscape");

      const billingDetailsElement = document.querySelector(
        ".modal-body > div:nth-child(3)"
      );

      if (billingDetailsElement) {
        const originalStyle = billingDetailsElement.style.cssText;

        billingDetailsElement.style.width = "8in";
        billingDetailsElement.style.maxWidth = "8in";
        billingDetailsElement.style.transform = "scale(1)";
        billingDetailsElement.style.transformOrigin = "top left";

        const detailsCanvas = await html2canvas(billingDetailsElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          width: 13 * 96,
          height: 8.5 * 96,
        });

        const detailsImgData = detailsCanvas.toDataURL("image/png");

        const landscapeWidth = 297;
        const landscapeHeight = 210;

        const imgWidth = landscapeWidth - 20;
        const imgHeight =
          (detailsCanvas.height * imgWidth) / detailsCanvas.width;

        doc.addImage(
          detailsImgData,
          "PNG",
          10,
          10,
          imgWidth,
          Math.min(imgHeight, landscapeHeight - 20)
        );

        billingDetailsElement.style.cssText = originalStyle;
      }

      doc.save(
        `Billing_Invoice_${
          selectedGroup.cutoffDate
        }_${selectedGroup.project.replace(/\s+/g, "_")}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
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
        <h3>Invoices for Cutoff Date: ${selectedGroup.cutoffDate} | Project: ${
      selectedGroup.project
    }</h3>
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

  const customStyles = {
    table: {
      style: {
        fontWeight: "bold",
        backgroundColor: "#fff",
        width: "100%",
        margin: "0 auto",
      },
    },
    headRow: {
      style: {
        height: "40px", // consistent height
      },
    },
    rows: {
      style: {
        height: "40px", // consistent row height
      },
    },
    headCells: {
      style: {
        backgroundColor: "#fff",
        color: "#333",
        fontWeight: "bold",
        fontSize: "13px", // text-sm
        display: "flex",
        alignItems: "center",
        padding: "4px 8px",
      },
    },
    cells: {
      style: {
        fontSize: "12px", // text-sm
        padding: "4px 8px",
        display: "flex",
        alignItems: "center",
        height: "100%", // ensures it fills the row height
      },
    },
  };

  const addParticular = () => {
    if (currentParticular.description.trim() === "") return;

    const quantity = parseFloat(currentParticular.quantity) || 0;
    const unitPrice = parseFloat(currentParticular.unitPrice) || 0;
    const amount = quantity * unitPrice;

    const newParticular = {
      id: Date.now(),
      description: currentParticular.description,
      quantity: quantity,
      unitPrice: unitPrice,
      amount: amount,
    };

    setParticulars([...particulars, newParticular]);
    setCurrentParticular({
      description: "",
      quantity: "",
      unitPrice: "",
      amount: 0,
    });
    setParticular("");
  };

  const removeParticular = (id) => {
    setParticulars(particulars.filter((item) => item.id !== id));
  };

  const calculateTotal = () => {
    return particulars
      .reduce((total, item) => total + item.amount, 0)
      .toFixed(2);
  };

  const handleParticularChange = (field, value) => {
    const updatedParticular = { ...currentParticular, [field]: value };

    if (field === "quantity" || field === "unitPrice") {
      const quantity =
        parseFloat(field === "quantity" ? value : updatedParticular.quantity) ||
        0;
      const unitPrice =
        parseFloat(
          field === "unitPrice" ? value : updatedParticular.unitPrice
        ) || 0;
      updatedParticular.amount = quantity * unitPrice;
    }

    setCurrentParticular(updatedParticular);
  };

  const uniqueBillingSummaries = filteredInvoices.reduce((acc, invoice) => {
    if (!acc.some((item) => item.billingSummary === invoice.billingSummary)) {
      acc.push(invoice);
    }
    return acc;
  }, []);

  return (
    <div className=" right-0 bottom-0  min-h-screen w-full bg-neutralSilver p-3 pt-16">
      <Breadcrumb
        items={[
          { label: "Clients", href: "" },
          { label: "Masterlist", href: "" },
          { label: "Invoice List", href: "" },
        ]}
      />
      <div className="bg-white p-2 -mt-3 rounded-lg shadow flex justify-end">
        <div className="flex flex-row gap-2 w-1/2 justify-end">
          <div className="flex w-full">
            <input
              type="text"
              placeholder="Search Project"
              value={searchTerm}
              onChange={handleSearch}
              className="px-2 text-xs rounded w-full h-8 py-0.5 border"
            />
            <FaSearch className="-ml-6 mt-1.5 text-neutralDGray/60" />
          </div>
        </div>
      </div>

      <div className="mt-2">
        <div className="bg-white w-full p-2 rounded-lg shadow">
          <div className="border border-neutralDGray h-[95%]  rounded overflow-x-auto">
            <DataTable
              columns={[
                {
                  name: "Project",
                  selector: (row) => row.project,
                  sortable: true,
                  width: "300px",
                },
                {
                  name: "Cutoff Date",
                  selector: (row) => row.cutoffDate,
                  sortable: true,
                  width: "200px",
                },
                {
                  name: "Action",
                  cell: (row) => {
                    console.log("Row data:", row);
                    return (
                      <button
                        className="w-8 h-8 border hover:bg-neutralSilver border-neutralDGray rounded flex items-center justify-center"
                        onClick={() => handleGroupClick(row.batchId)}
                      >
                        <FaArrowUpRightFromSquare
                          title="View Details"
                          className="text-neutralDGray w-5 h-5"
                        />
                      </button>
                    );
                  },
                  width: "100px",
                  center: true,
                },
              ]}
              data={filteredProjects}
              highlightOnHover
              dense
              fixedHeader
              fixedHeaderScrollHeight="530px"
              striped
              pagination
              customStyles={customStyles}
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
            />
          </div>

          {isModalOpen && selectedGroup && (
            <Modal
              show={isModalOpen}
              onHide={closeModal}
              backdrop="static"
              centered
            >
              <div className=" fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80vw] max-h-[80vh] z-[1051]">
                <div className="modal-content flex flex-col h-[80vh] z-[1052]">
                  <Modal.Header className="py-2 px-3 text-[12px]" closeButton>
                    <Modal.Title as="h6" className="text-lg">
                      Invoices for Cutoff Date: {selectedGroup.cutoffDate} |
                      Project: {selectedGroup.project}
                    </Modal.Title>
                  </Modal.Header>

                  <Modal.Body className="overflow-y-auto flex-1">
                    <div className="w-1/2">
                      <div className="flex mr-5 gap-2 mt-3 p-2 justify-between items-center">
                        <div>
                          <div className="flex flex-row gap-2 justify-center items center">
                            <img src={Logo} className="w-20 h-20" />
                            <div>
                              <p className="font-semibold text-[#9D426E] text-[10px]">
                                ST. JOHN MAJORE SERVICES COMPANY, INC.
                              </p>
                              <p className="italic text-[9px] -mt-3">
                                Registered DOLE D.O. RO4A-BPO-DO174-0225-005-N
                              </p>
                              <p className="text-[9px] -mt-3">
                                Batangas, 4226, PHILIPPINES
                              </p>
                              <p className="text-[9px] -mt-3">
                                Cel No.: 0917-185-1909 • Tel. No.:(043) 575-5675
                              </p>
                              <p className="text-[9px] -mt-3">
                                www.stjohnmajore.com
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="border-black border rounded-lg flex flex-col divide-y divide-black">
                          <div className="p-2">
                            <p className="text-[9px] mb-0">
                              VAT REGISTERED TIN: 010-837-591-000
                            </p>
                          </div>
                          <div className="p-2">
                            <p className="flex justify-center text-center items-center -mt-1 font-semibold">
                              BILLING SUMMARY
                            </p>

                            {/* {uniqueBillingSummaries.map((invoice) => (
                              <div key={invoice.billingSummary}>
                                <p className="text-lg font-semibold -mt-3  text-red-500 text-center">
                                  {String(invoice.billingSummary).padStart(5, "0")}
                                </p>
                              </div>
                            ))} */}
                          </div>
                        </div>
                      </div>

                      <table className="border-collapse my-8 text-xs font-sans">
                        <tbody>
                          <tr>
                            <td></td>
                            <td className="border-r border-l border-t border-black p-2 text-center align-middle font-semibold"></td>
                            {filteredInvoices
                              .filter(
                                (invoice, index, self) =>
                                  index ===
                                  self.findIndex(
                                    (inv) =>
                                      inv.controlNumber ===
                                      invoice.controlNumber
                                  )
                              )
                              .map((invoice) => (
                                <td
                                  key={invoice.controlNumber}
                                  colSpan={2}
                                  className="p-2 border-t border-r w-20 border-black italic text-[10px]"
                                >
                                  Control #: {invoice.controlNumber}
                                </td>
                              ))}
                          </tr>

                          <tr>
                            <td></td>
                            <td className="border-r border-l border-black p-2 text-center align-middle w-20 font-semibold text-xs">
                              Date:
                            </td>
                            <td
                              colSpan={2}
                              className="p-2 border-t border-r w-20 border-black italic text-xs"
                            >
                              {new Date(
                                selectedGroup.cutoffDate
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </td>
                          </tr>
                          <tr className="border p-2 border-black font-semibold">
                            <td>SOLD TO:</td>
                          </tr>
                          <tr className="border-l border-r p-2 border-black">
                            <td className="px-2 py-1">Registered Name:</td>
                            <td></td>
                          </tr>
                          <tr className="border-l border-r p-2 border-black">
                            <td className="px-2 py-1">TIN:</td>
                            <td></td>
                          </tr>
                          <tr className="border-l border-r p-2 border-black">
                            <td className="px-2 py-1">Business Address:</td>
                            <td></td>
                          </tr>
                          <tr>
                            <th className="border border-black p-2 text-center">
                              Particulars
                            </th>
                            <th className="border border-black p-2   text-center">
                              Quantity
                            </th>
                            <th className="border border-black p-2 w-20 text-center">
                              Unit Price
                            </th>
                            <th className="border border-black p-2 w-20 text-center">
                              Amount
                            </th>
                          </tr>
                          <tr>
                            <td className="border h-64 w-72 border-black p-2 text-center"></td>
                            <td className="border border-black p-2 text-center"></td>
                            <td className="border border-black p-2 text-center"></td>
                            <td className="border border-black p-2 text-center"></td>
                          </tr>

                          <tr>
                            <td></td>
                            <td
                              colSpan={2}
                              className="border-l border-r border-b text-right font-semibold border-black"
                            >
                              TOTAL AMOUNT DUE:
                            </td>
                            <td className="border-r border-black border-b">
                              ₱ [Total]
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="flex flex-row gap-4 -mt-14">
                        <div flex flex-col>
                          <div>
                            <table className="w-64">
                              <tr
                                colSpan={2}
                                className="border border-black text-sm"
                              >
                                <td>Prepared by:</td>
                              </tr>
                              <tr
                                colSpan={2}
                                className="border border-black text-sm"
                              >
                                <td>Received by:</td>
                              </tr>
                              <tr
                                colSpan={2}
                                className="border border-black text-sm"
                              >
                                <td>Date Received:</td>
                              </tr>
                            </table>
                          </div>
                          <div className="ml-7">
                            <p className="text-decoration-underline font-semibold  text-[10px] -mt-3">
                              "THIS DOCUMENT IS NOT VALID FOR CLAIMING INPUT
                              TAX."
                            </p>
                            <p className="text-[8px] -mt-3 font-semibold">
                              THIS BILLING INVOICE SHALL BE VALID FOR FIVE (5)
                              YEARS FROM THE DATE OF ATP.
                            </p>
                          </div>
                        </div>

                        <img src={LongLogo} className="w-36 h-24 -ml-3 mt-5" />
                      </div>
                    </div>

                    <div className="mt- mb-10">
                      <hr />
                    </div>

                    <div className="">
                      <div>
                        <p className="italic font-semibold text-[#9D426E] text-sm">
                          ST. JOHN MAJORE SERVICES COMPANY, INC.
                        </p>
                        <p className="text-xs -mt-3">
                          Details of Billing Invoice
                        </p>
                        <p className="text-xs -mt-3">
                          For the period of {selectedGroup.cutoffDate}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm mt-5">
                          Principal: {selectedGroup.project}
                        </p>
                      </div>

                      <div>
                        <table className="min-w-full -ml-0 table-auto border-separate border border-black text-sm mt-5">
                          <thead>
                            <tr>
                              <th
                                className=" border border-black text-center py-1 text-nowrap"
                                rowSpan="2"
                              >
                                E-CODE
                              </th>
                              <th
                                className=" border border-black text-center py-1 text-nowrap"
                                rowSpan="2"
                              >
                                EMPLOYEE NAME
                              </th>
                              <th
                                className=" border border-black text-center  py-1 text-nowrap"
                                rowSpan="2"
                              >
                                DESIGNATION
                              </th>
                              <th
                                className=" border border-black text-center  py-1 text-nowrap"
                                rowSpan="2"
                              >
                                PAYROLL RATE
                              </th>
                              <th
                                className=" border border-black text-center py-1"
                                colSpan="2"
                              >
                                REGULAR OVERTIME (excess in 8/hrs/day)
                              </th>
                              <th
                                className=" border border-black text-center py-1"
                                rowSpan="2"
                              >
                                GROSS PAY (DUE TO EMPLOYEES)
                              </th>
                              <th
                                className=" border border-black text-center py-1 text-nowrap"
                                rowSpan="2"
                              >
                                ADMIN FEE (10%)
                              </th>
                              <th
                                className=" border border-black text-center  py-1 text-nowrap"
                                rowSpan="2"
                              >
                                TOTAL AMOUNT
                              </th>
                              <th
                                className=" border border-black text-center py-1"
                                rowSpan="2"
                              >
                                12% VALUE ADDED TAX
                              </th>
                              <th
                                className=" border border-black text-center  py-1 text-nowrap"
                                rowSpan="2"
                              >
                                TOTAL AMOUNT DUE
                              </th>
                            </tr>
                            <tr>
                              <th className=" border border-black text-center  py-1">
                                Hrs
                              </th>
                              <th className=" border border-black text-center  py-1">
                                Amount
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {(() => {
                              // Initialize totals
                              let totalDailyRate = 0;
                              let totalOvertimeHours = 0;
                              let totalOvertimeAmount = 0;
                              let totalGrossPay = 0;
                              let totalAdminFee = 0;
                              let totalAmount = 0;
                              let totalVat = 0;
                              let totalAmountDue = 0;

                              // Map rows and compute totals at the same time
                              const rows = filteredInvoices.map(
                                (invoice, index) => {
                                  const dailyRate = parseFloat(
                                    invoice.dailyrate || 0
                                  );
                                  const overtimeHours = parseFloat(
                                    invoice.totalOvertime || 0
                                  );
                                  const overtimeAmount = parseFloat(
                                    invoice.overtimePay || 0
                                  );
                                  const grossPay = parseFloat(
                                    invoice.gross_pay || 0
                                  );
                                  const adminFee = grossPay * 0.1;
                                  const subtotal = grossPay + adminFee;
                                  const vat = subtotal * 0.12;
                                  const totalDue = subtotal + vat;

                                  // Accumulate totals
                                  totalDailyRate += dailyRate;
                                  totalOvertimeHours += overtimeHours;
                                  totalOvertimeAmount += overtimeAmount;
                                  totalGrossPay += grossPay;
                                  totalAdminFee += adminFee;
                                  totalAmount += subtotal;
                                  totalVat += vat;
                                  totalAmountDue += totalDue;

                                  return (
                                    <tr key={invoice.id}>
                                      <td className="border border-black text-center px-4 py-2 text-xs text-nowrap">
                                        {index + 1}
                                      </td>
                                      <td className="border border-black text-left px-4 py-2 text-xs text-nowrap">
                                        {invoice.name}
                                      </td>
                                      <td className="border border-black text-left px-4 py-2 text-xs text-nowrap">
                                        {invoice.position || "—"}
                                      </td>
                                      <td className="border border-black text-right px-4 py-2 text-xs text-nowrap">
                                        {dailyRate.toFixed(2)}
                                      </td>
                                      <td className="border border-black text-right px-4 py-2 text-xs text-nowrap">
                                        {overtimeHours.toFixed(2)}
                                      </td>
                                      <td className="border border-black text-right px-4 py-2 text-xs text-nowrap">
                                        {overtimeAmount.toFixed(2)}
                                      </td>
                                      <td className="border border-black text-right px-4 py-2 text-xs text-nowrap">
                                        {grossPay.toFixed(2)}
                                      </td>
                                      <td className="border border-black text-right px-4 py-2 text-xs text-nowrap">
                                        {adminFee.toFixed(2)}
                                      </td>
                                      <td className="border border-black text-right px-4 py-2 text-xs text-nowrap">
                                        {subtotal.toFixed(2)}
                                      </td>
                                      <td className="border border-black text-right px-4 py-2 text-xs text-nowrap">
                                        {vat.toFixed(2)}
                                      </td>
                                      <td className="border border-black text-right px-4 py-2 text-xs text-nowrap">
                                        {totalDue.toFixed(2)}
                                      </td>
                                    </tr>
                                  );
                                }
                              );

                              // Append totals row
                              rows.push(
                                <tr key="totals">
                                  <td
                                    className="border border-black font-semibold text-center px-4 py-2"
                                    colSpan="3"
                                  >
                                    TOTAL AMOUNT
                                  </td>
                                  <td className="border border-black text-right px-4 py-2">
                                    {totalDailyRate.toFixed(2)}
                                  </td>
                                  <td className="border border-black text-right px-4 py-2">
                                    {totalOvertimeHours.toFixed(2)}
                                  </td>
                                  <td className="border border-black text-right px-4 py-2">
                                    {totalOvertimeAmount.toFixed(2)}
                                  </td>
                                  <td className="border border-black text-right px-4 py-2">
                                    {totalGrossPay.toFixed(2)}
                                  </td>
                                  <td className="border border-black text-right px-4 py-2">
                                    {totalAdminFee.toFixed(2)}
                                  </td>
                                  <td className="border border-black text-right px-4 py-2">
                                    {totalAmount.toFixed(2)}
                                  </td>
                                  <td className="border border-black text-right px-4 py-2">
                                    {totalVat.toFixed(2)}
                                  </td>
                                  <td className="border border-black text-right px-4 py-2">
                                    {totalAmountDue.toFixed(2)}
                                  </td>
                                </tr>
                              );

                              return rows;
                            })()}
                          </tbody>
                        </table>

                        <table className="table-fixed border border-black text-xs w-fit">
                          <tbody>
                            <tr>
                              <td className="px-2 border-r border-black">
                                TOTAL APPROVED MAN HOURS
                              </td>
                              <td className="px-2 w-32 text-right">1</td>
                            </tr>
                          </tbody>
                        </table>

                        <div className="grid grid-cols-3 gap-4 text-center mt-20">
                          <div>
                            <p className="text-xs text-left mb-2">
                              Prepared by:
                            </p>
                            <div className="border-t border-black h-6"></div>
                            <p className="text-xs -mt-3">
                              Ms. Paula Jane Y. Castillo
                            </p>
                            <p className="text-xs -mt-3">Billing Head</p>
                          </div>
                          <div>
                            <p className="text-xs text-left mb-2">
                              Received by:
                            </p>
                            <div className="border-t border-black h-6"></div>
                            <p className="text-xs -mt-3">Client</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Modal.Body>

                  <Modal.Footer className="flex justify-between flex-wrap gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={printInvoices}
                        className="w-20 h-8 border hover:bg-neutralSilver border-neutralDGray rounded flex items-center justify-center"
                      >
                        <FaPenToSquare
                          title="Print"
                          className="text-neutralDGray w-5 h-5"
                        />
                      </button>
                      <button
                        onClick={downloadPDF}
                        className="w-20 h-8 border hover:bg-neutralSilver border-neutralDGray rounded flex items-center justify-center"
                      >
                        <FaRegFilePdf
                          title="Export to PDF"
                          className="text-neutralDGray w-5 h-5"
                        />
                      </button>
                    </div>
                  </Modal.Footer>
                </div>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceList;