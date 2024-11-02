import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!channelId) {
        throw new ApiError(400,"Enter the valid Channel ID")
    }

    const channel = await Subscription.findById(channelId)

    if (!channel) {
        throw new ApiError(404, "No channel found")
    }

    const userId = req.user._id

    const isSubscribed = await Subscription.findOne({
        subscriber : userId,
        channel: channelId
    })

    if (isSubscribed) {
        await Subscription.deleteOne({_id: isSubscribed._id})
        res.status(200).json(new ApiResponse(200, "Unsubscribed successfully"))
    } else {
        await Subscription.create({
            subscriber: userId,
            channel: channelId
        })

        res.status(200).json(new ApiResponse(200, "Subscribed successfully"))
    }

})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!channelId) {
        throw new ApiError(400, "Enter the valid ID")
    }

    const subscribers = await Subscription.find({channel: channelId})

    if (subscribers.length === 0) {
        res.status(200).json(new ApiResponse(200, [], "No subscribers found"))
    } else {
        res.status(200).json(new ApiResponse(200, subscribers, "Subscriber fetched successfully"))
    }
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!subscriberId) {
        throw new ApiError(400, "Enter the valid ID")
    }

    const channel = await Subscription.find({subscriber: subscriberId}).populate("channel", "name")

    if (channel.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No subscried channel"))
    }

    return res.status(200).json(new ApiResponse(200, channel, "Subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}