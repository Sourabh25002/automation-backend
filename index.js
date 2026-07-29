import { app } from './src/app.js';
import 'dotenv/config';
import { connectDB } from './src/database/postgreSqlConnection.js';
import { config } from './src/utils/config.js';

const port = config.PORT;

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running at port ${port}`);
    });
});