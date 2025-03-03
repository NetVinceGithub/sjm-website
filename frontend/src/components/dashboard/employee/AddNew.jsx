import React from 'react';
import Breadcrumb from '../dashboard/Breadcrumb';

const AddNew = () => {
  return(
    <div className="p-6 pt-20">
      <Breadcrumb
        items={[
          { label: "Employee", href: "" },
          { label: "Masterlist", href: "/admin-dashboard/employees" },
          { label: "Add Employee", href: "" },
        ]}
      />
    </div>
  )
}

export default AddNew