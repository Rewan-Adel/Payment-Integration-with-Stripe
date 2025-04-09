const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    stripe_customer_id:{
        type: String,
        default: null
    },
},{
    timestamps: true,
    toJSON:{
        transform: function(doc, ret){
            delete ret.stripe_customer_id;
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    }
});

userSchema.pre('save', function(next){
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

userSchema.methods.comparePassword = function(password){
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.generateToken = function(){
    const token = jwt.sign({id: this._id}, process.env.JWT_SECRET);
    return token;
}
module.exports = mongoose.model('User', userSchema);