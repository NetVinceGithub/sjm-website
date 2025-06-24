/**
 * Calculate SSS contribution based on gross pay
 * Uses the official SSS contribution table for 2024-2025
 * EC (Employee Compensation) is only added during the second cut-off period (3rd to 4th week)
 *
 * @param {number} grossPay - The employee's gross pay
 * @param {boolean} isSecondCutoff - Whether this is the second cut-off period (3rd to 4th week)
 * @returns {object} - Object containing employee contribution, employer contribution, EC, and total
 */
export const calculateSSSContribution = (grossPay, isSecondCutoff = false) => {
  // SSS Contribution Table 2024-2025
  const sssTable = [
    {
      min: 0,
      max: 5249.99,
      employeeShare: 250.0,
      employerShare: 500.0,
      ec: 10.0,
    },
    {
      min: 5250.0,
      max: 5749.99,
      employeeShare: 275,
      employerShare: 550,
      ec: 10.0,
    },
    {
      min: 5750.0,
      max: 6249.99,
      employeeShare: 300.0,
      employerShare: 600.0,
      ec: 10.0,
    },
    {
      min: 6250.0,
      max: 6749.99,
      employeeShare: 325,
      employerShare: 650,
      ec: 10.0,
    },
    {
      min: 6750.0,
      max: 7249.99,
      employeeShare: 350.0,
      employerShare: 700.0,
      ec: 10.0,
    },
    {
      min: 7250.0,
      max: 7749.99,
      employeeShare: 375,
      employerShare: 750,
      ec: 10.0,
    },
    {
      min: 7750.0,
      max: 8249.99,
      employeeShare: 400.0,
      employerShare: 800.0,
      ec: 10.0,
    },
    {
      min: 8250.0,
      max: 8749.99,
      employeeShare: 425,
      employerShare: 850,
      ec: 10.0,
    },
    {
      min: 8750.0,
      max: 9249.99,
      employeeShare: 450.0,
      employerShare: 900.0,
      ec: 10.0,
    },
    {
      min: 9250.0,
      max: 9749.99,
      employeeShare: 475,
      employerShare: 950,
      ec: 10.0,
    },
    {
      min: 9750.0,
      max: 10249.99,
      employeeShare: 500.0,
      employerShare: 1000.0,
      ec: 10.0,
    },
    {
      min: 10250.0,
      max: 10749.99,
      employeeShare: 525,
      employerShare: 1050,
      ec: 10.0,
    },
    {
      min: 10750.0,
      max: 11249.99,
      employeeShare: 550.0,
      employerShare: 1100.0,
      ec: 10.0,
    },
    {
      min: 11250.0,
      max: 11749.99,
      employeeShare: 575,
      employerShare: 1150,
      ec: 10.0,
    },
    {
      min: 11750.0,
      max: 12249.99,
      employeeShare: 600.0,
      employerShare: 1200.0,
      ec: 10.0,
    },
    {
      min: 12250.0,
      max: 12749.99,
      employeeShare: 625,
      employerShare: 1250,
      ec: 10.0,
    },
    {
      min: 12750.0,
      max: 13249.99,
      employeeShare: 650.0,
      employerShare: 1300.0,
      ec: 10.0,
    },
    {
      min: 13250.0,
      max: 13749.99,
      employeeShare: 675,
      employerShare: 1350,
      ec: 10.0,
    },
    {
      min: 13750.0,
      max: 14249.99,
      employeeShare: 700.0,
      employerShare: 1400.0,
      ec: 10.0,
    },
    {
      min: 14250.0,
      max: 14749.99,
      employeeShare: 725,
      employerShare: 1450,
      ec: 10.0,
    },
    {
      min: 14750.0,
      max: 15249.99,
      employeeShare: 750.0,
      employerShare: 1500.0,
      ec: 30.0,
    },
    {
      min: 15250.0,
      max: 15749.99,
      employeeShare: 775,
      employerShare: 1550,
      ec: 30.0,
    },
    {
      min: 15750.0,
      max: 16249.99,
      employeeShare: 800.0,
      employerShare: 1600.0,
      ec: 30.0,
    },
    {
      min: 16250.0,
      max: 16749.99,
      employeeShare: 825,
      employerShare: 1650,
      ec: 30.0,
    },
    {
      min: 16750.0,
      max: 17249.99,
      employeeShare: 850.0,
      employerShare: 1700.0,
      ec: 30.0,
    },
    {
      min: 17250.0,
      max: 17749.99,
      employeeShare: 875,
      employerShare: 1750,
      ec: 30.0,
    },
    {
      min: 17750.0,
      max: 18249.99,
      employeeShare: 900.0,
      employerShare: 1800.0,
      ec: 30.0,
    },
    {
      min: 18250.0,
      max: 18749.99,
      employeeShare: 925,
      employerShare: 1850,
      ec: 30.0,
    },
    {
      min: 18750.0,
      max: 19249.99,
      employeeShare: 950.0,
      employerShare: 1900.0,
      ec: 30.0,
    },
    {
      min: 19250.0,
      max: 19749.99,
      employeeShare: 975,
      employerShare: 1950,
      ec: 30.0,
    },
    {
      min: 19750.0,
      max: 20249.99,
      employeeShare: 1000.0,
      employerShare: 2000.0,
      ec: 30.0,
    },
    {
      min: 20250.0,
      max: 20749.99,
      employeeShare: 1000,
      employerShare: 2050,
      ec: 30.0,
    },
    {
      min: 20750.0,
      max: 21249.99,
      employeeShare: 1000.0,
      employerShare: 2100.0,
      ec: 30.0,
    },
  ];

  // Convert grossPay to number and handle edge cases
  const pay = Number(grossPay) || 0;

  // If gross pay is 0 or negative, no contribution
  if (pay <= 0) {
    return {
      employeeContribution: 0,
      employerContribution: 0,
      ecContribution: 0,
      totalContribution: 0,
      salaryRange: "No contribution required",
    };
  }

  // Find the appropriate contribution bracket
  const bracket = sssTable.find((row) => pay >= row.min && pay <= row.max);

  if (!bracket) {
    // Fallback - should not happen with current table structure
    return {
      employeeContribution: 0,
      employerContribution: 0,
      ecContribution: 0,
      totalContribution: 0,
      salaryRange: "Invalid salary range",
    };
  }

  const employeeContribution = bracket.employeeShare;
  const employerContribution = bracket.employerShare;

  // EC is only applied during the second cut-off period
  const ecContribution = isSecondCutoff ? bracket.ec : 0;

  const totalContribution =
    employeeContribution + employerContribution + ecContribution;

  // Format salary range for display
  const salaryRange =
    bracket.max === Infinity
      ? `₱${bracket.min.toLocaleString()} and above`
      : `₱${bracket.min.toLocaleString()} - ₱${bracket.max.toLocaleString()}`;

  return {
    employeeContribution: Number(employeeContribution.toFixed(2)),
    employerContribution: Number(employerContribution.toFixed(2)),
    ecContribution: Number(ecContribution.toFixed(2)),
    totalContribution: Number(totalContribution.toFixed(2)),
    salaryRange: salaryRange,
  };
};

