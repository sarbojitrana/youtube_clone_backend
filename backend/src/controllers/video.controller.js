import mongoose , {isValidObjectId} from "mongoose"
import { Video } from "../models/video.model.js"
import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"




const getAllVideos = asyncHandler(async(req,res)=>{ // will act as search result, dashboard and a profile visit dashboard
    
    // if userId is provided then its a channel visit, if query is given then its a search result else it's a normal dashboard

    const {page = 1, limit = 10 , query, sortBy, sortType, userId} = req.query;

    const matchStage = {};

    if(userId){ // profile visit
        if(!mongoose.isValidObjectId(userId)){
            throw new ApiError(400, "Invalid user ID");
        }
        matchStage.owner = new mongoose.Types.ObjectId(userId)
    }else{ // public search
        matchStage.isPublished = true;
    }

    if(query){ //filer as per search query
        matchStage.$or = [
            
            {title : {$regex : query , $options : 'i'}}, // search the for the videos that have titles which matches with the query and the search is case insensitive
            {description : {$regex : query , $options  : 'i'}} // same with the description
        ]
    }

    const aggregate = Video.aggregate([
        {
            $match : matchStage
        }
    ])

    const options = {
        page : parseInt(page,10),
        limit : parseInt(limit, 10),
        sort : {}
    }
    // default sorting newest first (decreasing createdAt)
    const sortField = sortBy || 'createdAt';
    const sortDirection = sortType?.toLowerCase() === 'asc' ? 1 : -1;
    options.sort[sortField] = sortDirection;

    const videos = await Video.aggregatePaginate(aggregate, options);

    if(!videos){
        throw new ApiError(404, "No videos found")
    }

    return res.status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"))
})


export {
    getAllVideos
}