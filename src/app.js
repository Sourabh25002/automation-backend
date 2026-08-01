import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import v1 from './routes/v1.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

// middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.get('/', (req, res) => {
    const data = "Hello World!";

    res.status(200).json({
        success: true,
        message: data
    });
});


app.use('/api/v1', v1);

// Global Error Handling Middleware
app.use(errorHandler);

export { app }; 