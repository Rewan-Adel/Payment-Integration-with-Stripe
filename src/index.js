const express    = require('express');
const mongoose   = require('mongoose');
const bodyParser = require('body-parser');
const path       = require('path');
const cors       = require('cors');
require('dotenv').config();

const { webhookListen } = require('./controllers/payment.controller');

const userRouter    = require('./routes/user.route');
const homeRouter    = require('./routes/home.route');
const paymentRouter = require('./routes/payment.route');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));

//When payment is done, stripe will send a webhook to this endpoint
app.use('/webhook', bodyParser.raw({type: 'application/json'}), webhookListen);


app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.use('/',        userRouter);
app.use('/home',    homeRouter);
app.use('/payment', paymentRouter);

app.use('*', (req, res) => {
    res.status(404).json({message: `${req.originalUrl} not found.`});
}); 

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB.');
}).catch((err) => {
    console.log('Failed to connect to MongoDB.', err);
});

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`Server is running on port http://localhost:${port}.`);
});