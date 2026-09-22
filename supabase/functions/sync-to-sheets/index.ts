import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx1Ef6djSfs8Xfb_adXOEvEZQg2Lfb0DiPFVhuz5I5Y_yI1hujfaw2M0GekcMaqHAZR/exec';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    // Parse the request body
    // Supports both:
    // 1. Database webhook trigger: { type: "INSERT", table: "payment_bookings", record: {...}, schema: "public" }
    // 2. Direct call: { record: {...}, table: "payment_bookings" }
    const body = await req.json();

    console.log('Received payload:', JSON.stringify(body));

    const record = body.record;

    if (!record) {
      return new Response(
        JSON.stringify({ message: 'No record found in payload' }),
        {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          status: 400
        }
      );
    }

    // Only process payment_bookings table
    if (body.table && body.table !== 'payment_bookings') {
      return new Response(
        JSON.stringify({ message: 'Ignored: not payment_bookings table' }),
        {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          status: 200
        }
      );
    }

    // Forward record data to Google Apps Script
    const sheetData = {
      booking_id: record.booking_code,
      policy_holder_name: record.policy_holder_name,
      contact_no: record.contact_no,
      email: record.email,
      number_of_members: record.number_of_members,
      pincode: record.pincode,
      city: record.city,
      district: record.district,
      state: record.state,
      country: record.country,
      payment_date: record.payment_date,
      payment_month: record.payment_month,
      effective_date: record.effective_date,
      next_renewal_date: record.next_renewal_date,
      month: record.month,
      insurance_company: record.insurance_company,
      plan_name: record.plan_name,
      policy_type: record.policy_type,
      health_checkup: record.health_checkup,
      extra_bonus: record.extra_bonus,
      tenure: record.tenure,
      premium: record.premium,
      net_premium: record.net_premium,
      discount_offer: record.discount_offer,
      discount_offer_type: record.discount_offer_type,
      updated_premium: record.updated_premium,
      employee_name: record.employee_name,
      team: record.team,
      previous_company: record.previous_company,
      business_type: record.business_type,
      assistant_team: record.assistant_team,
      relationship_manager: record.relationship_manager,
      agent_code: record.agent_code,
      proposal_no: record.proposal_no,
      grade: record.grade,
      lead_source: record.lead_source,
      payment_proof: record.payment_proof,
      created_at: record.created_at,
    };

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sheetData),
    });

    const responseText = await response.text();
    console.log('Google Script response:', responseText);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Synced to Google Sheets successfully',
        googleResponse: responseText,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 200
      }
    );

  } catch (err) {
    console.error('Error:', err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 500
      }
    );
  }
});
