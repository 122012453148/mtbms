import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import HRLayout from './layouts/HRLayout';
import ManagerLayout from './layouts/ManagerLayout';
import SalesLayout from './layouts/SalesLayout';
import EmployeeLayout from './layouts/EmployeeLayout';

// Pages
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

// Admin Pages
import Dashboard from './pages/Dashboard';
import MaterialsPage from './pages/MaterialsPage';
import EmployeesPage from './pages/EmployeesPage';
import ERPPage from './pages/ERPPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import FinancePage from './pages/FinancePage';
import OrdersPage from './pages/OrdersPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminAuditPage from './pages/AdminAuditPage';
import EmployeeAuditPage from './pages/EmployeeAuditPage';

// HR Pages
import HRDashboard from './pages/HRDashboard';
import HRSettings from './pages/HRSettings';
import HRAttendance from './pages/HRAttendance';
import HRPayroll from './pages/HRPayroll';

import ManagerDashboard from './pages/ManagerDashboard';
import TaskBoard from './pages/TaskBoard';
import ManagerLeaveRequests from './pages/ManagerLeaveRequests';
import ManagerAuditPage from './pages/ManagerAuditPage';
import RevenuePage from './pages/RevenuePage';
import StaffsPage from './pages/StaffsPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';

// Sales Pages
import SalesDashboard from './pages/SalesDashboard';
import PipelineBoard from './pages/PipelineBoard';
import ProspectMatrix from './pages/ProspectMatrix';
import CustomerRegistry from './pages/CustomerRegistry';
import CustomerApprovals from './pages/CustomerApprovals';
import AcquisitionBoard from './pages/AcquisitionBoard';
import QualifiedMatrix from './pages/QualifiedMatrix';

// Employee Pages
import EmployeeDashboard from './pages/EmployeeDashboard';
import AttendanceHistory from './pages/AttendanceHistory';
import EmployeeTasks from './pages/EmployeeTasks';
import EmployeeSalary from './pages/EmployeeSalary';
import LeavePage from './pages/LeavePage';
import EmployeeProfilePage from './pages/EmployeeProfilePage';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    // Still initializing auth from localStorage token
    if (loading) return null;

    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');

    // Token + role exist but user state not populated yet (brief post-login window)
    if (!user && token && storedRole) {
        if (!allowedRoles || allowedRoles.includes(storedRole)) {
            return null; // Correct role — wait for user state to catch up
        }
        // Wrong role — redirect now using stored role
        const redirectPath = {
            'Admin': '/dashboard', 'HR': '/hr-dashboard',
            'Manager': '/manager-dashboard', 'Sales': '/crm',
            'Employee': '/employee-dashboard'
        }[storedRole] || '/';
        return <Navigate to={redirectPath} replace />;
    }

    // No token at all — go to login
    if (!user) return <Navigate to="/" replace />;

    // Force password change if firstLogin is true
    if (user.firstLogin && window.location.pathname !== '/change-password') {
        return <Navigate to="/change-password" replace />;
    }

    // Wrong role for this section
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const redirectPath = {
            'Admin': '/dashboard', 'HR': '/hr-dashboard',
            'Manager': '/manager-dashboard', 'Sales': '/sales-dashboard',
            'Employee': '/employee-dashboard'
        }[user.role] || '/';
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

