// components/EditPayrollModal.jsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import { submitChangeRequest, validateChangeRequest, formatFieldName } from '../../../utils/changeRequestUtils';

const EditPayrollModal = ({ employee, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (employee && isOpen) {
      const initialData = {
        name: employee.name || '',
        designation: employee.designation || '',
        daily_rate: employee.daily_rate || '0',
        holiday_pay: employee.holiday_pay || '0',
        night_differential: employee.night_differential || '0',
        allowance: employee.allowance || '0',
        tax_deduction: employee.tax_deduction || '0',
        sss_contribution: employee.sss_contribution || '0',
        pagibig_contribution: employee.pagibig_contribution || '0',
        philhealth_contribution: employee.philhealth_contribution || '0',
        loan: employee.loan || '0'
      };
      setFormData(initialData);
      setOriginalData(initialData);
      setReason('');
      setErrors([]);
    }
  }, [employee, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getChangedFields = () => {
    const changes = [];
    Object.keys(formData).forEach(field => {
      if (formData[field] !== originalData[field]) {
        changes.push({
          field_name: field,
          old_value: originalData[field],
          new_value: formData[field]
        });
      }
    });
    return changes;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const changes = getChangedFields();

      if (changes.length === 0) {
        setErrors(['No changes detected']);
        setLoading(false);
        return;
      }

      if (!reason.trim()) {
        setErrors(['Please provide a reason for the changes']);
        setLoading(false);
        return;
      }

      // Submit each change as a separate request
      const requests = changes.map(change => ({
        employee_id: employee.employeeId || employee.id,
        employee_name: employee.name,
        field_name: change.field_name,
        old_value: change.old_value,
        new_value: change.new_value,
        reason: reason.trim(),
        requested_by: 1 // Replace with actual user ID
      }));

      const results = await Promise.all(
        requests.map(request => submitChangeRequest(request))
      );

      const successCount = results.filter(result => result.success).length;
      const failureCount = results.length - successCount;

      if (successCount > 0) {
        onSuccess && onSuccess(`${successCount} change request(s) submitted successfully`);
        onClose();
      }

      if (failureCount > 0) {
        setErrors([`Failed to submit ${failureCount} change request(s)`]);
      }

    } catch (error) {
      console.error('Error submitting change requests:', error);
      setErrors(['Failed to submit change requests. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const renderFormField = (field, label, type = 'text') => {
    const isChanged = formData[field] !== originalData[field];
    
    return (
      <div key={field} className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {isChanged && <span className="text-blue-500 ml-1">*</span>}
        </label>
        <input
          type={type}
          value={formData[field] || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isChanged ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
          }`}
          step={type === 'number' ? '0.01' : undefined}
        />
        {isChanged && (
          <p className="text-xs text-blue-600 mt-1">
            Changed from: {originalData[field]}
          </p>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  const changedFields = getChangedFields();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Edit Payroll Information - {employee?.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <ul className="text-red-600 text-sm">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Employee Information */}
              <div className="col-span-full">
                <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">
                  Employee Information
                </h3>
              </div>
              
              {renderFormField('name', 'Name')}
              {renderFormField('designation', 'Position')}

              {/* Compensation */}
              <div className="col-span-full">
                <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2 mt-4">
                  Compensation
                </h3>
              </div>
              
              {renderFormField('daily_rate', 'Daily Rate', 'number')}
              {renderFormField('holiday_pay', 'Holiday Pay', 'number')}
              {renderFormField('night_differential', 'Night Differential', 'number')}
              {renderFormField('allowance', 'Allowance', 'number')}

              {/* Deductions */}
              <div className="col-span-full">
                <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2 mt-4">
                  Deductions
                </h3>
              </div>
              
              {renderFormField('tax_deduction', 'Tax Deduction', 'number')}
              {renderFormField('sss_contribution', 'SSS Contribution', 'number')}
              {renderFormField('pagibig_contribution', 'Pag-IBIG Contribution', 'number')}
              {renderFormField('philhealth_contribution', 'PhilHealth Contribution', 'number')}
              {renderFormField('loan', 'Loan', 'number')}
            </div>

            {/* Changes Summary */}
            {changedFields.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <h4 className="font-medium text-yellow-800 mb-2">
                  Summary of Changes ({changedFields.length})
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {changedFields.map((change, index) => (
                    <li key={index}>
                      <strong>{formatFieldName(change.field_name)}:</strong>{' '}
                      <span className="line-through">{change.old_value}</span>{' '}
                      → <span className="font-medium">{change.new_value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reason for changes */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Changes <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for these changes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {changedFields.length > 0 ? (
              <span className="text-blue-600">
                {changedFields.length} field(s) modified
              </span>
            ) : (
              'No changes made'
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || changedFields.length === 0 || !reason.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FaSave size={14} />
                  Submit Change Request
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPayrollModal;