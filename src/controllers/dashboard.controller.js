import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(400, "Enter a valid channel ID");
    }

    const channel = await User.findById(channelId); 
    if (!channel) {
        throw new ApiError(404, "No channel found");
    }

    const videos = await Video.find({ owner: channelId });

    const totalVideos = videos.length;
    const totalViews = videos.reduce((acc, video) => acc + (video.views || 0), 0);
    const totalLikes = videos.reduce((acc, video) => acc + (video.likes || 0), 0);
    
    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

    const stats = {
        totalVideos,
        totalViews,
        totalLikes,
        totalSubscribers
    };

    return res.status(200).json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
});


const getChannelVideos = asyncHandler(async (req, res) => {

    const {channelId} = req.params

    if (!channelId) {
        throw new ApiError(400, "Enter the valid ID")
    }

    const channel = await User.findById(channelId)

    if (!channel) {
        throw new ApiError(404, "No channel found")
    }

    const videos = await Video.find({owner: channelId})

    if (videos.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No videos found"))
    }

    return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"))

})

export {
    getChannelStats, 
    getChannelVideos
    }