import Replicate from "replicate";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";

dotenv.config();

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
});

async function generateVideo() {
    try {
        console.log("Reading image...");
        const imageBuffer = readFileSync("./static/mountain.png");
        const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

        console.log("Sending request to Replicate...");
        const prediction = await replicate.predictions.create({
            version: "wavespeedai/wan-2.1-i2v-720p",
            input: {
                image: base64Image,
                prompt: "snow melting like icecream slowly from the top of the mountain, perfectly seemless looping animation",
                // motion_bucket_id: 127,
                max_area: "1280x720"
            }
        });

        console.log("🆔 Prediction ID:", prediction.id);

        // Polling the API to wait for completion
        while (prediction.status !== "succeeded" && prediction.status !== "failed") {
            console.log(`⏳ Status: ${prediction.status}... Checking again in 20s`);
            await new Promise(resolve => setTimeout(resolve, 20000)); // Wait 20 seconds

            // Fetch updated status
            const updatedPrediction = await replicate.predictions.get(prediction.id);
            prediction.status = updatedPrediction.status;
            prediction.output = updatedPrediction.output;
        }

        if (prediction.status === "succeeded") {
            console.log("🎥 Video generated successfully!");
            console.log("✅ Video URL:", prediction.output);
        } else {
            console.log("❌ Video generation failed.");
        }

        return prediction.output;
    } catch (error) {
        console.error("❌ Error generating video:", error);
        throw error;
    }
}

// Automatically execute the function
generateVideo();