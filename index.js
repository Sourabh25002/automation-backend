import { app } from './src/app.js';
import 'dotenv/config';
import { connectDB } from './src/database/db.js';

const port = process.env.PORT;

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running at port ${port}`);
    });
});