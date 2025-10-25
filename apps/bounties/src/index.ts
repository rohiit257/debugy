import dotenv from "dotenv"

// Load environment variables FIRST before any other imports
dotenv.config()

import express from "express"
import cors from "cors"
import OnChainBountyRoute from "./routes/OnChainBountyRoute"
import SubmissionRoute from "./routes/SubmissionRoute"

const app = express()

app.use(express.json())
app.use(cors({
    origin: "http://localhost:3000"
}))

// Use fully on-chain bounty routes
app.use("/bounties", OnChainBountyRoute)
app.use("/submissions", SubmissionRoute)

app.listen(8001, () => {
    console.log("Server started on port 8001")
})