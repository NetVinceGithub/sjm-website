// loginController.js
import LoginRecord from '../models/LoginRecord.js';
import User from '../models/User.js';
import LoginHistory from '../models/LoginHistory.js';

export const getLoginRecords = async (req, res) => {
  try {
    // Fetch login records, optionally with pagination
    const loginRecords = await LoginRecord.findAll({
      order: [['loginTime', 'DESC']],
      limit: 100 // Limit to most recent 100 records
    });

    res.status(200).json({ 
      success: true, 
      loginRecords 
    });
  } catch (error) {
    console.error('Error fetching login records:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve login records' 
    });
  }
};

export const getLoginHistory = async (req, res) => {
  try {
    const logs = await LoginHistory.findAll({
      include: {
        model: User,
        attributes: ['id', 'name', 'email'],
      },
      order: [['loginTime', 'DESC']],
    });

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('Login History Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};