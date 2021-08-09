import mongoose from 'mongoose';
const { Schema } = mongoose;
const SALT_I = 10;
import bcrypt  from 'bcrypt';
import jwt  from 'jsonwebtoken';

const usersSchema = new mongoose.Schema({
  
    first_name: { type: String, index: true  },
    last_name: { type: String, index: true  },
    full_name: { type: String, index: true  },
    username: { type: String , index: true,unique:true },
    email: { type: String , index: true,unique:true },
    password: {type : String, index: true, select: false},
    is_email_verified: { type: Boolean, index: true, default: false },
    email_verification_code: { type: String,index: true },
   

    // Select false will not show it in select queries 
    // Just in case if you again want to show it Users.findOne({_id: id}).select('+password').exec(...);
    password_reset_token: String,
    password_reset_token_expiry_time: Date,

    token:{type:String, index: true},
    resetToken:{type:String},
    resetTokenExp:{type:Number},

}, { timestamps: true });

usersSchema.pre('save',function(next){
    let objUser = this;
  
    if(objUser.isModified('password')){
        bcrypt.genSalt(SALT_I,function(err,salt){
            if(err) return next(err);
            console.log('objUser.password')
            console.log(objUser.password)
            bcrypt.hash(objUser.password,salt,function(err,hash){
                if(err) return next(err);
                objUser.password = hash;
                next();
            });
        })
    } else{
        next()
    }
});


usersSchema.methods.comparePassword = async function(candidatePassword,cb){
    // console.log('this.password')
    // console.log(this.password)
    // console.log('candidatePassword')
    // console.log(candidatePassword)
    // console.log('this')
    // console.log(this)
    bcrypt.compare(candidatePassword,this.password,function(err,isMatch){
        if(err) return cb(err);
        cb(null,isMatch)
    })
};

usersSchema.methods.comparePasswordAwait = async function(candidatePassword,cb){
    // console.log('this.password')
    // console.log(this.password)
    // console.log('candidatePassword')
    // console.log(candidatePassword)
    // console.log('this')
    // console.log(this)
    return await bcrypt.compare(candidatePassword, this.password);
    // bcrypt.compare(candidatePassword,this.password,function(err,isMatch){
    //     if(err) return cb(err);
    //     cb(null,isMatch)
    // })
};

usersSchema.methods.generateToken = function(cb){
    let user = this;
    // let token = jwt.sign(user._id.toHexString(),process.env.SECRET);
    let token = jwt.sign({_id:user._id.toHexString()},process.env.SECRET,{
        expiresIn: 31996400 // expires in 370 days
    })
  
    user.token = token;
    user.save(function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })
};
  
usersSchema.statics.findByToken = function({token},cb){
    var user = this;
    jwt.verify(token,process.env.SECRET,function(err,decode){
        user.findOne({_id:decode,token},function(err,user){
          if(err) return cb(err);
          cb(null,user);
        })
    })
};
usersSchema.index({ createdAt: 1 }); // schema level
const Users = mongoose.model('Users', usersSchema);

export default Users;
