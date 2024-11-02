import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (pageNumber < 1 || limitNumber < 1) {
        throw new ApiError(400, "Page and limit must be greater than 0");
    }

    const filter = {};
    if (userId) {
        filter.userId = userId;
    }

    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: "i" } }, 
            { description: { $regex: query, $options: "i" } } 
        ];
    }

    const sortOptions = {};
    if (sortBy) {
        sortOptions[sortBy] = sortType === 'asc' ? 1 : -1; 
    }

    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

    const totalCount = await Video.countDocuments(filter);

    res.status(200).json(new ApiResponse(200, { videos, totalCount, currentPage: pageNumber, totalPages: Math.ceil(totalCount / limitNumber) }, "Videos fetched successfully"));
});


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body

    if (!(title.trim() && description.trim())) {
        throw new ApiError(400, "Title and description is mandatory")
    }

    if (!req.file) {
        throw new ApiError(400, "Video file is required")
    }

    const videoFilePath = req.file.path

    const uploadResult = await uploadOnCloudinary(videoFilePath)

    const newVideo = new Video({
        title,
        description,
        video: uploadResult.secure_url,
        userId: req.user._id
    })

    await newVideo.save()

    return res.status(201).json(new ApiResponse(201, newVideo, "Video published"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if (!videoId) {
        throw new ApiError(400, "enter the valid ID")
    }

    const getVideo = await Video.findById(videoId)

    if (!getVideo) {
        throw new ApiError(404, "No video found")
    }

    res.status(200).json(new ApiResponse(200, getVideo, "Video fetched successfully"))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title, description} = req.body

    if (!videoId) {
        throw new ApiError(400, "Enter the valid ID")
    }

    if (!title && !description && !req.file) {
        throw new ApiError(400, "Atleast one feild id required")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

   const updateObject = {}

   if (title) {
    updateObject.title = title
   }
   if (description) {
    updateObject.description = description
   }

   if (req.file) {
    const thumnailUpload = await uploadOnCloudinary(req.file.path)
    if (thumnailUpload && thumnailUpload.url) {
        updateObject.thumbnail = thumnailUpload.url
    }
   }

   const updatedVideo = await Video.findByIdAndUpdate(videoId, updateObject, {new : true})

   res.status(200).json(new ApiResponse(200, updatedVideo, "Video updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!videoId) {
        throw new ApiError(400, "Enter the valid Id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "No video found")
    }

    if (!video.user._id.equals(req.user._id)) {
        throw new ApiError(403, "Unauthorized access")
    }

    await Video.deleteOne({_id: videoId})

    res.status(200).json(new ApiResponse(200, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Enter the valid ID")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "No video found")
    }

    if (!video.user._id.equals(req.user._id)) {
        throw new ApiError(403, "Unauthorized access")
    }

    video.isPublished = !video.isPublished

    await video.save()

    res.status(200).json(new ApiResponse(200, video, "Video is set"))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}