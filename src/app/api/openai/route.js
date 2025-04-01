import { NextResponse } from "next/server";

export async function POST(req) {
  const OpenAI = require("openai");
  const openai = new OpenAI(process.env.OPENAI_API_KEY);

  // Log to check if the request is received
  console.log("Received a request...");

  // Extracting prompt from the request body
  let prompt = "";
  let duration = 15;

  try {
    // Log the raw request body to check if it is parsed correctly
    const body = await req.json();
    console.log("Request Body:", body);

    prompt = body.prompt;
    duration = body.duration;
    console.log("Extracted Prompt:", prompt);
    console.log("Duration of the story in seconds:", duration);
  } catch (error) {
    console.error("Error parsing request body:", error);
    return NextResponse.json({
      error: "Failed to parse request body",
    });
  }

  // Check if prompt is defined
  if (!prompt) {
    console.warn("No prompt provided in the request!");
    return NextResponse.json({
      error: "No prompt provided",
    });
  }

  // Prepare OpenAI API call
  console.log("Sending request to OpenAI with prompt...");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a children's tales writer. Your wrote and know the most popular french tales. 
          Your job is to write a tale in French based on the following prompt. Be subtle, draw inspiration 
          from successful French folk tales while remaining original. Do not talk about the skin color 
          of the child`,
        },
        {
          role: "user",
          //content : `Prompt: ${prompt}`,
          //content : `what was the previous tale ?`,
          content: `Prompt: ${prompt}\n. Écris un conte en français, donne un
          // titre au conte en utilisant la syntaxe suivante : "Titre :..." puis revient à la ligne.`,

        },
      ],
      max_tokens: 200// 5*duration, // Increased tokens for a longer story
    });

    // Log the OpenAI response
    console.log("OpenAI Response:", response);

    // Extract the story from the response
    const story = response.choices[0]?.message?.content?.trim() || "";

    return NextResponse.json({ story });
  } catch (error) {
    // Log any errors from the OpenAI API call
    console.error("Error calling OpenAI API:", error);
    return NextResponse.json({
      error: "Failed to generate story using OpenAI API",
    });
  }
}