const App = () => {
    return (
        <AuthProvider>
            <NotificationProvider>
                <Router>
                    <Routes>
                        {/* Entry gateway */}
                        <Route path="/" element={<LoginPage />} />
                        <Route path="/change-password" element={
                            <ProtectedRoute>
                                <ChangePasswordPage />
                            </ProtectedRoute>
                        } />

                        {/* Admin Workspace */}
                        <Route 
                            element={
                                <ProtectedRoute allowedRoles={['Admin', 'HR']}>
                                    <AdminLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/materials" element={<MaterialsPage />} />
                            <Route path="/employees" element={<EmployeesPage />} />
                            <Route path="/erp" element={<ERPPage />} />
                            <Route path="/admin-customers" element={<CustomerRegistry />} />
                            <Route path="/admin-acquisition" element={<AcquisitionBoard />} />
                            <Route path="/admin-qualified" element={<QualifiedMatrix />} />
                            <Route path="/admin-approvals" element={<CustomerApprovals userRole="Admin" />} />
                            <Route path="/finance" element={<FinancePage />} />
                            <Route path="/reports" element={<ReportsPage />} />
                            <Route path="/notifications" element={<NotificationsPage />} />
                            <Route path="/settings" element={<ProfileSettingsPage />} />
                            <Route path="/audit" element={<AdminAuditPage />} />
                            <Route path="/revenue" element={<RevenuePage isAdmin={true} />} />
                            <Route path="/staffs" element={<StaffsPage />} />
                        </Route>

                        {/* HR Portal */}
                        <Route 
                            element={
                                <ProtectedRoute allowedRoles={['HR']}>
                                    <HRLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="/hr-dashboard" element={<HRDashboard />} />
                            <Route path="/hr-employees" element={<EmployeesPage />} />
                            <Route path="/hr-attendance" element={<HRAttendance />} />
                            <Route path="/hr-leaves" element={<ManagerLeaveRequests />} />
                            <Route path="/hr-payroll" element={<HRPayroll />} />
                            <Route path="/hr-reports" element={<ReportsPage />} />
                            <Route path="/hr-settings" element={<ProfileSettingsPage />} />
                            <Route path="/hr-notifications" element={<NotificationsPage />} />
                        </Route>

                        {/* Manager Workspace */}
                        <Route 
                            element={
                                <ProtectedRoute allowedRoles={['Manager']}>
                                    <ManagerLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="/manager-dashboard" element={<ManagerDashboard />} />
                            <Route path="/manager-tasks" element={<TaskBoard />} />
                            <Route path="/manager-materials" element={<MaterialsPage />} /> 
                            <Route path="/manager-employees" element={<EmployeesPage />} />
                            <Route path="/manager-leaves" element={<ManagerLeaveRequests />} />
                            <Route path="/manager-reports" element={<ReportsPage />} />
                            <Route path="/manager-finance" element={<FinancePage />} />
                            <Route path="/manager-audits" element={<ManagerAuditPage />} />
                            <Route path="/manager-revenue" element={<RevenuePage isAdmin={false} />} />
                            <Route path="/manager-settings" element={<ProfileSettingsPage />} />
                            <Route path="/manager-approvals" element={<CustomerApprovals userRole="Manager" />} />
                            <Route path="/manager-acquisition" element={<AcquisitionBoard />} />
                            <Route path="/manager-qualified" element={<QualifiedMatrix />} />
                            <Route path="/manager-notifications" element={<NotificationsPage />} />
                        </Route>

                        {/* Sales Workspace (CRM) */}
                        <Route 
                            element={
                                <ProtectedRoute allowedRoles={['Sales']}>
                                    <SalesLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="/sales-dashboard" element={<SalesDashboard />} />
                            <Route path="/sales-pipeline" element={<PipelineBoard />} />
                            <Route path="/sales-leads" element={<ProspectMatrix />} />
                            <Route path="/sales-acquisition" element={<AcquisitionBoard />} />
                            <Route path="/sales-qualified" element={<QualifiedMatrix />} />
                            <Route path="/sales-customers" element={<CustomerRegistry />} />
                            <Route path="/sales-orders" element={<OrdersPage />} /> 
                            <Route path="/sales-reports" element={<ReportsPage />} />
                            <Route path="/sales-settings" element={<ProfileSettingsPage />} />
                            <Route path="/sales-notifications" element={<NotificationsPage />} />
                        </Route>

                        {/* Employee Workspace */}
                        <Route 
                            element={
                                <ProtectedRoute allowedRoles={['Employee']}>
                                    <EmployeeLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
                            <Route path="/employee-profile" element={<EmployeeProfilePage />} />
                            <Route path="/employee-profile/:id" element={<EmployeeProfilePage />} />
                            <Route path="/employee-attendance" element={<AttendanceHistory />} />
                            <Route path="/employee-tasks" element={<EmployeeTasks />} />
                            <Route path="/employee-leaves" element={<LeavePage />} />
                            <Route path="/employee-salary" element={<EmployeeSalary />} />
                            <Route path="/employee-notifications" element={<NotificationsPage />} />
                            <Route path="/employee-settings" element={<ProfileSettingsPage />} />
                            <Route path="/employee-audit" element={<EmployeeAuditPage />} />
                        </Route>

                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                    <ToastContainer position="bottom-right" theme="colored" hideProgressBar={true} newestOnTop={true} />
                </Router>
            </NotificationProvider>
        </AuthProvider>
    );
};

export default App;
