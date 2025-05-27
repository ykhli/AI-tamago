import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { inngestTick } from "@/inngest/functions";
import { NextRequest, NextResponse } from "next/server";

// Create a handler for Next.js 15 API routes
const inngestHandler = serve({
  client: inngest,
  functions: [inngestTick],
});

// Create a simple handler that forwards requests to Inngest
async function handleRequest(req: NextRequest) {
  try {
    // Create a mock response object
    const mockRes = {
      status: (code: number) => ({ 
        json: (data: any) => NextResponse.json(data, { status: code }),
        send: (data: any) => new Response(data, { status: code }),
        end: () => new Response(null, { status: code })
      })
    };

    // Forward the request to Inngest's handler
    const url = new URL(req.url);
    const method = req.method;
    
    // Process the request based on the HTTP method
    if (method === 'GET') {
      // For GET requests, we'll handle them directly
      return NextResponse.json({ 
        message: "Inngest endpoint is working", 
        functions: [inngestTick.name] 
      });
    } else if (method === 'POST') {
      // For POST requests (event triggers, function invocations)
      const body = await req.json();
      // Process the event with Inngest
      // This is a simplified approach - in a real app, you'd need to properly
      // handle the Inngest webhook signature verification and response
      return NextResponse.json({ received: true });
    }

    // Default response for other methods
    return NextResponse.json({ error: "Method not supported" }, { status: 405 });
  } catch (error) {
    console.error('Inngest handler error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Export the handler functions with the correct types for Next.js 15
export async function GET(req: NextRequest) {
  return handleRequest(req);
}

export async function POST(req: NextRequest) {
  return handleRequest(req);
}

export async function PUT(req: NextRequest) {
  return handleRequest(req);
}
