import Holidays from "../models/Holidays.js";
import HolidayRates from "../models/HolidayRates.js";


export const getHolidays = async (req, res) => {
  try {
    const holidays = await Holidays.findAll({ raw: true });
    res.status(200).json({ success: true, holidays });
  } catch (error) {
    console.error("Error fetching holidays:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addHoliday = async (req, res) => {
  try {
    const { name, date, type } = req.body;

    console.log('Received holiday data:', { name, date, type }); // Detailed logging

    if (!name || !date || !type) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, date, and type are required",
        receivedData: { name, date, type }
      });
    }

    const newHoliday = await Holidays.create({ name, date, type });
    res.status(201).json({ success: true, message: "Holiday added successfully", newHoliday });
  } catch (error) {
    console.error("Detailed error adding holiday:", {
      message: error.message,
      stack: error.stack,
      errors: error.errors // Sequelize validation errors
    });
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.errors // Send more error details
    });
  }
};

export const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const holiday = await Holidays.findByPk(id);

    if (!holiday) {
      return res.status(404).json({ success: false, message: "Holiday not found" });
    }

    await holiday.destroy();
    res.status(200).json({ success: true, message: "Holiday deleted successfully" });
  } catch (error) {
    console.error("Error deleting holiday:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};



// Get current holiday rates (there should be only one row)
export const getHolidayRates = async (req, res) => {
  try {
    let rates = await HolidayRates.findOne();

    // If no rates found, create default
    if (!rates) {
      rates = await HolidayRates.create({
        regular: 1,
        special: 1,
        specialNonWorking: 1,
      });
    }

    res.status(200).json({
      success: true,
      rates: {
        regular: rates.regular,
        special: rates.special,
        specialNonWorking: rates.specialNonWorking,
      },
    });
  } catch (error) {
    console.error("Error fetching holiday rates:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create or update holiday rates
export const setHolidayRates = async (req, res) => {
  try {
    const { regular, special, specialNonWorking } = req.body;

    if (
      regular === undefined ||
      special === undefined ||
      specialNonWorking === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All holiday rates (regular, special, specialNonWorking) must be provided",
      });
    }

    let rates = await HolidayRates.findOne();

    if (rates) {
      // Update existing
      rates.regular = regular;
      rates.special = special;
      rates.specialNonWorking = specialNonWorking;
      await rates.save();
    } else {
      // Create new
      rates = await HolidayRates.create({
        regular,
        special,
        specialNonWorking,
      });
    }

    res.status(200).json({
      success: true,
      message: "Holiday rates saved successfully",
      rates,
    });
  } catch (error) {
    console.error("Error saving holiday rates:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
