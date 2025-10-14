import React from "react";

export default function BatchPayslipsModal({ batch, onClose }) {
  if (!batch) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-5 rounded w-3/4 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          Payslips for {batch.cutoffDate}
        </h2>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Employee Name</th>
              <th className="p-2 border">Net Pay</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {batch.payslips.map((pay) => (
              <tr key={pay.id}>
                <td className="p-2 border">{pay.name}</td>
                <td className="p-2 border">₱{pay.netPay}</td>
                <td className="p-2 border">{pay.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
