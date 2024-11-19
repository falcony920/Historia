import { config } from "dotenv";
config();

export async function POST(request, res) {
  // Step 1: Log initial request
  console.log("Received request for ElevenLabs API");

  try {
    // Step 2: Parse the incoming request body
    const body = await request.json();
    let { textInput } = body;

    if (!textInput) {
      console.error("Missing text input");
      return new Response(JSON.stringify({ error: "Missing text input" }), { status: 400 });
    }

    console.log("Text input received:", textInput);

    // Step 3: Define voice ID and API URL
    let voice_id = "aQROLel5sQbj1vuIVi6B"; // Ensure this is a valid voice ID available in your ElevenLabs account
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`;

    // Step 4: Prepare headers and request body
    const headers = {
      Accept: "audio/mpeg",
      "xi-api-key": process.env.ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
    };

    if (!process.env.ELEVENLABS_API_KEY) {
      console.error("Missing ElevenLabs API Key");
      return new Response(JSON.stringify({ error: "Missing ElevenLabs API Key" }), { status: 500 });
    }

    const reqBody = JSON.stringify({
      text: textInput,
      // model_id: "eleven_monolingual_v1",
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
      },
    });

    console.log("Making API request to ElevenLabs:", url);
    console.log("Request body:", reqBody);

    // Step 5: Make the API request
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: reqBody,
    });

    // Step 6: Check the response status
    if (!response.ok) {
      console.error("API request failed with status:", response.status);
      const errorText = await response.text();
      console.error("Error response text:", errorText);
      return new Response(JSON.stringify({ error: `API Error: ${response.statusText}`, details: errorText }), { status: response.status });
    }

    console.log("API request successful");

    // Step 7: Handle the audio response
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("Audio buffer received successfully");
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'attachment; filename="output.mp3"',
      },
    });
  } catch (error) {
    console.error("Error in ElevenLabs API request:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
