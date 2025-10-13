/**
 * Calculate PhilHealth (PHIC) contribution based on monthly basic salary
 * 
 * Contribution Rules (2024-2025):
 * - Premium rate: 5% of monthly basic salary (2.5% employee share, 2.5% employer share)
 * - Minimum monthly salary floor: ₱10,000
 * - Maximum monthly salary ceiling: ₱100,000
 * - If monthly salary is ₱10,000 or below: Fixed ₱500 total (₱250 EE + ₱250 ER)
 * - If monthly salary is above ₱10,000: Calculate 5% of actual salary
 * - If monthly salary exceeds ₱100,000: Cap at ₱5,000 total (₱2,500 EE + ₱2,500 ER)
 *
 * @param {number} monthlyBasicSalary - The employee's monthly basic salary
 * @returns {object} - Object containing employee contribution, employer contribution, and total
 */
export const calculatePhilHealthContribution = (monthlyBasicSalary) => {
  // Convert to number and handle edge cases
  const salary = Number(monthlyBasicSalary) || 0;

  // If salary is 0 or negative, no contribution
  if (salary <= 0) {
    return {
      employeeContribution: 0,
      employerContribution: 0,
      totalContribution: 0,
      premiumRate: "5%",
      salaryBracket: "No contribution required",
      isMinimum: false,
      isMaximum: false,
    };
  }

  const PREMIUM_RATE = 0.05; // 5% total (2.5% each for EE and ER)
  const MINIMUM_SALARY_FLOOR = 10000;
  const MAXIMUM_SALARY_CEILING = 100000;
  const MINIMUM_TOTAL_CONTRIBUTION = 500; // ₱250 EE + ₱250 ER
  const MAXIMUM_TOTAL_CONTRIBUTION = 5000; // ₱2,500 EE + ₱2,500 ER

  let employeeContribution = 0;
  let employerContribution = 0;
  let totalContribution = 0;
  let salaryBracket = "";
  let isMinimum = false;
  let isMaximum = false;

  // Apply minimum floor: ₱10,000 and below
  if (salary <= MINIMUM_SALARY_FLOOR) {
    employeeContribution = MINIMUM_TOTAL_CONTRIBUTION / 2; // ₱250
    employerContribution = MINIMUM_TOTAL_CONTRIBUTION / 2; // ₱250
    totalContribution = MINIMUM_TOTAL_CONTRIBUTION; // ₱500
    salaryBracket = "₱10,000 and below (Minimum)";
    isMinimum = true;
  }
  // Apply maximum ceiling: Above ₱100,000
  else if (salary > MAXIMUM_SALARY_CEILING) {
    employeeContribution = MAXIMUM_TOTAL_CONTRIBUTION / 2; // ₱2,500
    employerContribution = MAXIMUM_TOTAL_CONTRIBUTION / 2; // ₱2,500
    totalContribution = MAXIMUM_TOTAL_CONTRIBUTION; // ₱5,000
    salaryBracket = `Above ₱${MAXIMUM_SALARY_CEILING.toLocaleString()} (Maximum)`;
    isMaximum = true;
  }
  // Calculate based on actual salary: Between ₱10,001 and ₱100,000
  else {
    totalContribution = salary * PREMIUM_RATE;
    employeeContribution = totalContribution / 2; // 2.5% of salary
    employerContribution = totalContribution / 2; // 2.5% of salary
    salaryBracket = `₱${MINIMUM_SALARY_FLOOR.toLocaleString()} - ₱${MAXIMUM_SALARY_CEILING.toLocaleString()}`;
  }

  return {
    employeeContribution: Number(employeeContribution.toFixed(2)),
    employerContribution: Number(employerContribution.toFixed(2)),
    totalContribution: Number(totalContribution.toFixed(2)),
    premiumRate: "5% (2.5% EE + 2.5% ER)",
    employeeRate: "2.5%",
    employerRate: "2.5%",
    salaryBracket: salaryBracket,
    isMinimum: isMinimum,
    isMaximum: isMaximum,
    monthlyBasicSalary: Number(salary.toFixed(2)),
  };
};

/**
 * Calculate PhilHealth for semi-monthly payroll (15-day cutoff)
 * Monthly contribution is typically deducted in full during one cutoff (usually 2nd cutoff)
 * or split across two payroll periods
 * 
 * @param {number} monthlyBasicSalary - The employee's monthly basic salary
 * @param {string} deductionSchedule - "full_first", "full_second", or "split"
 * @param {boolean} isFirstCutoff - Whether this is the first cutoff (only used if split)
 * @returns {object} - Object containing semi-monthly contribution details
 */
