// Script to list available Gemini models using the API key
async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in process.env");
    return;
  }
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    if (data.models) {
      console.log("Available models:", data.models.map((m) => m.name));
    } else {
      console.log("Response:", data);
    }
  } catch (err) {
    console.error("Failed to fetch models:", err);
  }
}
run();
