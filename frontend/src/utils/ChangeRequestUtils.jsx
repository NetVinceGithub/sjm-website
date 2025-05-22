// utils/changeRequestUtils.js
import axios from 'axios';

/**
 * Submit a change request for employee payroll information
 * @param {Object} changeData - The change request data
 * @param {number} changeData.employee_id - Employee ID
 * @param {string} changeData.employee_name - Employee name
 * @param {string} changeData.field_name - Field being changed
 * @param {string} changeData.old_value - Current value
 * @param {string} changeData.new_value - New value
 * @param {string} changeData.reason - Reason for change
 * @param {number} changeData.requested_by - ID of user requesting change
 * @returns {Promise} - API response
 */
export const submitChangeRequest = async (changeData) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/change-requests/submit`,
      changeData
    );
    return response.data;
  } catch (error) {
    console.error('Error submitting change request:', error);
    throw error;
  }
};

/**
 * Format field names for display
 * @param {string} fieldName - Internal field name
 * @returns {string} - Human readable field name
 */
export const formatFieldName = (fieldName) => {
  const fieldMap = {
    'daily_rate': 'Daily Rate',
    'holiday_pay': 'Holiday Pay',
    'night_differential': 'Night Differential',
    'allowance': 'Allowance',
    'tax_deduction': 'Tax Deduction',
    'sss_contribution': 'SSS Contribution',
    'pagibig_contribution': 'Pag-IBIG Contribution',
    'philhealth_contribution': 'PhilHealth Contribution',
    'loan': 'Loan',
    'name': 'Name',
    'designation': 'Position'
  };
  return fieldMap[fieldName] || fieldName;
};

/**
 * Validate change request data
 * @param {Object} changeData - Change request data to validate
 * @returns {Object} - Validation result
 */
export const validateChangeRequest = (changeData) => {
  const errors = [];

  if (!changeData.employee_id) {
    errors.push('Employee ID is required');
  }

  if (!changeData.employee_name) {
    errors.push('Employee name is required');
  }

  if (!changeData.field_name) {
    errors.push('Field name is required');
  }

  if (!changeData.new_value) {
    errors.push('New value is required');
  }

  if (changeData.old_value === changeData.new_value) {
    errors.push('New value must be different from current value');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};