export const calculatePhilHealthSemiMonthly = (
  monthlyBasicSalary,
  deductionSchedule = "full_second", // Common practice: deduct full amount in 2nd cutoff
  isFirstCutoff = false
) => {
  const monthlyContribution = calculatePhilHealthContribution(monthlyBasicSalary);

  let employeeContribution = 0;
  let employerContribution = 0;
  let cutoffPeriod = isFirstCutoff ? "1st Cutoff (1st-15th)" : "2nd Cutoff (16th-End)";

  switch (deductionSchedule) {
    case "full_first":
      // Deduct full monthly amount in first cutoff
      if (isFirstCutoff) {
        employeeContribution = monthlyContribution.employeeContribution;
        employerContribution = monthlyContribution.employerContribution;
      } else {
        employeeContribution = 0;
        employerContribution = 0;
      }
      break;

    case "full_second":
      // Deduct full monthly amount in second cutoff (most common)
      if (!isFirstCutoff) {
        employeeContribution = monthlyContribution.employeeContribution;
        employerContribution = monthlyContribution.employerContribution;
      } else {
        employeeContribution = 0;
        employerContribution = 0;
      }
      break;

    case "split":
      // Split monthly contribution in half for each payroll period
      employeeContribution = monthlyContribution.employeeContribution / 2;
      employerContribution = monthlyContribution.employerContribution / 2;
      break;

    default:
      throw new Error("Invalid deduction schedule. Use 'full_first', 'full_second', or 'split'");
  }

  return {
    employeeContribution: Number(employeeContribution.toFixed(2)),
    employerContribution: Number(employerContribution.toFixed(2)),
    totalContribution: Number((employeeContribution + employerContribution).toFixed(2)),
    cutoffPeriod: cutoffPeriod,
    deductionSchedule: deductionSchedule,
    monthlyEmployeeTotal: monthlyContribution.employeeContribution,
    monthlyEmployerTotal: monthlyContribution.employerContribution,
    monthlyTotal: monthlyContribution.totalContribution,
    premiumRate: monthlyContribution.premiumRate,
    salaryBracket: monthlyContribution.salaryBracket,
    isMinimum: monthlyContribution.isMinimum,
    isMaximum: monthlyContribution.isMaximum,
  };
};

/**
 * Calculate PhilHealth for partial month work (e.g., employee worked only X days)
 * Useful for new hires, resigned employees, or employees with absences
 * 
 * @param {number} dailyRate - The employee's daily rate
 * @param {number} daysWorked - Number of days actually worked
 * @returns {object} - Object containing contribution based on actual salary earned
 */
export const calculatePhilHealthPartialMonth = (dailyRate, daysWorked) => {
  const actualSalary = dailyRate * daysWorked;
  return calculatePhilHealthContribution(actualSalary);
};

/**
 * Example usage for payroll integration
 */
export const updatePayrollWithPhilHealth = (payrollData) => {
  const {
    monthlyBasicSalary,
    dailyRate,
    daysWorked,
    isFirstCutoff,
    philhealthDeductionSchedule = "full_second",
  } = payrollData;

  let philhealthCalculation;

  // Use appropriate calculation method based on available data
  if (monthlyBasicSalary) {
    // For regular monthly or semi-monthly payroll
    if (isFirstCutoff !== undefined) {
      philhealthCalculation = calculatePhilHealthSemiMonthly(
        monthlyBasicSalary,
        philhealthDeductionSchedule,
        isFirstCutoff
      );
    } else {
      philhealthCalculation = calculatePhilHealthContribution(monthlyBasicSalary);
    }
  } else if (dailyRate && daysWorked) {
    // For partial month or daily-rated employees
    philhealthCalculation = calculatePhilHealthPartialMonth(dailyRate, daysWorked);
  } else {
    // No valid data
    return {
      ...payrollData,
      philhealthEmployee: 0,
      philhealthEmployer: 0,
      philhealthTotal: 0,
      error: "Insufficient data for PhilHealth calculation",
    };
  }

  return {
    ...payrollData,
    philhealthEmployee: philhealthCalculation.employeeContribution,
    philhealthEmployer: philhealthCalculation.employerContribution,
    philhealthTotal: philhealthCalculation.totalContribution,
    philhealthRate: philhealthCalculation.premiumRate,
    philhealthSalaryBracket: philhealthCalculation.salaryBracket,
    philhealthIsMinimum: philhealthCalculation.isMinimum || false,
    philhealthIsMaximum: philhealthCalculation.isMaximum || false,
  };
};