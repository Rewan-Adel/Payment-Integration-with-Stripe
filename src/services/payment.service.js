const Payment = require('../models/payment.model');
const User = require('../models/user.model');


exports.savePaymentToDb  = async(paymentData) => {
    try{
        const user = await User.findById(paymentData.user);
        if(!user) return ;

        //save payment details to the database
        const payment = new Payment(paymentData);
        await payment.save();
        return payment;

    }catch(e){
        console.log(`❌ Error on save payment in db: ${e.message}`);     
        return null;
    }
};


exports.getAllPayments = async(userId) => {
    try{
        const payments = await Payment.find({user: userId}).sort({createdAt: -1});
        return payments;
    }catch(e){
        console.log(`❌ Error on get all payments: ${e.message}`);     
        return null;
    }
};