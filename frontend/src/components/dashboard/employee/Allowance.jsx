import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const Allowance = () => {
  const [allowance, setAllowance] = useState([])
  const { id } = useParams();

  useEffect(()=>{
    const fetchAllowance = async () => {
      try{
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/allowance/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.data.success) {
          console.log(response.data.allowance)
          setAllowance(response.data.allowance)
        } else {
          console.error('Error fetching allowance |Allowance.jsx|')
        }




      } catch (error){
        console.error("Error fetching allowance |Allowance.jsx|")
      }
    };
    fetchAllowance();
    

  }, [id])






  return(
    <div>
      Allowance
    </div>
  )
}

export default Allowance