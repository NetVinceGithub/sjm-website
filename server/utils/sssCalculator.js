/**
 * Calculate SSS contribution based on gross pay
 * Uses the official SSS contribution table for 2024-2025
 * 
 * @param {number} grossPay - The employee's gross pay
 * @returns {object} - Object containing employee contribution, employer contribution, and total
 */
export const calculateSSSContribution = (grossPay) => {
  // SSS Contribution Table 2024-2025
  const sssTable = [
    { min: 0, max: 5249.99, employeeShare: 510.00, employerShare: 250.00 },
    { min: 5250.00, max: 5749.99, employeeShare: 560, employerShare: 275 },
    { min: 5750.00, max: 6749.99, employeeShare: 610.00, employerShare: 300.00 },
    { min: 6250.00, max: 6749.99, employeeShare: 660, employerShare: 325 },
    { min: 6750.00, max: 7249.99, employeeShare: 710.00, employerShare: 350.00 },
    { min: 7250.00, max: 7749.99, employeeShare: 760, employerShare: 375 },
    { min: 7750.00, max: 8249.99, employeeShare: 810.00, employerShare: 400.00 },
    { min: 8250.00, max: 8749.99, employeeShare: 860, employerShare: 425.50 },
    { min: 8750.00, max: 9249.99, employeeShare: 910.00, employerShare: 450.00 },
    { min: 9250.00, max: 9749.99, employeeShare: 960, employerShare: 475 },
    { min: 9750.00, max: 10249.99, employeeShare: 1010.00, employerShare: 500.00 },
    { min: 10250.00, max: 10749.99, employeeShare: 1060, employerShare: 525.50 },
    { min: 10750.00, max: 11249.99, employeeShare: 1110.00, employerShare: 550.00 },
    { min: 11250.00, max: 11749.99, employeeShare: 1160, employerShare: 575 },
    { min: 11750.00, max: 12249.99, employeeShare: 1210.00, employerShare: 600.00 },
    { min: 12250.00, max: 12749.99, employeeShare: 1260, employerShare: 625.50 },
    { min: 12750.00, max: 13249.99, employeeShare: 1310.00, employerShare: 650.00 },
    { min: 13250.00, max: 13749.99, employeeShare: 1360, employerShare: 675 },
    { min: 13750.00, max: 14249.99, employeeShare: 1410.00, employerShare: 700.00 },
    { min: 14250.00, max: 14749.99, employeeShare: 1460, employerShare: 725 },
    { min: 14750.00, max: 15249.99, employeeShare: 1530.00, employerShare: 750.00 },
    { min: 15250.00, max: 15749.99, employeeShare: 1580, employerShare: 775 },
    { min: 15750.00, max: 16249.99, employeeShare: 1630.00, employerShare: 800.00 },
    { min: 16250.00, max: 16749.99, employeeShare: 1680, employerShare: 825 },
    { min: 16750.00, max: 17249.99, employeeShare: 1730.00, employerShare: 850.00 },
    { min: 17250.00, max: 17749.99, employeeShare: 1780, employerShare: 875 },
    { min: 17750.00, max: 18249.99, employeeShare: 1830.00, employerShare: 900.00 },
    { min: 18250.00, max: 18749.99, employeeShare: 1880, employerShare: 925.50 },
    { min: 18750.00, max: 19249.99, employeeShare: 1930.00, employerShare: 950.00 },
    { min: 19250.00, max: 19749.99, employeeShare: 1980, employerShare: 975 },
    { min: 19750.00, max: 20249.99, employeeShare: 2030.00, employerShare: 1000.00 },
    { min: 20250.00, max: 20749.99, employeeShare: 2080, employerShare: 1000 },
    { min: 20750.00, max: 21249.99, employeeShare: 2130.00, employerShare: 1000.00 } 
    
    
    
    
    
    
    // Maximum contribution
  ];

  // Convert grossPay to number and handle edge cases
  const pay = Number(grossPay) || 0;
  
  // If gross pay is 0 or negative, no contribution
  if (pay <= 0) {
    return {
      employeeContribution: 0,
      employerContribution: 0,
      totalContribution: 0,
      salaryRange: "No contribution required"
    };
  }

  // Find the appropriate contribution bracket
  const bracket = sssTable.find(row => pay >= row.min && pay <= row.max);
  
  if (!bracket) {
    // Fallback - should not happen with current table structure
    return {
      employeeContribution: 0,
      employerContribution: 0,
      totalContribution: 0,
      salaryRange: "Invalid salary range"
    };
  }

  const employeeContribution = bracket.employeeShare;
  const employerContribution = bracket.employerShare;
  const totalContribution = employeeContribution + employerContribution;
  
  // Format salary range for display
  const salaryRange = bracket.max === Infinity 
    ? `₱${bracket.min.toLocaleString()} and above`
    : `₱${bracket.min.toLocaleString()} - ₱${bracket.max.toLocaleString()}`;

  return {
    employeeContribution: Number(employeeContribution.toFixed(2)),
    employerContribution: Number(employerContribution.toFixed(2)),
    totalContribution: Number(totalContribution.toFixed(2)),
    salaryRange: salaryRange
  };
};

// Usage example for your payroll system:
export const updatePayrollWithSSS = (payrollData) => {
  const { grossPay } = payrollData;
  const sssCalculation = calculateSSSContribution(grossPay);
  
  return {
    ...payrollData,
    sss: sssCalculation.employeeContribution,
    sssEmployerShare: sssCalculation.employerContribution,
    sssTotalContribution: sssCalculation.totalContribution,
    sssSalaryRange: sssCalculation.salaryRange
  };
};

// Test function to verify calculations
export const testSSSCalculation = () => {
  const testCases = [
    { grossPay: 3000, expected: 180.00 },
    { grossPay: 5000, expected: 225.00 },
    { grossPay: 10000, expected: 450.00 },
    { grossPay: 15000, expected: 675.00 },
    { grossPay: 20000, expected: 900.00 }, // Maximum
    { grossPay: 25000, expected: 900.00 }  // Should still be maximum
  ];
  
  console.log("SSS Calculation Test Results:");
  testCases.forEach(testCase => {
    const result = calculateSSSContribution(testCase.grossPay);
    const passed = result.employeeContribution === testCase.expected;
    console.log(`Gross Pay: ₱${testCase.grossPay.toLocaleString()} | Expected: ₱${testCase.expected} | Got: ₱${result.employeeContribution} | ${passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Range: ${result.salaryRange}`);
  });
};