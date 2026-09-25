import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all rows from payment_bookings table in Supabase
    const { data: rows, error: dbError }: {
      data: Array<Record<string, any>> | null;
      error: { message: string } | null;
    } = await supabase
      .from('payment_bookings')
      .select('*');

    if (dbError) {
      throw new Error(`Database Error: ${dbError.message}`);
    }

    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({ message: "No data found in payment_bookings" }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 200
      });
    }

    // Forward all rows to Google Sheets, ensuring the payment mode column is included
    const rowsToSync: Array<Record<string, any>> = rows.map((row: Record<string, any>) => ({
      ...row,
      payment_mode: row.payment_mode ?? '',
    }));

    const encodedData = 'data=' + encodeURIComponent(JSON.stringify(rowsToSync));

    const response = await fetch('https://script.google.com/macros/s/AKfycbx1Ef6djSfs8Xfb_adXOEvEZQg2Lfb0DiPFVhuz5I5Y_yI1hujfaw2M0GekcMaqHAZR/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodedData
    });

    const text = await response.text();
    return new Response(JSON.stringify({ message: "Sync successful", googleResponse: text, rowsCount: rows.length }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: response.status
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: 500
    });
  }
})
