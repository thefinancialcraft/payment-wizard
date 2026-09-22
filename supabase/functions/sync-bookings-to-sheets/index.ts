import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

Deno.serve(async (req) => {
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
    const { data: rows, error: dbError } = await supabase
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

    // Forward all rows to Google Sheets
    const encodedData = 'data=' + encodeURIComponent(JSON.stringify(rows));

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
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: 500
    });
  }
})
