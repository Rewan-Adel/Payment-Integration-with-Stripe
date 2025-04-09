const User = require('../models/user.model');

exports.signup = async(userData) => {
    try{
        const user = await User.findOne({email: userData.email});
        if(user) return;

        const newUser = new User(userData);
        await newUser.save();

        const token = await newUser.generateToken();
        return token;
    }catch(e){
        console.log(`❌ Error on user signup: ${e.message}`);
        return e;
    }
};

exports.signin = async(userData) => {
    try{
        const user = await User.findOne({email: userData.email});
        if(!user) return;

        const isMatch = user.comparePassword(userData.password);
        if(!isMatch) return;
        
        const token = await user.generateToken();
        return token;
    }catch(e){
        console.log(`❌ Error on user signIn: ${e.message}`);
        return e;
    }
};
