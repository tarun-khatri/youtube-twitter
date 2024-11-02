import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {

    const {text} = req.body

    if (!text || !text.trim()) {
        throw new ApiError(400, "Tweet cant be empty")
    }

    const newTweet = new Tweet({
        text,
        userId: req.user._id
    })

    await newTweet.save()

return res.status(201).json(new ApiResponse(201,newTweet, "Tweet has been created"))
})

const getUserTweets = asyncHandler(async (req, res) => {

    const {twitterUserId} = req.params

    if (!twitterUserId) {
        throw new ApiError(400, "Enter valid id")
    }

    const user = await User.findById(twitterUserId)

    if (!user) {
        throw new ApiError(404, "No user found")
    }

    const tweets = await Tweet.find({userId: twitterUserId})

    res.status(200).json(new ApiResponse(200, tweets, "Tweets fetched"))
})

const updateTweet = asyncHandler(async (req, res) => {

    const {tweetId} = req.params
    const {text} = req.body

    if (!tweetId) {
        throw new ApiError(400, "Enter valid tweet id")
    }

    if (!text || !text.trim()) {
        throw new ApiError(400, "Tweet cannot be empty")

    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            text,
        },
        {
            new: true
        }
    )

    if (!updatedTweet) {
        throw new ApiError(404, "Tweet not found")
    }

    res.status(200).json(new ApiResponse(200, updatedTweet, "Tweet updated"))
})

const deleteTweet = asyncHandler(async (req, res) => {

    const {tweetId} = req.params

    if (!tweetId) {
        throw new ApiError(400, "Enter the valid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "No tweet found")
    }

    if (!tweet.userId.equals(req.user._id)) {
        throw new ApiError(400, "Unauthorized error")
    }

    await Tweet.deleteOne({_id: tweetId})

    res.status(200).json(new ApiResponse(200, "Tweet deleted"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}