import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if (!name || !name.trim()) {
        throw new ApiError(400, "Name is required")
    }

    if (!description || !description.trim()) {
        throw new ApiError(400, "Description is required")
    }

    const playlist = new Playlist({
        name,
        description,
        userId: req.user._id,
        videos: [],

    })

    await playlist.save()

    res.status(200).json(new ApiResponse(200, playlist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if (!userId.lenght) {
        throw new ApiError(400, "Enetr valid Id")
    }

    const playlists = await Playlist.find({userId})

    if (playlists.length === 0) {
        return res.status(404).json(new ApiResponse(404, {}, "Noplaylists found"))
    }

    return res.status(200).json(new ApiResponse(200, playlists, "Playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if (!playlistId) {
        throw new ApiError(400, "Enter valid id")
    }

    const playlists = await Playlist.findById(playlistId)

    if (!playlists) {
        return res.status(404).json(new ApiResponse(404, {}, "Noplaylists found"))
    }

    return res.status(200).json(new ApiResponse(200, playlists, "Playlists fetched successfully"))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!playlistId) {
        throw new ApiError(400, "Enter valid playlist id")
    }

    if (!videoId) {
        throw new ApiError(400, "Enter valid videoId")
    }

    const playlists = await Playlist.findById(playlistId)

    if (!playlists) {
        throw new ApiError(404, "No playlist found")
    }

    playlists.videos.push(videoId)

    await playlists.save()

    return res.status(200).json(new ApiResponse(200, playlists, "Video added successfully"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if (!(playlistId && videoId)) {
        throw new ApiError(400, "Valid id needed")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {videos: videoId}
        },
        {
            new: true
        }
    
    )

    if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist dosent exist")
    }

    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if (!playlistId) {
        throw new ApiError(400, "Enter valid id")
    }

    const delPlaylist = await Playlist.deleteOne({_id: playlistId})

    if (delPlaylist.deletedCount === 0) {
        throw new ApiError(404, "No playlist found")
    }

    return res.status(200).json(new ApiResponse(200, {}, "Deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if (!playlistId || (!name || !description)) {
        throw new ApiError(400, "Id or name and description is missing")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            ...(name && { name }),
            ...(description && { description })
        },
        {
            new: true
        }
    )

    if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}