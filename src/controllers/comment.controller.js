import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    try {
        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            throw new ApiError(400, "Invalid video ID")
        }

        const skip = (page -1) * limit

        const comments = await Comment.find({videoId: videoId}).skip(skip).limit(limit).sort({createdAt: -1})

        const totalComments = await Comment.countDocuments({videoId: videoId})

        res.status(200).json(new ApiResponse(200, {
            page: parseInt(page),
            limit: parseInt(limit),
            totalComments,
            comments
        }, "Comments retrived successfully"))


    } catch (error) {
        throw new ApiError(500, "Failed to retrieve comments")
    }
})

const addComment = asyncHandler(async (req, res) => {

    const {videoId} = req.params
    const {text}= req.body
    const userId = req.user?._id

    if (!text || !text.trim()) {
        throw new ApiError(400, "Comment text is required")
    }

    const newCommment = new Comment({
        videoId,
        userId,
        text: text.trim()
    })

    await newCommment.save();

    res.status(200).json(new ApiResponse(201, newCommment, "Comment added successfully"))

})

const updateComment = asyncHandler(async (req, res) => {

    const {commentId} = req.params
    const {text} = req.body

    if (!commentId) {
        throw new ApiError(400, "Comment id is required")
    }

    if (!text || !text.trim()) {
        throw new ApiError(400, "Comment text is required")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
         {
            $set: {
                text: text
            }
        },
        {new: true}
)

    res.status(200).json(new ApiResponse(200, updatedComment, "Updated sucessfully"))



})

const deleteComment = asyncHandler(async (req, res) => {

    const {commentId} = req.params

    if (!commentId) {
        throw new ApiError(400, "Enter the valid comment Id")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    res.status(200).json(200, deletedComment, "Comment deleted sucessfully")

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }