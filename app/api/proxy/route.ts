import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

export async function PUT(request: NextRequest) {
  return handleRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request);
}

async function handleRequest(request: NextRequest) {
  const searchParams = new URL(request.url).searchParams;
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing target URL' }, { status: 400 });
  }

  try {
    // Build the final target URL with all other query parameters
    const finalTargetUrl = new URL(targetUrl);
    searchParams.forEach((value, key) => {
      if (key !== 'url') {
        finalTargetUrl.searchParams.set(key, value);
      }
    });

    const finalUrlString = finalTargetUrl.toString();

    const headers = new Headers();
    // Copy relevant headers from the original request
    const headersToCopy = ['content-type', 'x-private-key', 'authorization'];
    headersToCopy.forEach(header => {
      const value = request.headers.get(header);
      if (value) headers.set(header, value);
    });

    const options: RequestInit = {
      method: request.method,
      headers: headers,
    };

    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const body = await request.text();
      if (body) options.body = body;
    }

    const response = await fetch(finalUrlString, options);
    const data = await response.text();

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (e) {
      jsonData = data;
    }

    return NextResponse.json(jsonData, { status: response.status });
  } catch (error: any) {
    console.error('[Proxy Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
