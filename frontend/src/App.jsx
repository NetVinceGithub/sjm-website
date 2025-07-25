import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmloyeeDashboard";
import PrivateRoutes from "./utils/PrivateRoutes";
import RoleBaseRoutes from "./utils/RoleBaseRoutes";
import DepartmentList from "./components/dashboard/department/DepartmentList";
import AddDepartment from "./components/dashboard/department/AddDepartment";
import EditDepartment from "./components/dashboard/department/EditDepartment";
import List from "./components/dashboard/employee/List";
import View from "./components/dashboard/employee/View";
import Edit from "./components/dashboard/employee/Edit";
import Allowance from "./components/dashboard/employee/Allowance";
import EmployeeIDCard from "./components/dashboard/EmployeeIDCard";
import Payslip from "./components/dashboard/payroll/PayslipModal";
import AdminLounge from "./components/admin/AdminLounge";
import PayrollSystemData from "./components/dashboard/salary/PayrollSystemData";
import Projects from "./components/dashboard/projects/Projects";
import AddProject from "./components/dashboard/projects/AddProject";
import EditProject from "./components/dashboard/projects/EditProject";
import CreatePayroll from "./components/dashboard/payroll/CreatePayroll";
import RatesDashboard from "./components/dashboard/salary/RatesDashboard";
import AddRatesAndDeductions from "./components/dashboard/salary/AddRatesAndDeductions";
import EditRatesAndDeductions from "./components/dashboard/salary/EditRatesAndDeductions";
import EmployeePayrollData from "./components/dashboard/payroll/EmployeePayrollData";
import AddMasterlist from "./components/dashboard/employee/AddMasterlist";
import PayslipHistory from "./components/dashboard/dashboard/PayslipHistory";
import EmployeePayslipHistory from "./components/dashboard/payroll/EmployeePayslipHistory";
import EmployeePayrollInformationsList from "./components/dashboard/employee/EmployeePayrollInformationsList";
import InvoiceList from "./components/dashboard/invoice/InvoiceList";
import ClientList from "./components/dashboard/invoice/ClientList";
import AddClient from "./components/dashboard/invoice/AddClient";
import Attendance from "./components/dashboard/attendance/Attendance";
import Menu from "./components/dashboard/dashboard/Menu";
import "bootstrap/dist/css/bootstrap.min.css";

import Overview from "./components/dashboard/dashboard/Overview";
import AddNew from "./components/dashboard/employee/AddNew";
import History from "./components/dashboard/attendance/History";
import PayrollSummary from "./components/dashboard/dashboard/PayrollSummary";
import AttendanceForComputation from "./components/dashboard/attendance/AttendanceForComputation";
import PayslipSend from "./components/dashboard/attendance/PayslipSend";
import Holidays from "./components/dashboard/attendance/Holidays";
import Conversion from "./components/dashboard/attendance/Conversion";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const PageTitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const titleMap = {
      "/sjm": "St. John Majore",
      "/payroll-management-login": "SJM Payroll Management Portal",
    };

    document.title =
      titleMap[location.pathname] || "SJM Payroll Management Portal";
  }, [location.pathname]);

  return null;
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const publicRoutes = [
    "/",
    "/admin",
    "/faqs",
    "/careers",
    "/services-offered",
  ];
  const location = useLocation().pathname;

  return (
    <>
      {/* Show Navbar only in public routes */}
      <PageTitleUpdater />
      <Routes>
        {/* Public Routes */}
        <Route path="/payroll-management-login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Redirect "/" to the admin dashboard */}
        <Route path="/" element={<Navigate to="/admin-dashboard" />} />

        {/* Admin Dashboard Routes (Protected) */}
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
          <Route index element={<Overview />} />
          <Route path="overview" element={<Overview />} />

          <Route path="departments" element={<DepartmentList />} />
          <Route path="add-department" element={<AddDepartment />} />
          <Route path="department/:id" element={<EditDepartment />} />
          <Route path="employees" element={<List />} />
          <Route path="menu" element={<Menu />} />
          <Route path="employees/add-employee" element={<AddNew />} />
          <Route
            path="employees/payroll-informations/list"
            element={<EmployeePayrollInformationsList />}
          />
          <Route path="add-masterlist" element={<AddMasterlist />} />
          <Route path="employees/edit/:id" element={<Edit />} />
          <Route path="employee/:id" element={<EmployeeIDCard />} />
          <Route path="admin-settings" element={<AdminLounge />} />
          <Route path="employees/rates" element={<PayrollSystemData />} />
          <Route path="rates-data-dashboard" element={<RatesDashboard />} />
          <Route path="create-payroll" element={<CreatePayroll />} />
          <Route
            path="employees/payroll-data/:id"
            element={<EmployeePayrollData />}
          />
          <Route path="payslip-history" element={<PayslipHistory />} />
          <Route path="payroll-summary" element={<PayrollSummary />} />
          <Route path="employees/payslip/:id" element={<Payslip />} />
          <Route
            path="employees/payslip-history/:id"
            element={<EmployeePayslipHistory />}
          />
          <Route path="employees/allowance/:id" element={<Allowance />} />
          <Route path="attendance" element={<Attendance />} />
          <Route
            path="attendance-computation"
            element={<AttendanceForComputation />}
          />
          <Route path="attendance/history" element={<History />} />
          <Route path="attendance-conversion" element={<Conversion />} />
          <Route path="invoice-list" element={<InvoiceList />} />
          <Route path="client-list" element={<ClientList />} />
          <Route path="client/add-client" element={<AddClient />} />
          <Route path="projects" element={<Projects />} />
          <Route path="add-project" element={<AddProject />} />
          <Route path="edit-project/:id" element={<EditProject />} />
          <Route path="add-rates" element={<AddRatesAndDeductions />} />
          <Route path="rates/edit/:id" element={<EditRatesAndDeductions />} />
          <Route
            path="payslip-history/send-payslip-trial"
            element={<PayslipSend />}
          />
          <Route path="holidays" element={<Holidays />} />
        </Route>

        {/* Employee Dashboard */}
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={5000} />
      {/* Show footer only in public routes */}
    </>
  );
}

export default App;
