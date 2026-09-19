async function runTest() {
  console.log("=========================================");
  console.log("🚀 STARTING E2E AI PIPELINE TEST");
  console.log("=========================================\n");

  console.log("1️⃣ TESTING LLM ROUTE (NVIDIA Nemotron-Mini via Next.js API)");
  try {
    const chatStartTime = Date.now();
    const chatRes = await fetch("http://localhost:3000/api/voice/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemPrompt: "You are a helpful SaaS agent. Keep it extremely brief.",
        messages: [{ role: "user", content: "Hello! What is your name and what model are you running on?" }]
      })
    });
    
    if (!chatRes.ok) throw new Error("Chat API failed with status " + chatRes.status);
    
    // Read the stream
    const reader = chatRes.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullResponse += decoder.decode(value);
    }
    
    const chatLatency = Date.now() - chatStartTime;
    console.log("✅ LLM SUCCESS!");
    console.log(`⏱️ Latency: ${chatLatency}ms`);
    console.log(`🤖 Agent Response: "${fullResponse.trim()}"\n`);

    console.log("2️⃣ TESTING TTS ROUTE (Coqui XTTS via Next.js API)");
    const ttsStartTime = Date.now();
    const ttsRes = await fetch("http://localhost:3000/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: fullResponse.trim().substring(0, 50) }) // Test first 50 chars
    });

    if (!ttsRes.ok) throw new Error("TTS API failed with status " + ttsRes.status);
    
    const audioBuffer = await ttsRes.arrayBuffer();
    const ttsLatency = Date.now() - ttsStartTime;
    
    console.log("✅ TTS SUCCESS!");
    console.log(`⏱️ Latency: ${ttsLatency}ms`);
    console.log(`🎵 Audio Generated: ${audioBuffer.byteLength} bytes of WAV audio data.\n`);

    console.log("=========================================");
    console.log("🎉 ALL END-TO-END TESTS PASSED!");
    console.log("=========================================");
    
  } catch (err) {
    console.error("❌ E2E TEST FAILED:", err);
  }
}
runTest();
