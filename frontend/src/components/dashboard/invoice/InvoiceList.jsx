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
import { Modal, Button } from "react-bootstrap";
import Logo from '../../../assets/logo.png'
import LongLogo from '../../../assets/long-logo.png'

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
    amount: 0
  });


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
      amount: amount
    };

    setParticulars([...particulars, newParticular]);
    setCurrentParticular({
      description: "",
      quantity: "",
      unitPrice: "",
      amount: 0
    });
    setParticular("");
  };

  const removeParticular = (id) => {
    setParticulars(particulars.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return particulars.reduce((total, item) => total + item.amount, 0).toFixed(2);
  };

  const handleParticularChange = (field, value) => {
    const updatedParticular = { ...currentParticular, [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = parseFloat(field === 'quantity' ? value : updatedParticular.quantity) || 0;
      const unitPrice = parseFloat(field === 'unitPrice' ? value : updatedParticular.unitPrice) || 0;
      updatedParticular.amount = quantity * unitPrice;
    }

    setCurrentParticular(updatedParticular);
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 min-h-screen w-[calc(100%-16rem)] bg-neutralSilver p-6 pt-20">
      <div className="flex flex-row gap-4 w-full">
        <div className="w-1/2 bg-white rounded shadow-lg p-3 h-[calc(100vh-150px)] overflow-auto">
          <div className="border">
            <div className="flex flex-row gap-2 mt-3 p-2 justify-center items-center">
              <img src={Logo} className="w-28 h-28" />
              <div>
                <p className="font-semibold text-[#9D426E] text-sm">ST. JOHN MAJORE SERVICES COMPANY, INC.</p>
                <p className="italic text-xs -mt-3">Registered DOLE D.O. RO4A-BPO-DO174-0225-005-N</p>
                <p className="text-xs -mt-3">Batangas, 4226, PHILIPPINES</p>
                <p className="text-xs -mt-3">Cel No.: 0917-185-1909 • Tel. No.:(043) 575-5675</p>
                <p className="text-xs -mt-3">www.stjohnmajore.com</p>
              </div>
              <div className="border-black border-2 rounded-lg flex flex-col divide-y-2 divide-black ml-10">
                <div className="p-2">
                  <p className="text-xs mb-0">VAT REGISTERED TIN: 010-837-591-000</p>
                </div>
                <div className="p-2">
                  <p className="flex justify-center text-center items-center mt-2 font-semibold">BILLING INVOICE</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col ml-10 mt-3 mb-8">
              <div className="flex divide-x-2 divide-black ml-auto mr-[2.1rem] h-14 border-x-2 border-t-2 border-black w-fit">
                <div className="px-3 py-2 flex items-start min-w-[70px]">
                  <p className="text-xs font-medium  flex justify-center items-center text-center mt-[21px]">Date:</p>
                </div>
                <div className="px-3 py-1 w-[11.65rem] h-14 flex flex-col justify-between">
                  <p className="text-xs italic">Control #: </p>
                  <div className="text-xs -ml-[12px] -mt-[15px]">
                    <input type="date" className="text-xs border-none" />
                  </div>
                </div>
              </div>
              <div className="divide-y-2 divide-black border-2 border-black w-[calc(100%-2.1rem)]">
                <div className="h-fit font-semibold text-sm">SOLD TO:</div>
                <div className="p-1">
                  <div className="ml-10 text-xs mt-1 flex items-center">
                    <span className="w-28">Registered Name:</span>
                    <input
                      type="text"
                      className="ml-2 text-xs w-1/2 h-6 border-white focus:ring-0 focus:outline-none"
                      placeholder=""
                    />
                  </div>
                  <div className="ml-10 text-xs mt-1 flex items-center">
                    <span className="w-28">TIN:</span>
                    <input
                      type="text"
                      className="ml-2 h-6 w-1/2 text-xs border-white focus:ring-0 focus:outline-none"
                      placeholder=""
                    />
                  </div>
                  <div className="ml-10 text-xs mt-1 mb-1 flex items-center">
                    <span className="w-28">Business Address:</span>
                    <input
                      type="text"
                      className="ml-2 h-6 w-1/2 text-xs border-b-2 border-white focus:ring-0 focus:outline-none"
                      placeholder=""
                    />
                  </div>
                </div>
              </div>

              <div className="  mt-3">
                <div className=" border-2 border-black w-[calc(100%-2.1rem)]">
                  <div className="h-4 border-b-2 border-black"></div>
                  <div className="flex flex-row divide-black divide-x-2">
                    <div className="w-[20rem] h-fit border-black border-b-2 text-sm flex justify-center items-center text-center">Particulars</div>
                    <div className="w-[9rem] h-fit border-b-2 text-sm  flex justify-center items-center text-center">Quantity</div>
                    <div className="w-[9rem] h-fit border-b-2 text-sm flex justify-center items-center text-center">Unit Price</div>
                    <div className="w-[9rem] h-fit border-b-2 text-sm flex justify-center items-center text-center">Amount</div>
                  </div>

                  {particulars.map((item) => (
                    <div key={item.id} className="flex flex-row divide-black divide-x-2">
                      <div className="h-10 p-1 w-[20rem] flex items-center">
                        <span className="text-xs px-2">{item.description}</span>
                      </div>
                      <div className="h-10 p-1 w-[9rem] flex items-center justify-center">
                        <span className="text-xs">{item.quantity}</span>
                      </div>
                      <div className="h-10 w-[9rem] p-1 flex items-center justify-center">
                        <span className="text-xs">{item.unitPrice}</span>
                      </div>
                      <div className="h-10 w-[9rem] p-1 flex items-center justify-between">
                        <span className="text-xs">{item.amount.toFixed(2)}</span>
                        <button
                          onClick={() => removeParticular(item.id)}
                          className="border w-6 h-6 rounded hover:bg-red-400 hover:text-white text-xs"
                        >
                          -
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-row divide-black divide-x-2">
                    <div className="flex flex-row gap-1 h-10 p-1 w-[20rem]">
                      <input
                        type="text"
                        value={particular}
                        onChange={(e) => {
                          setParticular(e.target.value);
                          handleParticularChange('description', e.target.value);
                        }}
                        placeholder="Enter particulars"
                        className="w-full h-full px-2 border rounded text-xs"
                      />
                      <button
                        onClick={addParticular}
                        className="border w-9 h-full rounded hover:bg-green-400 hover:text-white"
                      >
                        +
                      </button>
                    </div>
                    <div className="h-10 p-1 w-[9rem]">
                      {particular && (
                        <input
                          type="number"
                          value={currentParticular.quantity}
                          onChange={(e) => handleParticularChange('quantity', e.target.value)}
                          placeholder="Qty"
                          className="w-full h-full px-2 border rounded text-xs"
                        />
                      )}
                    </div>
                    <div className="h-10 w-[9rem] p-1">
                      {particular && (
                        <input
                          type="number"
                          value={currentParticular.unitPrice}
                          onChange={(e) => handleParticularChange('unitPrice', e.target.value)}
                          placeholder="Price"
                          className="w-full h-full px-2 border rounded text-sm"
                        />
                      )}
                    </div>
                    <div className="h-10 w-[9rem] p-1">
                      {particular && (
                        <input
                          type="number"
                          value={currentParticular.amount.toFixed(2)}
                          placeholder="Amount"
                          className="w-full h-full px-2 border rounded text-sm"
                          readOnly
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex divide-x-2 divide-black ml-auto mr-[2.1rem]  border-x-2 border-b-2 border-black  w-fit">
                <div className="w-[16rem] h-fit flex justify-end items-center text-right font-semibold text-xs p-1">TOTAL AMOUNT DUE:</div>
                <div className="w-[8rem] p-1 text-xs">₱{calculateTotal()}</div>
              </div>

              <div className="flex flex-row gap-4">
                <div flex flex-col>
                  <div className="divide-y-2 divide-black w-[17rem] mr-4 border-2 border-black -mt-4">
                    <div className="text-xs p-2 h-10">
                      <span>Prepared by:</span>
                      <input
                        type="text"
                        className="ml-2 h-6 w-1/2 text-xs border-white focus:ring-0 focus:outline-none"
                        placeholder=""
                      />
                    </div>
                    <div className="text-xs p-2 h-10">
                      <span>Received by:</span>
                      <input
                        type="text"
                        className="ml-2 h-6 w-1/2 text-xs border-white focus:ring-0 focus:outline-none"
                        placeholder=""
                      />
                    </div>
                    <div className="text-xs p-2 h-10">
                      <span>Prepared by:</span>
                      <input
                        type="text"
                        className="ml-2 h-6 w-1/2 text-xs border-white focus:ring-0 focus:outline-none"
                        placeholder=""
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-decoration-underline font-semibold text-[10px] mt-2">"THIS DOCUMENT IS NOT VALID FOR CLAIMING INPUT TAX."</p>
                    <p className="text-[8px] -mt-3 font-semibold">THIS BILLING INVOICE SHALL BE VALID FOR FIVE (5) YEARS FROM THE DATE OF ATP.</p>
                  </div>
                </div>

                <img src={LongLogo} className="w-60 h-32 mt-2" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="w-32 text-sm bg-brandPrimary h-8 hover:bg-neutralDGray text-white py-1 px-2 rounded mt-3">Create Invoice</button>
          </div>
        </div>

        <div className="bg-white w-1/2 py-4 px-3 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <h6 className="text-md text-neutralDGray font-bold">Invoice List</h6>
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded px-1 py-1">
                <input
                  type="text"
                  placeholder="Search Project"
                  className="text-xs h-5 border-white focus:outline-none"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <FaSearch className="ml-2 text-neutralDGray" />
              </div>
            </div>
          </div>

          <div className="mt-3 border border-neutralDGray h-[31rem] rounded overflow-x-auto">
            <DataTable
              columns={[
                {
                  name: "Project",
                  selector: row => row.project,
                  sortable: true,
                  width: "350px",
                },
                {
                  name: "Cutoff Date",
                  selector: row => row.cutoffDate,
                  sortable: true,
                  width: "300px",
                },
                {
                  name: "Action",
                  cell: (row) => (
                    <button
                      className="w-8 h-8 border hover:bg-neutralSilver border-neutralDGray rounded flex items-center justify-center"
                      onClick={() => handleGroupClick(row.cutoffDate, row.project)}
                    >
                      <FaArrowUpRightFromSquare
                        title="View Details"
                        className="text-neutralDGray w-5 h-5"
                      />
                    </button>
                  ),
                  width: "100px",
                  center: true,
                },
              ]}
              data={filteredProjects}
              highlightOnHover
              striped
              pagination
              customStyles={customStyles}
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
                  <Modal.Header  className="py-2 px-3 text-[12px]" closeButton>
                    <Modal.Title as="h6" className="text-lg">
                      Invoices for Cutoff Date: {selectedGroup.cutoffDate} | Project: {selectedGroup.project}
                    </Modal.Title>
                  </Modal.Header>

                  <Modal.Body className="overflow-y-auto flex-1">
                    {/* <DataTable
                      data={filteredInvoices}
                      columns={[
                        { name: "Ecode", selector: row => row.ecode },
                        { name: "Name", selector: row => row.name, width: "200px" },
                        { name: "Position", selector: row => row.position, width: "200px" },
                        { name: "Daily Rate", selector: row => row.dailyrate, width: "130px" },
                        { name: "Ot hours", selector: row => row.totalOvertime, width: "130px" },
                        { name: "Amount", selector: row => row.overtimePay, width: "130px" },
                        { name: "Normal Hours", selector: row => row.totalHours, width: "130px" },
                        { name: "Normal Amount", selector: row => row.totalEarnings, width: "130px" },
                        { name: "Gross Pay", selector: row => row.gross_pay, width: "130px" },
                        { name: "Total Deductions", selector: row => row.totalDeductions, width: "130px" },
                        { name: "Net Pay", selector: row => row.netPay, width: "130px" },
                      ]}
                      highlightOnHover
                      striped
                    /> */}
                    <div className="border w-[50%]">
                      <div className="flex flex-row gap-2 mt-3 p-2 justify-center items-center">
                        <img src={Logo} className="w-28 h-28" />
                        <div>
                          <p className="font-semibold text-[#9D426E] text-sm">ST. JOHN MAJORE SERVICES COMPANY, INC.</p>
                          <p className="italic text-xs -mt-3">Registered DOLE D.O. RO4A-BPO-DO174-0225-005-N</p>
                          <p className="text-xs -mt-3">Batangas, 4226, PHILIPPINES</p>
                          <p className="text-xs -mt-3">Cel No.: 0917-185-1909 • Tel. No.:(043) 575-5675</p>
                          <p className="text-xs -mt-3">www.stjohnmajore.com</p>
                        </div>
                        <div className="border-black border-2 rounded-lg flex flex-col divide-y-2 divide-black ml-10">
                          <div className="p-2">
                            <p className="text-xs mb-0">VAT REGISTERED TIN: 010-837-591-000</p>
                          </div>
                          <div className="p-2">
                            <p className="flex justify-center text-center items-center mt-2 font-semibold">BILLING INVOICE</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col ml-10 mt-3 mb-8">
                        <div className="flex divide-x-2 divide-black ml-auto mr-[2.1rem] h-14 border-x-2 border-t-2 border-black w-fit">
                          <div className="px-3 py-2 flex items-start min-w-[70px]">
                            <p className="text-xs font-medium  flex justify-center items-center text-center mt-[21px]">Date:</p>
                          </div>
                          <div className="px-3 py-1 w-[11.65rem] h-14 flex flex-col justify-between">
                            <p className="text-xs italic">Control #: </p>
                            <div className="text-xs -ml-[12px] -mt-[15px]">
                              {/* Add date here */}
                            </div>
                          </div>
                        </div>
                        <div className="divide-y-2 divide-black border-2 border-black w-[calc(100%-2.1rem)]">
                          <div className="h-fit font-semibold text-sm">SOLD TO:</div>
                          <div className="p-1">
                            <div className="ml-10 text-xs mt-1 flex items-center">
                              <span className="w-28">Registered Name:</span>
                              {/* Add Name here */}
                            </div>
                            <div className="ml-10 text-xs mt-1 flex items-center">
                              <span className="w-28">TIN:</span>
                              <input
                                type="text"
                                className="ml-2 h-6 w-1/2 text-xs border-white focus:ring-0 focus:outline-none"
                                placeholder=""
                              />
                            </div>
                            <div className="ml-10 text-xs mt-1 mb-1 flex items-center">
                              <span className="w-28">Business Address:</span>
                              <input
                                type="text"
                                className="ml-2 h-6 w-1/2 text-xs border-b-2 border-white focus:ring-0 focus:outline-none"
                                placeholder=""
                              />
                            </div>
                          </div>
                        </div>

                        <div className="  mt-3">
                          <div className=" border-2 border-black w-[calc(100%-2.1rem)]">
                            <div className="h-4 border-b-2 border-black"></div>
                            <div className="flex flex-row divide-black divide-x-2">
                              <div className="w-[20rem] h-fit border-black border-b-2 text-sm flex justify-center items-center text-center">Particulars</div>
                              <div className="w-[9rem] h-fit border-b-2 text-sm  flex justify-center items-center text-center">Quantity</div>
                              <div className="w-[9rem] h-fit border-b-2 text-sm flex justify-center items-center text-center">Unit Price</div>
                              <div className="w-[9rem] h-fit border-b-2 text-sm flex justify-center items-center text-center">Amount</div>
                            </div>

                            {particulars.map((item) => (
                              <div key={item.id} className="flex flex-row divide-black divide-x-2">
                                <div className="h-10 p-1 w-[20rem] flex items-center">
                                  <span className="text-xs px-2">{item.description}</span>
                                </div>
                                <div className="h-10 p-1 w-[9rem] flex items-center justify-center">
                                  <span className="text-xs">{item.quantity}</span>
                                </div>
                                <div className="h-10 w-[9rem] p-1 flex items-center justify-center">
                                  <span className="text-xs">{item.unitPrice}</span>
                                </div>
                                <div className="h-10 w-[9rem] p-1 flex items-center justify-between">
                                  <span className="text-xs">{item.amount.toFixed(2)}</span>
                                  <button
                                    onClick={() => removeParticular(item.id)}
                                    className="border w-6 h-6 rounded hover:bg-red-400 hover:text-white text-xs"
                                  >
                                    -
                                  </button>
                                </div>
                              </div>
                            ))}

                            <div className="flex flex-row divide-black divide-x-2">
                              <div className="flex flex-row gap-1 h-10 p-1 w-[20rem]">
                                {/* <input
                                  type="text"
                                  value={particular}
                                  onChange={(e) => {
                                    setParticular(e.target.value);
                                    handleParticularChange('description', e.target.value);
                                  }}
                                  placeholder="Enter particulars"
                                  className="w-full h-full px-2 border rounded text-xs"
                                />
                                <button
                                  onClick={addParticular}
                                  className="border w-9 h-full rounded hover:bg-green-400 hover:text-white"
                                >
                                  +
                                </button> */}
                              </div>
                              <div className="h-10 p-1 w-[9rem]">
                                {particular && (
                                  <input
                                    type="number"
                                    value={currentParticular.quantity}
                                    onChange={(e) => handleParticularChange('quantity', e.target.value)}
                                    placeholder="Qty"
                                    className="w-full h-full px-2 border rounded text-xs"
                                  />
                                )}
                              </div>
                              <div className="h-10 w-[9rem] p-1">
                                {particular && (
                                  <input
                                    type="number"
                                    value={currentParticular.unitPrice}
                                    onChange={(e) => handleParticularChange('unitPrice', e.target.value)}
                                    placeholder="Price"
                                    className="w-full h-full px-2 border rounded text-sm"
                                  />
                                )}
                              </div>
                              <div className="h-10 w-[9rem] p-1">
                                {particular && (
                                  <input
                                    type="number"
                                    value={currentParticular.amount.toFixed(2)}
                                    placeholder="Amount"
                                    className="w-full h-full px-2 border rounded text-sm"
                                    readOnly
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex divide-x-2 divide-black ml-auto mr-[2.1rem]  border-x-2 border-b-2 border-black  w-fit">
                          <div className="w-[16rem] h-fit flex justify-end items-center text-right font-semibold text-xs p-1">TOTAL AMOUNT DUE:</div>
                          <div className="w-[8rem] p-1 text-xs">₱{calculateTotal()}</div>
                        </div>

                        <div className="flex flex-row gap-4">
                          <div flex flex-col>
                            <div className="divide-y-2 divide-black w-[17rem] mr-4 border-2 border-black -mt-4">
                              <div className="text-xs p-2 h-10">
                                <span>Prepared by:</span>
                                <input
                                  type="text"
                                  className="ml-2 h-6 w-1/2 text-xs border-white focus:ring-0 focus:outline-none"
                                  placeholder=""
                                />
                              </div>
                              <div className="text-xs p-2 h-10">
                                <span>Received by:</span>
                                <input
                                  type="text"
                                  className="ml-2 h-6 w-1/2 text-xs border-white focus:ring-0 focus:outline-none"
                                  placeholder=""
                                />
                              </div>
                              <div className="text-xs p-2 h-10">
                                <span>Prepared by:</span>
                                <input
                                  type="text"
                                  className="ml-2 h-6 w-1/2 text-xs border-white focus:ring-0 focus:outline-none"
                                  placeholder=""
                                />
                              </div>
                            </div>
                            <div>
                              <p className="text-decoration-underline font-semibold text-[10px] mt-2">"THIS DOCUMENT IS NOT VALID FOR CLAIMING INPUT TAX."</p>
                              <p className="text-[8px] -mt-3 font-semibold">THIS BILLING INVOICE SHALL BE VALID FOR FIVE (5) YEARS FROM THE DATE OF ATP.</p>
                            </div>
                          </div>

                          <img src={LongLogo} className="w-60 h-32 mt-2" />
                        </div>
                      </div>
                    </div>

                    <div className="border mt-3 p-5">
                      <div>
                        <p className="italic font-semibold text-[#9D426E] text-sm">ST. JOHN MAJORE SERVICES COMPANY, INC.</p>
                        <p className="text-xs -mt-3">Details of Billing Invoice</p>
                        <p className="text-xs -mt-3">For the period of {selectedGroup.cutoffDate}</p>
                      </div>

                      <div>
                        <p className="text-sm mt-5">Principal: {selectedGroup.project}</p>
                      </div>

                      <div>
                        <table className="min-w-full -ml-[1px] table-auto border-separate border border-black text-sm mt-5">
                          <thead>
                            <tr>
                              <th className=" border border-black text-center  px-4 py-2" rowSpan="2">NO.</th>
                              <th className=" border border-black text-center px-4 py-2" rowSpan="2">EMPLOYEE NAME</th>
                              <th className=" border border-black text-center px-4 py-2" rowSpan="2">DESCRIPTION</th>
                              <th className=" border border-black text-center px-4 py-2" rowSpan="2">PAYROLL RATE</th>
                              <th className=" border border-black text-center px-4 py-2" colSpan="2">REGULAR OVERTIME (excess in 8/hrs/day)</th>
                              <th className=" border border-black text-center px-4 py-2" rowSpan="2">GROSS PAY (DUE TO EMPLOYEES)</th>
                              <th className=" border border-black text-center px-4 py-2" rowSpan="2">ADMIN FEE (10%)</th>
                              <th className=" border border-black text-center px-4 py-2" rowSpan="2">TOTAL AMOUNT</th>
                              <th className=" border border-black text-center px-4 py-2" rowSpan="2">12% VALUE ADDED TAX</th>
                              <th className=" border border-black text-center px-4 py-2" rowSpan="2">TOTAL AMOUNT DUE</th>
                            </tr>
                            <tr>
                              <th className=" border border-black text-center px-4 py-2">Hrs</th>
                              <th className=" border border-black text-center px-4 py-2">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className=" border border-black text-center px-4 py-2">1</td>
                              <td className=" border border-black text-left px-4 py-2">John Doe</td>
                              <td className=" border border-black text-left px-4 py-2">production helper</td>
                              <td className=" border border-black text-right px-4 py-2">502.00</td>
                              <td className=" border border-black text-right px-4 py-2">1.00</td>
                              <td className=" border border-black text-right px-4 py-2">62.66</td>
                              <td className=" border border-black text-right px-4 py-2">62.66</td>
                              <td className=" border border-black text-right px-4 py-2">6.27</td>
                              <td className=" border border-black text-right px-4 py-2">68.92</td>
                              <td className=" border border-black text-right px-4 py-2">8.27</td>
                              <td className=" border border-black text-right px-4 py-2">77.19</td>
                            </tr>
                            <tr>
                              <td className=" border border-black font-semibold text-center px-4 py-2" colSpan="3">TOTAL AMOUNT</td>
                              <td className=" border border-black text-right px-4 py-2">1</td>
                              <td className=" border border-black text-right px-4 py-2">1</td>
                              <td className=" border border-black text-right px-4 py-2">1</td>
                              <td className=" border border-black text-right px-4 py-2">1</td>
                              <td className=" border border-black text-right px-4 py-2">1</td>
                              <td className=" border border-black text-right px-4 py-2">1</td>
                              <td className=" border border-black text-right px-4 py-2">1</td>
                              <td className=" border border-black text-right px-4 py-2">1</td>
                            </tr>
                          </tbody>
                        </table>

                        <div className="flex flex-row gap-4 w-fit border border-black divide-x divide-black text-xs">
                          <div className="px-2">TOTAL APPROVED MAN HOURS</div>
                          <div className="px-2 w-32 text-right">1</div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center mt-20">
                          <div>
                            <p className="text-xs text-left mb-2">Prepared by:</p>
                            <div className="border-t border-black h-6"></div>
                            <p className="text-xs -mt-3">N/A</p>
                            <p className="text-xs -mt-3">Billing Head</p>
                          </div>
                          <div>
                            <p className="text-xs text-left mb-2">Checked by:</p>
                            <div className="border-t border-black h-6"></div>
                            <p className="text-xs -mt-3">N/A</p>
                            <p className="text-xs -mt-3">Finance Head</p>
                          </div>
                          <div>
                            <p className="text-xs text-left mb-2">Received by:</p>
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
                        <FaPrint title="Print" className="text-neutralDGray w-5 h-5" />
                      </button>
                      <button
                        onClick={downloadExcel}
                        className="w-20 h-8 border hover:bg-neutralSilver border-neutralDGray rounded flex items-center justify-center"
                      >
                        <FaRegFileExcel title="Export to Excel" className="text-neutralDGray w-5 h-5" />
                      </button>
                      <button
                        onClick={downloadPDF}
                        className="w-20 h-8 border hover:bg-neutralSilver border-neutralDGray rounded flex items-center justify-center"
                      >
                        <FaRegFilePdf title="Export to PDF" className="text-neutralDGray w-5 h-5" />
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
