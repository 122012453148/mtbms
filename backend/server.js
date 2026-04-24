require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

// Route imports
const authRoutes = require('./routes/authRoutes');
const materialRoutes = require('./routes/materialRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const customerRoutes = require('./routes/customerRoutes');
const erpRoutes = require('./routes/erpRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const hrRoutes = require('./routes/hrRoutes');
const managerRoutes = require('./routes/managerRoutes');
const taskRoutes = require('./routes/taskRoutes');
const salesRoutes = require('./routes/salesRoutes');
const leadRoutes = require('./routes/leadRoutes');
const acquisitionRoutes = require('./routes/acquisitionRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const employeeDashboardRoutes = require('./routes/employeeDashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const financeRoutes = require('./routes/financeRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reportRoutes = require('./routes/reportRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const auditRoutes = require('./routes/auditRoutes');
const userRoutes = require('./routes/userRoutes');
const revenueRoutes = require('./routes/revenueRoutes');
const salaryRoutes = require('./routes/salaryRoutes');

const socketUtils = require('./utils/socket');

connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false
}));
app.use(morgan('dev'));
const path = require('path');
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Core Enterprise API Strategy
app.use('/api/notifications', notificationRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/leaves', leaveRoutes);
app.get('/api/ping', (req, res) => res.json({ message: 'Enterprise System Heartbeat Active' }));
app.use('/api/attendance', attendanceRoutes);
app.use('/api/employee-dashboard', employeeDashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/acquisition', acquisitionRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/erp', erpRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/users', userRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/salary', salaryRoutes);

app.get('/', (req, res) => {
    res.send('SMTBMS ENTERPRISE API V3.0 ACTIVE');
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io through utility
const io = socketUtils.init(server);

io.on('connection', (socket) => {
    console.log(`[Socket] Enterprise Tunnel Established: ${socket.id}`);
    
    socket.on('join', (userId) => {
        if (userId) {
            socket.join(userId.toString());
            console.log(`[Socket] Identity Synced: User ${userId} active`);
        }
    });

    socket.on('disconnect', () => console.log('[Socket] Tunnel Terminated'));
});

server.listen(PORT, () => {
    console.log(`[System] Enterprise Server engaged on port ${PORT}`);
    console.log(`[Status] All operational routes synchronized.`);
});
