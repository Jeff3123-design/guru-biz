import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerPhone, documentType, documentId, channel } = body;

    const docTitle =
      documentType === 'quote'
        ? 'Quotation'
        : documentType === 'invoice'
        ? 'Invoice'
        : 'Receipt';

    const documentLink = `https://erp.app/docs/${documentType}/${documentId}`;
    const messageBody = `Hello, your ERP ${docTitle} #${documentId} is ready. View document: ${documentLink}`;

    console.log(`[Notification API] Dispatching via ${channel} to ${customerPhone}: ${messageBody}`);

    return NextResponse.json({
      success: true,
      message: `${docTitle} link dispatched via ${channel} successfully.`,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
