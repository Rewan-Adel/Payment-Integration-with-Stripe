const router = require('express').Router();

const {
    getAllUserPayments,
    createStripeSession
} = require('../controllers/payment.controller');
const {tokenValidation} = require('../middlewares/token.middlewares');


router.use(tokenValidation);

router.get('/all', getAllUserPayments);
router.post('/create-checkout-session', createStripeSession);

module.exports = router;