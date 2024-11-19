import { NextResponse } from "next/server";

export async function POST(req) {
    const body = await req.json();
    const { story } = body;
    let allImages = [];

    const prompts = await getPrompts(story);

    // Limit to only the first prompt generated by OpenAI
    const limitedPrompts = prompts.slice(0, 1); // Only use the first prompt

    for (let i = 0; i < limitedPrompts.length; i++) {
        const text_prompts = [{ text: limitedPrompts[i] }]; // Use limitedPrompts here
        try {
            const response = await fetch(
                "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
                    },
                    body: JSON.stringify({ text_prompts }),
                }
            );

            const images = await response.json();

            // Check if the artifacts array exists and has at least one element
            if (images?.artifacts && images.artifacts.length > 0) {
                allImages.push(images.artifacts[0].base64);
            } else {
                console.error("No artifacts found in the response:", images);
                allImages.push(null); // Push null or handle as needed
            }
        } catch (error) {
            console.error("Error fetching image from Stability AI:", error);
            allImages.push(null); // Push null in case of error to maintain array length
        }
    }

    return NextResponse.json({ images: allImages });
}

async function getPrompts(story) {
    const OpenAI = require("openai");
    const openai = new OpenAI(process.env.OPENAI_API_KEY);

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a friendly assistant. Your job is to generate 1 image prompt in english based on the following story. The prompt should be a short but precise descriptive sentence. Try to generate the prompt using only the key elements of the story, like the characters, the places. For example, "a boy running in a field at sunset" or "a mysterious white creature standing in the middle of the forest".`,
                },
                {
                    role: "user",
                    content: `story: ${story}\n`,
                },
            ],
        });

        // Ensure we handle undefined responses safely
        const promptContent = response.choices[0]?.message?.content?.trim() || "";
        const prompts = promptContent.split("|").map((p) => p.trim()).filter(Boolean);

        return prompts;
    } catch (error) {
        console.error("Error generating prompts with OpenAI:", error);
        return [];
    }
}
