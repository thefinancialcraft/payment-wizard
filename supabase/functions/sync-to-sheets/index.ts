import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const googleScriptUrl = Deno.env.get('GOOGLE_SCRIPT_URL')!

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse the request body
    const { record, table } = await req.json()

    console.log('Received webhook:', { table, record })

    // Only process payment_bookings table
    if (table !== 'payment_bookings') {
      return new Response('Ignored: Not payment_bookings table', { status: 200, headers: corsHeaders })
    }

    // Send data to Google Apps Script
    const response = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Script error:', errorText)
      throw new Error(`Google Script failed: ${errorText}`)
    }

    const result = await response.json()
    console.log('Google Script response:', result)

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
