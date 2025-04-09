const router = require('express').Router();
const {
    signup,
    login,
    signupPage,
    loginPage
} = require('../controllers/user.controller');

router.get('/signup', signupPage);
router.get('/login', loginPage);


router.post('/signup', signup);
router.post('/login', login);

module.exports = router;