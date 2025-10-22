import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async(req, res) =>{
    // get user details from frontend
    // validation 
    // check if user already exists 
    // check for images, and avatar
    // upload them to cloudinary (check again )
    // create user object -create entry in db
    // remove password and refresh token field from response
    // check for user creation if yes then return response else err

    const {fullName, email, username, password} = req.body
    
    if(
        [fullName, email, username, password].some((field)=>{
            return field?.trim() === "" ;
        })
    ){
        throw new ApiError(400, "All fields are required")
    }

    const exitsedUser = await User.findOne({
        $or: [{username}, {email}]
    })


    if(exitsedUser){
        throw new ApiError(409, "User already exists")
    }

    const avatarLocalPath =  req.files?.avatar[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }
    console.log( "Attempting to upload avatar from : " , avatarLocalPath)

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    console.log("Cloudinary avatar response : ", avatar)

    if(!avatar){
        throw new ApiError(400, "Avatar is required");
    }

    const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImage = null

    if(coverImageLocalPath){
        console.log("Attempting to upload cover image from : ", coverImageLocalPath)
        coverImage = await uploadOnCloudinary(coverImageLocalPath)
        console.log("Cloudinary cover image response : ", coverImage)
        if(!coverImage){
            console.log("Cover image upload failed, but proceeding anyway");
        }
    }

    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()

    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )


})

export {
    registerUser,
}




//  to understand req.files, an example  (req.files is availabe only bcz we're using multer):
// {
//   "avatar": [
//     {
//       "fieldname": "avatar",
//       "originalname": "my-profile-pic.png",
//       "encoding": "7bit",
//       "mimetype": "image/png",
//       "destination": "./public/temp",
//       "filename": "my-profile-pic-1671234.png",
//       "path": "public/temp/my-profile-pic-1671234.png",
//       "size": 58241
//     }
//   ],
//   "coverImage": [
//     {
//       "fieldname": "coverImage",
//       "originalname": "my-banner.jpg",
//       "encoding": "7bit",
//       "mimetype": "image/jpeg",
//       "destination": "./public/temp",
//       "filename": "my-banner-1671234.jpg",
//       "path": "public/temp/my-banner-1671234.jpg",
//       "size": 145987
//     }
//   ]
// }