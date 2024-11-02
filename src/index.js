import dotenv from "dotenv";
dotenv.config();
import connectDB from "./db/index.js";
import {app} from "./app.js"
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 3000, ()=>{
        console.log(`Server is running at port: ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGO db connnecttion failed", err)
})
// import mongoose from 'mongoose';
// import 'dotenv/config';
// import connectDB from './db/index.js';
// import { DB_NAME } from './constants.js';

// console.log('Starting the app...');
// console.log('Connecting to MongoDB...');

// connectDB()
//   .then(() => console.log('MongoDB connection established.'))
//   .catch(err => console.error('Failed to connect to MongoDB:', err));


// ( async ()=>{
//     try {
//        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
//     } catch (error) {
//         console.error("ERROR:", error)
//         throw error
//     }
// })()