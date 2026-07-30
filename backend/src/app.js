import express from "express" ;
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}));


app.use(express.json({
    limit : "16kb"
}));

app.use(express.urlencoded(
    {
        extended :true,
        limit : "16kb"
    }
));

app.use(express.static("public"));

app.use(cookieParser());


import userRouter from "./routes/user.routes.js"

app.use("/api/v1/users", userRouter)
// this will route to the user router and whatever follows after users in the url will  be handled there eg. http://localhost:8000/api/v1/users/register register will be needed to be defined there as well

export default app;