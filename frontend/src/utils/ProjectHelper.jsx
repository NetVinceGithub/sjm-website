import axios from "axios";


export const fetchEmployees = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/employee', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (response.data.success) {
      return response.data.employees;
    }
  } catch (error) {
    console.error("Error fetching Employees in employee project helper:", error);
    return [];
  }
};


