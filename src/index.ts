import dotenv from 'dotenv';
import express from 'express';
import errorHandler from './middleware/error.middleware';
import postsRouter from './routes/posts';
import morganMiddleware from './middleware/morgan.middleware';
import logger from './utils/logger';
import swaggerUi, { JsonObject } from 'swagger-ui-express';
import YAML from 'yaml';
import fs from 'fs';

dotenv.config();

const PORT = process.env.PORT || 5000;

const app: express.Application = express();

const yamlFile = fs.readFileSync('./swagger/swagger.yaml', 'utf-8');
const swaggerDocument: unknown = YAML.parse(yamlFile);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morganMiddleware);
app.use('/api/posts', postsRouter);
app.use(errorHandler);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument as JsonObject));

// Serve frontend
/*if (process.env.NODE_ENV === 'development') {
    app.get('/', (req, res) => res.send('Please set to production'));
} else {
    app.use(express.static(path.join(__dirname, '../frontend/build)));

    app.get('*', (req, res) => 
        res.sendFile(
            path.resolve(__dirname, '../', 'frontend', 'build', 'index.html')
        )
    );
}
*/

app.listen(PORT, () => logger.info(`Server started on port ${PORT}`));
