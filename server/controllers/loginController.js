// loginController.js
import User from '../models/User.js';
import LoginHistory from '../models/LoginHistory.js';



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