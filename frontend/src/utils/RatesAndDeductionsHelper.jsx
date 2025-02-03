import axios from 'axios'
import { useNavigate } from 'react-router-dom';

export const columns = [
  {
    name: "Daily Rate", 
    selector: (row) => row.dailyRate,
    width: "90px"
  },
  {
    name: "Basic Pay", 
    selector: (row) => row.basicPay,
    width: "70px"
  },
  {
    name: "Hourly Rate", 
    selector: (row) => row.hourlyRate,
    width: "70px"
  },
  {
    name: "Ot Rate Regular", 
    selector: (row) => row.otRateRegular,
    sortable: true,
    width: "100px"
  },
  {
    name: "Ot Rate Special Holiday", 
    selector: (row) => row.otRateSpecialHoliday,
    width: "120px"
  },
  {
    name: "Ot Rate Regular Holiday", 
    selector: (row) => row.otRateRegularHoliday,
    width: "90px"
  },
  {
    name: "Special Holiday Rate", 
    selector: (row) => row.specialHolidayRate,
    width: "70px"
  },
  {
    name: "Regular Holiday Rate", 
    selector: (row) => row.regularHolidayRate,
    width: "70px"
  },
  {
    name: "Special Holiday Ot Rate", 
    selector: (row) => row.specialHolidayOtRate,
    sortable: true,
    width: "100px"
  },
  {
    name: "Regular Holiday Ot Rate", 
    selector: (row) => row.regularHolidayOtRate,
    width: "120px"
  }
  ,
  {
    name: "ND Rate", 
    selector: (row) => row.ndRate,
    sortable: true,
    width: "100px"
  },
  {
    name: "Tardiness", 
    selector: (row) => row.tardiness,
    width: "120px"
  }
];


export const RatesAndDeductionsButtons = ({ Id }) => {
  const navigate = useNavigate();

  if (!Id) {
    console.log("Error: Missing Id in RatesAndDeductionsButtons");
    return null;
  }

  return (
    <div className="flex gap-2 justify-center items-center flex-nowrap">
      <button
        className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        onClick={() => navigate(`/admin-dashboard/rates/edit/${Id}`)}
      >
        Edit
      </button>
    </div>
  );
};

