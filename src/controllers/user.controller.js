import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs"
import jwt from "jsonwebtoken"

const registerUser = asyncHandler(async(req, res) =>{
    // get user details from frontend
    // validation 
    // check if user already exists 
    // check for images, and avatar
    // upload them to cloudinary (check again )
    // create user object -create entry in db
    // remove password and refresh token field from response
    // check for user creation if yes then return response else err

    const cleanupLocalFiles = ()=>{ // to ensure no files remain on the server, this will help in the case when the upload the cloudinary fails but the files still get uploaded to the server
        const avatarLocalPath = req.files?.avatar?.[0]?.path;
        if(avatarLocalPath){
            try{
                fs.unlinkSync(avatarLocalPath);
                console.log(`Removed local avatar: ${avatarLocalPath}`);
            }
            catch(error){
                console.log("Error deleting local avatar: ", error);
            }
        }
        const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
        if(coverImageLocalPath){
            try{
                fs.unlinkSync(coverImageLocalPath);
                console.log(`Removed local Cover Image: ${coverImageLocalPath}`);
            }
            catch(error){
                console.log("Error deleting local avatar: ", error);
            }
        }
    };

    const {fullName, email, username, password} = req.body
    
    if(
        [fullName, email, username, password].some((field)=>{
            return field?.trim() === "" ;
        })
    ){
        throw new ApiError(400, "All fields are required")
    }

    const exitsedUser = await User.findOne({
        $or: [{username : username}, {email : email}]
    })


    if(exitsedUser){
        cleanupLocalFiles(); // to formally remove both
        throw new ApiError(409, "User already exists")
    }

    const avatarLocalPath =  req.files?.avatar?.[0]?.path

    if(!avatarLocalPath){
        cleanupLocalFiles(); // is only cover image was uploaded no avatar
        throw new ApiError(400, "Avatar file is required")
    }
    console.log( "Attempting to upload avatar from : " , avatarLocalPath)

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    console.log("Cloudinary avatar response : ", avatar)

    if(!avatar){
        cleanupLocalFiles(); // this ensures cover image is also removed when you have the avatar but failed to upload
        throw new ApiError(400, "Avatar is required");
    }

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path
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
        // delettion logic needed for cloudinary to rollback
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )


})

const generateAccessAndRefreshTokens = async(UserId) =>{
    try{
        const user = await User.findById(UserId)
        const accessToken =  await user.generateAccessToken() 
        const refreshToken =  await user.generateRefreshToken() 

        user.refreshToken = refreshToken // we only save the refresh token in the database 

        await user.save({validateBeforeSave : false}) // since we haven't set passwords etc we need to ignore validation

        return {accessToken, refreshToken}
    }
    catch(error){
        throw new ApiError(500, "Something went wrong while generating the Access and Refresh Tokens")
    }
}

const loginUser = asyncHandler(async(req,res) =>{
    // req.body -> data
    //username or email
    // validate the input
    // check if the inputs match in the database or not(find the user)
    // if they match then check if they're correct(passwork check)
    // generate accesstoken and refreshtoken
    // send cookies
    // response

    const {username, email, password} = req.body

    if(!username && !email){
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or : [{email : email}, {username : username}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refreshToken}  = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select(" -password -refreshToken")

    const options = {
        httpOnly: true,
        secure : true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser, accessToken, refreshToken
            },
            "User logged in Successfully"
        )
    )

})


const logoutUser = asyncHandler(async(req,res)=>{
    // get the user details 
    // check remove the access token and refresh token (remove cookies)
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new : true
        }
    )
    const options = {
        httpOnly: true,
        secure : true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{}, "User Logged Out" ))

    
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    // check if access token has expired or this will be hit only when accesstoken expires which can be dealt with a middleware
    // check from the req if the refresh token matches the one stored in the database
    // generate new accesstoken and add it in the response

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Request")
    }
    decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401, "Invalid refresh token")
    }

    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh token is expired or used")
    }

    const options = {
        httpOnly: true,
        secure: true
    }
    const {accessToken, newRefreshToken} = generateAccessAndRefreshTokens(user._id)
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                accessToken,
                refreshToken : newRefreshToken
            }
        )
    )

})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    // get user id and replace old password with the new password sent (already logged in )
    const {oldPassword, newPassword, confirmPassword} = req.body

    if(newPassword !== confirmPassword){
        throw new ApiError(400, "The new password fields don't match")
    }

    const user = await User.findById(req.user?._id)
    const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isOldPasswordCorrect){
        throw new ApiError(400, "Invalid Old Password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave : false})
    
    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"))

})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(200, req.user, "User details fetched successfully")
})

const updateAccountDetails = asyncHandler(async(req, res)=>{ // for text bases data
    const {fullName, email } = req.body

    if(!fullName || !email){
        throw new ApiError(400, "All fields are required")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                fullName,
                email
            }
        },
        { new : true}
    ).select("-password")

    user.save({validateBeforeSave : false})

    return res.status(200)
    .json(new ApiResponse(200, user, "Account Details Successfully"))

})


const updateUserAvatar = asyncHandler(async(req, res)=>{

    const cleanupLocalFiles = ()=>{ // to ensure no files remain on the server, this will help in the case when the upload the cloudinary fails but the files still get uploaded to the server
        const avatarLocalPath = req.file?.path
        if(avatarLocalPath){
            try{
                fs.unlinkSync(avatarLocalPath);
                console.log(`Removed local avatar: ${avatarLocalPath}`);
            }
            catch(error){
                console.log("Error deleting local avatar: ", error);
            }
        }
    };


    const avatarLocalPath = req.file?.path

    

    if(!avatarLocalPath){
        cleanupLocalFiles()
        throw new ApiError(401, "No avatar image proviede")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar){
        throw new ApiError(500,"Error while uploading avatar to Cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set :{
                avatar : avatar.url
            }
        },
        {
            new : true
        }
    ).select("-password")


    await user.save({validateBeforeSave : false})

    return res.status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"))
})
const updateUserCoverImage = asyncHandler(async(req, res)=>{

    const cleanupLocalFiles = ()=>{ // to ensure no files remain on the server, this will help in the case when the upload the cloudinary fails but the files still get uploaded to the server
        const coverImageLocalPath = req.file?.path
        if(coverImageLocalPath){
            try{
                fs.unlinkSync(coverImageLocalPath);
                console.log(`Removed local coverImage: ${coverImageLocalPath}`);
            }
            catch(error){
                console.log("Error deleting local coverImage: ", error);
            }
        }
    };


    const coverImageLocalPath = req.file?.path


    if(!coverImageLocalPath){
        cleanupLocalFiles()
        throw new ApiError(401, "No Cover Image proviede")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage){
        throw new ApiError(500,"Error while uploading Cover Image to Cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set :{
                coverImage : coverImage.url
            }
        },
        {
            new : true
        }
    ).select("-password")


    await user.save({validateBeforeSave : false})

    return res.status(200)
    .json(new ApiResponse(200, user, "Cover Image updated successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
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