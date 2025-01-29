import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import departmentRouter from './routes/department.js';
import employeeRouter from './routes/employee.js';
import connectToDatabase from './db/db.js';
import ratesRouter from './routes/ratesAndDeductions.js';
import projectRouter from './routes/project.js';

connectToDatabase();

const app = express();
const PORT = process.env.PORT || 5000; // Fallback port

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());
app.use('/uploads', express.static('uploads')); // Prefix files with '/uploads'

// Routes
app.use('/api/auth', authRouter);
app.use('/api/department', departmentRouter);
app.use('/api/employee', employeeRouter);
app.use('/api/rates', ratesRouter);
app.use('/api/projects', projectRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
