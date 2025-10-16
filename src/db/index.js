import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";


const connectDB = async()=>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) ;
        console.log(`\n MONGODB connected !! DB HOST :  ${connectionInstance.connection.host}`)
    } catch(error){
        console.error("MONGODB connection FAILED ", error);
        process.exit(1);
    }
}

export default connectDB

// const connectDB_Promise = ()=>{
//     mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//     .then((connectionInstance)=>{
//         console.log(`MONGODB connected successfully. DB HOST : ${connectionInstance.connection.host}`);
//     })
//     .catch((error)=>{
//         console.error("MONGODB connection FAILED ", error);
//         process.exit(1);
//     })
// }

// export default connectDB_Promise;


//using event listeners :

// const setupConnectionEvents = () =>{
//     mongoose.connection.on('connected', ()=>{
//         console.log(`MONGODB connected to host : ${mongoose.connection.host}`);
//     })

//     mongoose.connection.on('error', (err)=>{
//         console.error("MONGODB connection Failed : ", err);
//     })
    
//     mongoose.connection.on('disconnected', ()=>{
//         console.log(`MONGODB disconnected`);
//     });
// };

// const connectDB_Events = async() =>{
//     setupConnectionEvents();
//     try{
//         mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     }
//     catch(err){
//         console.error("MONGODB initital connection FAILED : ", err);
//         process.exit(1);
//     }
// }

// export default connectDB_Events