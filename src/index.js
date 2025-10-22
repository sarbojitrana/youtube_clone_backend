import dotenv from "dotenv";
import connectDB from "./db/index.js";

import app from "./app.js"

dotenv.config({
    path: './.env'
})

connectDB()
.then(() =>{

    app.on("error", (error)=>{
        console.log("ERROR : ", error);
        throw error
    })

    const PORT = process.env.PORT || 8000;

    app.listen(PORT,() =>{
        console.log(`Server is running at port : ${PORT}`) ;
    })
})
.catch((err) =>{
    console.log("MONGO db connection failed !!!", err);
})
