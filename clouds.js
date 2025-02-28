import Replicate from "replicate";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";

dotenv.config();

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
});

async function cloudGen() {
    try {
        console.log("Reading image...");
        const imageBuffer = readFileSync("./static/clouds.png");
        const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

        console.log("Sending request to Replicate...");
        const prediction = await replicate.predictions.create({
            version: "wavespeedai/wan-2.1-i2v-720p",
            input: {
                image: base64Image,
                prompt: "slow clouds pass from left to right gracefully, seamless looping animation",
                max_area: "1280x720",

                fps: 30,
                cfg_scale: 7.5,
                motion_bucket_id: 127
            }
        });

        console.log("🆔 Prediction ID:", prediction.id);

        let waitTime = 10000;
        const maxWaitTime = 30000;
        
        while (prediction.status !== "succeeded" && prediction.status !== "failed") {
            console.log(`⏳ Status: ${prediction.status}... Checking again in ${waitTime/1000}s`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            waitTime = Math.min(waitTime * 1.5, maxWaitTime);

            const updatedPrediction = await replicate.predictions.get(prediction.id);
            prediction.status = updatedPrediction.status;
            prediction.output = updatedPrediction.output;
        }

        if (prediction.status === "succeeded") {
            console.log("🎥 video generated successfully!");
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
cloudGen();
