const userService = require('../services/user.service');

exports.signup = async(req, res) => {
    try{
        const userToken = await userService.signup(req.body);
        if(!userToken){
            return res.status(400).json({   
                message: "Email is already registered."
            });
        };
        return res.json({   
            message: "Signup successfully.",
            token: userToken
        });
    }catch(e){``
        return res.status(400).json({message: e.message});
    }
};

exports.login = async(req, res) => {
    try{
        const userToken = await userService.signin(req.body);
        if(!userToken){
            return res.status(400).json({   
                message: "Invalid password or email."
            });
        };
        return res.json({   
            message: "Login successfully.",
            token: userToken
        })
    }catch(e){
        return res.status(400).json({message: e.message});
    }
};