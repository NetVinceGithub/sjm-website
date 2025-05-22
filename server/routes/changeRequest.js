// routes/changeRequests.js
import express from 'express';
import { DataTypes, Op } from 'sequelize';
import sequelize from '../db/db.js';

const router = express.Router();

// Define the ChangeRequest model
const ChangeRequest = sequelize.define('change_request', {
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  employee_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  field_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  old_value: DataTypes.TEXT,
  new_value: DataTypes.TEXT,
  reason: DataTypes.TEXT,
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  requested_by: DataTypes.INTEGER,
  reviewed_by: DataTypes.INTEGER,
  requested_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  reviewed_at: DataTypes.DATE,
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Ensure the table exists
await ChangeRequest.sync();

// Submit a change request
router.post('/submit', async (req, res) => {
  try {
    const data = await ChangeRequest.create(req.body);
    res.json({
      success: true,
      message: 'Change request submitted successfully',
      requestId: data.id,
    });
  } catch (error) {
    console.error('Error submitting change request:', error);
    res.status(500).json({ success: false, message: 'Failed to submit change request' });
  }
});

// Get all pending change requests
router.get('/pending', async (req, res) => {
  try {
    const requests = await ChangeRequest.findAll({
      where: { status: 'pending' },
      order: [['requested_at', 'DESC']],
    });
    res.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching change requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch change requests' });
  }
});

// Approve a change request
router.post('/approve/:id', async (req, res) => {
  try {
    const { reviewed_by } = req.body;
    const id = req.params.id;
    const request = await ChangeRequest.findOne({ where: { id, status: 'pending' } });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Change request not found or already processed' });
    }

    // Apply the change if needed (here you might want to update another table)
    // Example: await Employee.update({ [request.field_name]: request.new_value }, { where: { id: request.employee_id } });

    request.status = 'approved';
    request.reviewed_by = reviewed_by;
    request.reviewed_at = new Date();
    await request.save();

    res.json({ success: true, message: 'Change request approved' });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ success: false, message: 'Failed to approve request' });
  }
});

// Reject a change request
router.post('/reject/:id', async (req, res) => {
  try {
    const { reviewed_by, rejection_reason } = req.body;
    const id = req.params.id;
    const request = await ChangeRequest.findOne({ where: { id, status: 'pending' } });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Change request not found or already processed' });
    }

    request.status = 'rejected';
    request.reviewed_by = reviewed_by;
    request.reviewed_at = new Date();
    request.reason = rejection_reason || 'Rejected by admin';
    await request.save();

    res.json({ success: true, message: 'Change request rejected' });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ success: false, message: 'Failed to reject request' });
  }
});

export default router;
