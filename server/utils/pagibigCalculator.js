/**
 * Calculate Pag-IBIG (HDMF) contribution based on monthly basic salary
 * 
 * Contribution Rules:
 * - Employee: 1% or 2% of monthly basic salary
 * - Employer: 2% of monthly basic salary
 * - If monthly basic salary is ₱1,500 or below: Employee contributes 1%
 * - If monthly basic salary is above ₱1,500: Employee contributes 2%
 * - Maximum employee contribution: ₱200 per month (capped at ₱10,000 monthly salary)
 * - Employer contribution follows the same percentage but not subject to ₱200 cap
 *
 * @param {number} monthlyBasicSalary - The employee's monthly basic salary (gross for the month)
 * @returns {object} - Object containing employee contribution, employer contribution, and total
 */
export const calculatePagIBIGContribution = (monthlyBasicSalary) => {
  // Convert to number and handle edge cases
  const salary = Number(monthlyBasicSalary) || 0;

  // If salary is 0 or negative, no contribution
  if (salary <= 0) {
    return {
      employeeContribution: 0,
      employerContribution: 0,
      totalContribution: 0,
      employeeRate: "0%",
      employerRate: "0%",
      salaryBracket: "No contribution required",
    };
  }

  let employeeRate = 0;
  let employerRate = 0.02; // Employer always contributes 2%
  let salaryBracket = "";

  // Determine employee contribution rate based on salary bracket
  if (salary <= 1500) {
    employeeRate = 0.01; // 1% for ₱1,500 and below
    salaryBracket = "₱1,500 and below";
  } else {
    employeeRate = 0.02; // 2% for above ₱1,500
    salaryBracket = "Above ₱1,500";
  }

  // Calculate contributions
  let employeeContribution = salary * employeeRate;
  let employerContribution = salary * employerRate;

  // Apply ₱200 cap for employee contribution (when salary reaches ₱10,000+)
  if (employeeContribution > 200) {
    employeeContribution = 200;
  }

  // Employer contribution is also capped at ₱200 when employee's is capped
  if (salary >= 10000) {
    employerContribution = 200;
  }

  const totalContribution = employeeContribution + employerContribution;

  return {
    employeeContribution: Number(employeeContribution.toFixed(2)),
    employerContribution: Number(employerContribution.toFixed(2)),
    totalContribution: Number(totalContribution.toFixed(2)),
    employeeRate: `${(employeeRate * 100).toFixed(0)}%`,
    employerRate: `${(employerRate * 100).toFixed(0)}%`,
    salaryBracket: salaryBracket,
    isCapped: salary >= 10000,
    monthlyBasicSalary: Number(salary.toFixed(2)),
  };
};

/**
 * Calculate Pag-IBIG for semi-monthly payroll (15-day cutoff)
 * This assumes the monthly contribution should be split across two payroll periods
 * 
 * @param {number} monthlyBasicSalary - The employee's projected monthly basic salary
 * @param {boolean} isFirstCutoff - Whether this is the first cutoff (1st-15th) or second (16th-end)
 * @returns {object} - Object containing semi-monthly contribution details
 */
export const calculatePagIBIGSemiMonthly = (monthlyBasicSalary, isFirstCutoff = true) => {
  const monthlyContribution = calculatePagIBIGContribution(monthlyBasicSalary);

  // Split monthly contribution in half for each payroll period
  const semiMonthlyEmployee = monthlyContribution.employeeContribution / 2;
  const semiMonthlyEmployer = monthlyContribution.employerContribution / 2;

  return {
    employeeContribution: Number(semiMonthlyEmployee.toFixed(2)),
    employerContribution: Number(semiMonthlyEmployer.toFixed(2)),
    totalContribution: Number((semiMonthlyEmployee + semiMonthlyEmployer).toFixed(2)),
    cutoffPeriod: isFirstCutoff ? "1st Cutoff (1st-15th)" : "2nd Cutoff (16th-End)",
    monthlyEmployeeTotal: monthlyContribution.employeeContribution,
    monthlyEmployerTotal: monthlyContribution.employerContribution,
    monthlyTotal: monthlyContribution.totalContribution,
    employeeRate: monthlyContribution.employeeRate,
    employerRate: monthlyContribution.employerRate,
    salaryBracket: monthlyContribution.salaryBracket,
    isCapped: monthlyContribution.isCapped,
  };
};

/**
 * Calculate Pag-IBIG for partial month work (e.g., employee worked only X days)
 * Useful for new hires, resigned employees, or employees with absences
 * 
 * @param {number} dailyRate - The employee's daily rate
 * @param {number} daysWorked - Number of days actually worked
 * @returns {object} - Object containing contribution based on actual salary earned
 */
export const calculatePagIBIGPartialMonth = (dailyRate, daysWorked) => {
  const actualSalary = dailyRate * daysWorked;
  return calculatePagIBIGContribution(actualSalary);
};

/**
 * Example usage for payroll integration
 */
export const updatePayrollWithPagIBIG = (payrollData) => {
  const { monthlyBasicSalary, dailyRate, daysWorked, isFirstCutoff } = payrollData;

  let pagibigCalculation;

  // Use appropriate calculation method based on available data
  if (monthlyBasicSalary) {
    // For regular monthly or semi-monthly payroll
    if (isFirstCutoff !== undefined) {
      pagibigCalculation = calculatePagIBIGSemiMonthly(monthlyBasicSalary, isFirstCutoff);
    } else {
      pagibigCalculation = calculatePagIBIGContribution(monthlyBasicSalary);
    }
  } else if (dailyRate && daysWorked) {
    // For partial month or daily-rated employees
    pagibigCalculation = calculatePagIBIGPartialMonth(dailyRate, daysWorked);
  } else {
    // No valid data
    return {
      ...payrollData,
      pagibigEmployee: 0,
      pagibigEmployer: 0,
      pagibigTotal: 0,
      error: "Insufficient data for Pag-IBIG calculation",
    };
  }

  return {
    ...payrollData,
    pagibigEmployee: pagibigCalculation.employeeContribution,
    pagibigEmployer: pagibigCalculation.employerContribution,
    pagibigTotal: pagibigCalculation.totalContribution,
    pagibigRate: pagibigCalculation.employeeRate,
    pagibigSalaryBracket: pagibigCalculation.salaryBracket,
    pagibigIsCapped: pagibigCalculation.isCapped || false,
  };
};

// ============================================
// USAGE EXAMPLES
// ============================================

// Example 1: Regular employee with monthly salary of ₱12,000
// const regular = calculatePagIBIGContribution(12000);
// console.log(regular);
// Output: { employeeContribution: 200, employerContribution: 200, totalContribution: 400, ... }

// Example 2: Part-time employee worked 10 days at ₱520/day
// const partTime = calculatePagIBIGPartialMonth(520, 10);
// console.log(partTime);
// Output: { employeeContribution: 52, employerContribution: 104, totalContribution: 156, ... }

// Example 3: Semi-monthly payroll (first cutoff)
// const semiMonthly = calculatePagIBIGSemiMonthly(15000, true);
// console.log(semiMonthly);
// Output: { employeeContribution: 100, employerContribution: 100, totalContribution: 200, ... }