/**
 * Determine if current date falls within the second cut-off period
 * Second cut-off is typically from 16th to end of month
 * @param {Date} date - The date to check (defaults to current date)
 * @returns {boolean} - True if within second cut-off period
 */
export const isSecondCutoffPeriod = (date = new Date()) => {
  const dayOfMonth = date.getDate();
  return dayOfMonth >= 16;
};

/**
 * Calculate SSS contribution with automatic cut-off detection
 * @param {number} grossPay - The employee's gross pay
 * @param {Date} payrollDate - The payroll date (defaults to current date)
 * @returns {object} - Object containing contribution details
 */
export const calculateSSSWithCutoff = (grossPay, payrollDate = new Date()) => {
  const isSecondCutoff = isSecondCutoffPeriod(payrollDate);
  return calculateSSSContribution(grossPay, isSecondCutoff);
};

// Usage example for your payroll system:
export const updatePayrollWithSSS = (payrollData, payrollDate = new Date()) => {
  const { grossPay } = payrollData;
  const sssCalculation = calculateSSSWithCutoff(grossPay, payrollDate);

  return {
    ...payrollData,
    sss: sssCalculation.employeeContribution,
    sssEmployerShare: sssCalculation.employerContribution,
    sssEC: sssCalculation.ecContribution,
    sssTotalContribution: sssCalculation.totalContribution,
    sssSalaryRange: sssCalculation.salaryRange,
    isSecondCutoff: isSecondCutoffPeriod(payrollDate),
  };
};
