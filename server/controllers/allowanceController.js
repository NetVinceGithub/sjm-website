import Allowance from "../models/Allowance.js"; 

// Get Allowance by Employee ID
export const getAllowance = async (req, res) => {
  try {
      const { id } = req.params;
      console.log("Fetching allowance for employee ID:", id);

      const allowances = await Allowance.find({ employee: id });

      if (!allowances || allowances.length === 0) {
          console.log("No allowances found for this employee.");
          return res.status(404).json({ message: "No allowances found for this employee." });
      }

      console.log("Allowance data:", allowances);
      res.status(200).json({ success: true, allowance: allowances });
  } catch (error) {
      console.error("Error fetching allowance:", error);
      res.status(500).json({ message: "Server error. Please try again later." });
  }
};

