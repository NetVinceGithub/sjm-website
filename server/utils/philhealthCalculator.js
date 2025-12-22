
// Updated calculatePHICContribution function
export const calculatePHICContribution = (basicPay) => {
  // PHIC is computed semi-monthly (5% / 2 = 2.5% per cutoff)
  // Employee pays half (1.25%), employer pays half (1.25%)
  const totalPhicRate = 0.05; // 5% total monthly rate
  const semiMonthlyRate = totalPhicRate / 2; // 2.5% per cutoff
  const employeeContribution = basicPay * (semiMonthlyRate / 2); // 1.25% per cutoff
  const employerContribution = basicPay * (semiMonthlyRate / 2); // 1.25% per cutoff
  const totalContribution = basicPay * semiMonthlyRate; // 2.5% per cutoff
  
  return {
    employeeContribution: employeeContribution,
    employerContribution: employerContribution,
    totalContribution: totalContribution,
    basicPay: basicPay
  };
};