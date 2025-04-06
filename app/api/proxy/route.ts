import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  
  try {
    // Forward the request to the FastAPI backend
    const response = await fetch('http://localhost:8000/summarize/', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to summarize document');
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to FastAPI:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
  
  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }
  
  try {
    const response = await fetch(`http://localhost:8000/download/${filename}`);
    
    if (!response.ok) {
      throw new Error('Failed to download file');
    }
    
    const blob = await response.blob();
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}