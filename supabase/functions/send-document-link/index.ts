import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export interface SendDocumentPayload {
  customerPhone: string;
  documentType: 'quote' | 'invoice' | 'receipt';
  documentId: string;
  channel: 'sms' | 'whatsapp';
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: SendDocumentPayload = await req.json();

    const { customerPhone, documentType, documentId, channel } = payload;

    if (!customerPhone || !documentType || !documentId || !channel) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields in payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const docTitle =
      documentType === 'quote'
        ? 'Quotation'
        : documentType === 'invoice'
        ? 'Invoice'
        : 'Receipt';

    const documentLink = `https://erp.app/docs/${documentType}/${documentId}`;
    const messageBody = `Hello, your ERP ${docTitle} #${documentId} is ready. View document: ${documentLink}`;

    // Initialize Supabase Client to insert log into notification_logs
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const providerResponse = { success: true, provider: channel };

    // Format provider payload for Twilio / Meta WhatsApp Cloud API / Africa's Talking
    if (channel === 'whatsapp') {
      // Stub payload for Meta WhatsApp Cloud API / Twilio WhatsApp
      const whatsappPayload = {
        messaging_product: 'whatsapp',
        to: customerPhone,
        type: 'template',
        template: {
          name: 'send_document_notice',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: docTitle },
                { type: 'text', text: documentId },
                { type: 'text', text: documentLink },
              ],
            },
          ],
        },
      };
      console.log('Sending WhatsApp Payload:', JSON.stringify(whatsappPayload));
    } else {
      // Stub payload for Twilio / Africa's Talking SMS API
      const smsPayload = {
        to: customerPhone,
        from: 'ERP_NOTIFY',
        message: messageBody,
      };
      console.log('Sending SMS Payload:', JSON.stringify(smsPayload));
    }

    // Insert record into notification_logs table
    const { error: dbError } = await supabase.from('notification_logs').insert([
      {
        recipient_phone: customerPhone,
        channel,
        message_body: messageBody,
        status: 'sent',
      },
    ]);

    if (dbError) {
      console.error('Failed to log notification into DB:', dbError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${docTitle} link dispatched via ${channel} successfully.`,
        data: providerResponse,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
