const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const routes = require('./routes');

dotenv.config();

const { log } = console;

const port = process.env.PORT || 4000;

const app = express();

app.use(helmet());

app.use(cors());

app.use(logger('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.text());


app.use('/api/v1', routes);

app.get('/', (req, res) => res.status(200).json({
    status: 200,
    message: 'welcome to scrappy'
}));

app.get('*', (req, res) => res.status(404).json({
    status: 404,
    message: 'route not found'
}));

app.listen(port, () => log(`🔌 Running on port ${port}`));

module.exports = app;
