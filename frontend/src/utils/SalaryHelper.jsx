import React from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

export const fetchDepartments = async () => {
  let departments;
  try {
    const response = await axios.get('http://localhost:5000/api/department', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (response.data.success) {
      return response.data.departments || []
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      console.error("Error Fetching Departments:", error);
      return [];
    }
  }
};


