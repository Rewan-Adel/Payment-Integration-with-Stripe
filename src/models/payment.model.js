const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    payment_intent_id: {
        type: String,
        required: true
    },
    amount:{
        type: Number,
    },
    currency:{
        type: String,
        default: 'usd'
    },
    country: {
        type: String
    },
    cardholder_name: {
        type: String
    },
    status:{
        type: String,
        default: 'pending'
    },
    paid_at:{
        type: Date
    },
    cancelled_at:{
        type: Date
    }

},{
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);