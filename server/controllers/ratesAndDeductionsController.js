import RatesAndDeductions from "../models/RatesAndDeductions.js";

const addRate = async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const {

      dailyRate,
      basicPay,
      hourlyRate,
      otRateRegular,
      otRateSpecialHoliday,
      otRateRegularHoliday,
      specialHolidayRate,
      regularHolidayRate,
      specialHolidayOtRate,
      regularHolidayOtRate,
      ndRate,
      sss,
      phic,
      hdmf,
      hmo,
      tardiness,
    } = req.body;


    const newRate = new RatesAndDeductions({
     
      dailyRate,
      basicPay,
      hourlyRate,
      otRateRegular,
      otRateSpecialHoliday,
      otRateRegularHoliday,
      specialHolidayRate,
      regularHolidayRate,
      specialHolidayOtRate,
      regularHolidayOtRate,
      ndRate,
      sss,
      phic,
      hdmf,
      hmo,
      tardiness,
    });

    await newRate.save();

    return res.status(200).json({
      success: true,
      message: "Rate added successfully.",
      rate: newRate,
    });
  } catch (error) {
    console.error("Error adding rate:", error.message, error.stack); // Log error details
    return res.status(500).json({
      success: false,
      error: "Failed to add rate. Server error.",
    });
  }
};


const getRates = async (req, res)=>{
  try{
    const rates = await RatesAndDeductions.find()
    return res.status(200).json({success:true, rates})
  } catch (error) {
    return res.status(200).json({success:false, error:"Get rates error"});
  }
};

const getRate = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching rate for ID:", id); // Debugging

    if (!id) {
      return res.status(400).json({ success: false, error: "ID is required" });
    }

    const rate = await RatesAndDeductions.findById(id);

    if (!rate) {
      return res.status(404).json({ success: false, error: "Rate not found" });
    }

    return res.status(200).json({ success: true, rate });
  } catch (error) {
    console.error("Error fetching rate by ID:", error); // Log full error
    return res.status(500).json({
      success: false,
      error: error.message || "Error fetching rate by ID",
    });
  }
};




const updateRates = async (req, res) => {
  try {
    console.log("Request body:", req.files);

    const {

      dailyRate,
      basicPay,
      hourlyRate,
      otRateRegular,
      otRateSpecialHoliday,
      otRateRegularHoliday,
      specialHolidayRate,
      regularHolidayRate,
      specialHolidayOtRate,
      regularHolidayOtRate,
      ndRate,
      sss,
      phic,
      hdmf,
      hmo,
      tardiness,
    } = req.body;

    const { id } = req.params;
    const rates = await RatesAndDeductions.findById(id);
   
    rates.dailyRate = dailyRate || rates.dailyRate;
    rates.basicPay = basicPay || rates.basicPay;
    rates.hourlyRate = hourlyRate || rates.hourlyRate;
    rates.otRateRegular = otRateRegular || rates.otRateRegular;
    rates.otRateSpecialHoliday = otRateSpecialHoliday || rates.otRateSpecialHoliday;
    rates.otRateRegularHoliday =  otRateRegularHoliday || rates.otRateRegularHoliday;
    rates.specialHolidayRate = specialHolidayRate || rates.specialHolidayRate;
    rates.regularHolidayRate = regularHolidayRate || rates.regularHolidayRate;
    rates.specialHolidayOtRate = specialHolidayOtRate || rates.specialHolidayOtRate;
    rates.regularHolidayOtRate = regularHolidayOtRate || rates.regularHolidayOtRate;
    rates.ndRate = ndRate || rates.ndRate;
    rates.sss = sss || rates.sss;
    rates.phic = phic || rates.phic;
    rates.hdmf = hdmf || rates.hdmf;
    rates.hmo = hmo || rates.hmo;
    rates.tardiness = tardiness || rates.tardiness;

    await rates.save();

   res.status(200).json({
      success: true,
      message: "Rate Updated successfully.",
      rate: newRate,
    });
  } catch (error) {
    console.error("Error Updating rate:", error.message, error.stack); // Log error details
   res.status(500).json({
      success: false,
      error: "Failed to add rate. Server error.",
    });
  }
};



export {addRate, getRates, updateRates, getRate}