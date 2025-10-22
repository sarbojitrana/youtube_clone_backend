 import mongoose, {Schema} from 'mongoose' ;
 import jwt from 'jsonwebtoken';
 import bcrypt from 'bcrypt';

 const userSchema = new Schema(
    {
        username : {
            type : String,
            require : true,
            unique : true,
            lowercase: true,
            trim : true,
            index : true
        },
        email : {
            type : String,
            require : true,
            unique : true,
            lowercase: true,
            trim : true,
        },
        fullName : {
            type : String,
            require : true,
            trim : true,
            index : true,
        },
        avatar : {
            type : String,  // cloudinary url will be used later
            require : true,
        },
        coverimage : {
            type : String,
        },
        watchHistory: [
            {
                type : Schema.Types.ObjectId,
                ref : "Video"
            }
        ],
        password:{
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken:{
            type: String
        }

    },
    {
        timestamps : true,
    }
)


userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();

    try{
        this.password = await bcrypt.hash(this.password, 10);
    }
    catch(err){
        next(err);
    }
})


userSchema.methods.isPasswordCorrect = async function(password){
    try{
        return await bcrypt.compare(password, this.password);
    }
    catch(err){
        throw err;
    }
}

userSchema.methods.generateAccessToken = async function(){
    return  await jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName : this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = async function(){
    return await jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)