import PayslipHistory from "../models/PayslipHistory.js"

export const getInvoices = async (req, res) => {
  try {
    const invoice = await PayslipHistory.findAll({
      raw: true, // Fetches raw data without Sequelize formatting
    });
    console.log("Fetched Data:", invoice); // Log data for debugging
    res.status(200).json({ success: true, invoice });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ success: false, error: "get invoice function error in invoice Controller" });
  }
};


