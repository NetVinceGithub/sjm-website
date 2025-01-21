import Rate from "../models/Rates.js";

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
      tardiness,
    } = req.body;


    const newRate = new Rate({
     
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
    const rates = await Rate.find()
    return res.status(200).json({success:true, rates})
  } catch (error) {
    return res.status(200).json({success:false, error:"Get rates error"});
  }
};


export {addRate, getRates}