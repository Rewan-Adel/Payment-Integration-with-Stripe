const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paymentService = require('../services/payment.service');
const Payment = require('../models/payment.model');

/**
 * this function is used to get all payments for a user
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.getAllUserPayments = async(req, res)=>{
    try {
        const payments = await paymentService.getAllPayments(req.user._id);
        res.json({ payments });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Error fetching payments' });
    }
};
/**
 * this function is used to create a stripe session for payment
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.createStripeSession = async(req, res) => {
    try{
        const { totalPrice } = req.body; 
        
        const session = await stripe.checkout.sessions.create({
            client_reference_id: req.user._id.toString(), //important to save the user id in the session for webhook event 
            line_items: [
              {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: 'Total Price',
                  },
                  unit_amount: totalPrice * 100,
                },
                quantity: 1,
              },
            ],
            mode: 'payment',
            success_url: `${process.env.DOMAIN}/success.html`,
            cancel_url: `${process.env.DOMAIN}/cancel.html`,
          });
        
        return res.status(200).json({ redirectUrl: session.url });
    }catch(error){
        console.log(`❌ Error at create payment func: ${error.message}`);
        return res.status(500).json({
            message: "Internal server error!"
        });
    }

};


/**
 * this function is used to handle the webhook events from Stripe for payment confirmation
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.webhookListen = async(req, res) => {
    console.log('✅ Webhook received');
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; 
    const signature = req.headers['stripe-signature'];
    let event;

    try {
        // Verify the webhook signature
        event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
    } catch (err) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event based on type
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object; // Get session object
            if (session && session.payment_intent) {
                const paymentIntentId = session.payment_intent;
                const userId = session.client_reference_id; 
                
                const newPayment = await paymentService.savePaymentToDb({
                    user: userId,
                    payment_intent_id: paymentIntentId,
                    amount: session.amount_total / 100, // Convert to dollars
                    currency: session.currency,
                    cardholder_name: session.customer_details.name,
                    status: session.payment_status,
                });

                if (!newPayment) {
                    console.log('Error saving payment to DB');
                    return res.status(500).json({ message: 'Error saving payment' });
                }

                const confirm = await confirmPayment(newPayment);
                if (!confirm) {
                    return res.status(500).json({ message: 'Error confirming payment' });
                }

                console.log('PaymentIntent was successful!');
            }
            break;

        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            const userId = paymentIntent.client_reference_id; 

            const payment = await paymentService.savePaymentToDb({
                user: userId,
                payment_intent_id: paymentIntent.id,
                amount: paymentIntent.amount_received / 100, // Convert to dollars
                currency: paymentIntent.currency,
                cardholder_name: paymentIntent.metadata.name,
                status: paymentIntent.status,
            });

            if (!payment) {
                console.log('Error saving payment to DB');
                return res.status(500).json({ message: 'Error saving payment' });
            }

            const confirmPaymentResult = await confirmPayment(payment);
            if (!confirmPaymentResult) {
                return res.status(500).json({ message: 'Error confirming payment' });
            }

            console.log('PaymentIntent was successful!');
            break;

        case 'checkout.session.async_payment_failed':
            console.log('Payment failed');
            const failedSession = event.data.object;
            const cancel = await cancelPayment(failedSession);
            if (!cancel) {
                return res.status(500).json({ message: 'Error canceling payment' });
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Acknowledge the event with a 200 response
    return res.status(200).json({ received: true });
};

/**
 * this function is used to confirm the payment in the database
 * @param {*} paymentObj 
 * @returns boolean
 */
const confirmPayment= async(paymentObj) => {
    try{
        if(paymentObj.payment_status === 'success' ) {
            paymentObj.payment_status = 'pending';
            paymentObj.paid_at = null;
            paymentObj.cancelled_at = null;
        }
        else if(paymentObj.payment_status === 'paid'){
            paymentObj.paid_at = new Date();
            paymentObj.cancelled_at = null;
        }
        else{
            paymentObj.cancelled_at = new Date();
            paymentObj.paid_at = null;
            paymentObj.cancelled_at = new Date();
        }
        await paymentObj.save();
        return true;
    }catch(error){
        console.log(`❌ Error at confirm payment func: ${error.message}`);
        return false;
    }
};