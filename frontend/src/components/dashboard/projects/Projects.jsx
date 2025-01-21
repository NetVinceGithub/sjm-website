import React from 'react'
import { Link } from 'react-router-dom'

const Projects = () => {
  return (
    <div>
    <h1>Project Dashboard </h1>
    <div className="text-center">
      <h3 className="text-2xl font-bold">Manage Projects</h3>
    </div>
    <div className="flex justify-between items-center">
      <input
        type="text"
        placeholder="Search by Name"
        className="px-4 py-0.5 border"
      />
      <Link
        to="/admin-dashboard/add-project"
        className="px-4 py-1 bg-teal-600 rounded text-white"
      >
        Add Project
      </Link>
    </div>
    
    

  
  </div>
  )
}

export default Projects