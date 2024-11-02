import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Tweet} from "../models/tweet.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if (!videoId) {
        throw new ApiError(400, "Enter the valid video id")
    }

    const videoExists = await Video.findById(videoId)

    if (!videoExists) {
        throw new ApiError(404, "Video dosent exists")
    }

    const videoLike = await Like.findOne({
        videoId,
        userId: req.user._id
    })

    if (videoLike) {
        await Like.deleteOne({_id:videoLike._id})
        return res.status(200).json(200, new ApiResponse(200, {}, "Video unliked"))
    } else {
        const newLike = new Like({videoId, userId: req.user._id})
        await newLike.save()
        return res.status(201).json(new ApiResponse(201, newLike, "Video liked"))
    }


})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    if (!commentId) {
        throw new ApiError(400, "Comment id is not valid")
    }

    const commentExists = await Comment.findById(commentId)

    if (!commentExists) {
        throw new ApiError (404, "Comment dosent exists")
    }

    const commentLike = await Like.findOne({
        commentId,
        userId: req.user._id
    })

    if (commentLike) {
        await Like.deleteOne({_id:commentLike._id})
        return res.status(200).json(new ApiResponse(200, {}, "Un liked sucessfully"))
    } else {
        const newLike = new Like({commentId, userId: req.user._id})
        await newLike.save()
        return res.status(200).json(new ApiResponse(201, newLike, "liked sucessfully"))

    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params

    if (!tweetId) {
        throw new ApiError(400, "Enter the valid Tweet id")
    }

    const tweetExists = Tweet.findById(tweetId)

    if (!tweetExists) {
        throw new ApiError(404, "Tweet dosent exists")
    }

    const tweetLike = await Like.findOne({
        tweetId,
        userId: req.user._id
    })

    if (tweetLike) {
        await Like.deleteOne({
           _id: tweetLike._id
        })
        return res.status(200).json(new ApiResponse(200, {}, "Un liked sucessfully"))
    } else{
        const newLike = new Like({tweetId, userId: req.user._id})
        await newLike.save()
        return res.status(201).json(new ApiResponse(201, newLike, "Liked successfully"));
    }

}
)

const getLikedVideos = asyncHandler(async (req, res) => {

    const userId = req.user._id

    const likedVideos = await Like.find({userId}).select('videoId')

    if (!likedVideos.length) {
        throw new ApiError("No liked video")
    }

    const videoIds = likedVideos.map(like => like.videoId)

    const videos = await Video.find({_id: {$in: videoIds}})

    res.status(200).json(new ApiResponse(200, videos, "Liked videos fetched successfully"))

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}