import express from 'express';
import complianceRouter from './routes/compliance.router.js';

const app = express();
app.use(express.json());

// Test route
app.get('/test', (req, res) => res.json({ msg: 'test works' }));

// Mount compliance router
app.use('/api/compliance', complianceRouter);

// 404
app.use((req, res) => res.status(404).json({ msg: 'not found' }));

const PORT = 5001;
app.listen(PORT, () => console.log(`Test app on ${PORT}`));
