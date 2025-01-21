import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmloyeeDashboard";
import PrivateRoutes from "./utils/PrivateRoutes";
import RoleBaseRoutes from "./utils/RoleBaseRoutes";
import AdminSummary from "./components/dashboard/dashboard/AdminSummary";
import DepartmentList from "./components/dashboard/department/DepartmentList";
import AddDepartment from "./components/dashboard/department/AddDepartment";
import EditDepartment from "./components/dashboard/department/EditDepartment";
import List from "./components/dashboard/employee/List";
import Add from "./components/dashboard/employee/Add";
import View from "./components/dashboard/employee/View";
import Edit from "./components/dashboard/employee/Edit";
import EmployeeIDCard from "./components/dashboard/EmployeeIDCard";
import Payslip from "./components/dashboard/salary/Payslip";
import AdminLounge from "./components/admin/AdminLounge";
import PayrollSystemData from "./components/dashboard/salary/PayrollSystemData";
import PayrollDashboard from "./components/dashboard/salary/PayrollDashboard";
import Projects from "./components/dashboard/projects/Projects";
import AddProject from "./components/dashboard/projects/AddProject";



function App() {
  return (
    
    <>
    <div>
      <EmployeeIDCard />
    </div>
      <BrowserRouter>
      <Routes>
        {/* Redirect "/" to the admin dashboard */}
        <Route path="/" element={<Navigate to="/admin-dashboard" />} />

        {/* Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Admin Dashboard Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoutes>
              <RoleBaseRoutes requiredRole={["admin"]}>
                <AdminDashboard />
              </RoleBaseRoutes>
            </PrivateRoutes>
          }
        >
          <Route index element={<AdminSummary />} />
          <Route path="departments" element={<DepartmentList />} /> 
          <Route path="add-department" element={<AddDepartment />} />
          <Route path="department/:id" element={<EditDepartment />} />

          <Route path="employees" element={<List />} />
          <Route path="add-employee" element={<Add />} />
          <Route path="employees/:id" element={<View />} />
          <Route path="employees/edit/:id" element={<Edit />} />
          <Route path="employees/payslip/:id" element={<Payslip />} />
          <Route path="employees/employee_id/:id" element={<EmployeeIDCard />} />
          <Route path="lounge" element={<AdminLounge />} />
          <Route path="employees/rates" element={<PayrollSystemData />} />
          <Route path="payroll-dashboard" element={<PayrollDashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="add-project" element={<AddProject />} />
          
        </Route>

        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />






      </Routes>
    </BrowserRouter>
    </>
    
  );
}

export default App;
