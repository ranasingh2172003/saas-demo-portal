export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Send immediate connection success
      const connectedEvent = `data: ${JSON.stringify({ type: 'status', status: 'connected' })}\n\n`;
      controller.enqueue(encoder.encode(connectedEvent));
      
      // Optionally simulate a message after a few seconds
      setTimeout(() => {
        const msgEvent = `data: ${JSON.stringify({ 
          type: 'message', 
          message: { id: 'mock-1', from: 'User', text: 'Hi, I need help with AC', timestamp: Date.now() } 
        })}\n\n`;
        controller.enqueue(encoder.encode(msgEvent));
      }, 5000);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
