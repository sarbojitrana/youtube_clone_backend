import { asyncHandler } from "../utils/asyncHandler.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import mongoose from "mongoose"
import {User} from "../models/user.model.js"
import {Video} from "../models/video.model.js"
import {Community_Post} from "../models/communityPost.model.js"





const toggleVideoLike = asyncHandler( async(req,res)=>{
    const {videoId} = req.params
    const userId = req.user?._id ;

    const video = await Video.findById(videoId);
    
    if(!video){
        throw new ApiError(404, "Video does not exist")
    }

    const existingLike = await Like.findOne({
        video : videoId,
        likedBy : userId
    })

    let message = "";
    let liked = false;

    if(existingLike){
        const deleted = await Like.findByIdAndDelete(existingLike._id)
        
        if(!deleted){
            throw new ApiError(501, "Server Error : Could not delete the like on the video")
        }
        liked = false;
        message = "Like removed successfully"
    }
    else{
        const created = await Like.create({
            video : videoId,
            likedBy : userId
        })

        if(!created){
            throw new ApiError(501, "Server Error : Could not add a like to the video")
        }

        message = "Video liked successfully"
        liked = true;
    }

    return res.status(200)
    .json(new ApiResponse(200, liked, message ) )
    

})

const toggleCommunityLike = asyncHandler(async(req,res)=>{
    const {communityPostId} = req.params;
    const userId = req.user?._id;

    const communityPost = await Community_Post.findById(communityPostId);

    if(!communityPost){
        throw new ApiError(404, "Community Post does not exist")
    }

    const existingLike = await Like.findOne({
        likedBy : userId
    })

    let message = "";
    let liked = false;

    if(existingLike){
        const deleted = await Like.findByIdAndDelete(existingLike._id)
        
        if(!deleted){
            throw new ApiError(501, "Server Error : Could not delete the like  on the community post")
        }
        
        message = "Like deleted  from Community Post successfully";
        liked = false;
    }
    else{
        const created = await Like.create({
            likedBy : userId,
            communityPost : communityPost._id
        })

        if(!created){
            throw new ApiError(501, "Could not like the community post")
        }
        liked = true;
        message = "Like added to Community Post successfully"
    }

    return res.status(200)
    .json(new ApiResponse(200, liked, message))

})


const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user?._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    });

    let message = "";
    let liked = false;

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        message = "Like removed from comment successfully";
        liked = false;
    } else {

        await Like.create({
            comment: commentId,
            likedBy: userId
        });
        message = "Comment liked successfully";
        liked = true;
    }


    return res.status(200).json(
        new ApiResponse(
            200,
            { liked: liked },
            message
        )
    );
});

const getLikedVideos = asyncHandler(async (req, res)=>{

    const user = await User.findById(req.user?._id)

    const likedVideos = await Like.aggregate([
        {
            $match :{
                likedBy : new mongoose.Types.ObjectId(user._id),
                video : {
                    $exists : true
                }
            }
        },
        {
            $lookup :{
                from : "videos",
                localField : "video",
                foreignField : "_id",
                as : "likedVideoDetails"
            }
        },
        {
            $unwind : "likedVideoDetails"
        }, 

        {
            $lookup :{
                from : "users",
                localField : "likedVideoDetails.owner",
                foreignField : "_id",
                as : "ownerDetails"
            }
        },
        {
            $unwind : "ownerDetails"
        },

        {
            $project :{
                _id: "$likedVideoDetails._id",
                thumbnail: "$likedVideoDetails.thumbnail",
                title: "$likedVideoDetails.title",
                views: "$likedVideoDetails.views",
                duration: "$likedVideoDetails.duration",
                videoFile: "$likedVideoDetails.videoFile",

                owner : {
                    _id : "$ownerDetails._id",
                    username : "$ownerDetails.username",
                    avatar : "$ownerDetails.avatar"
                }
            }
        },
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    )



})


export {
    toggleVideoLike,
    toggleCommunityLike,
    toggleCommentLike,
    getLikedVideos
}