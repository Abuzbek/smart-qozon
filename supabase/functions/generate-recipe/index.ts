// supabase/functions/generate-recipe/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. CHECK API KEY
    const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!GEMINI_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error("Server Misconfiguration: Missing Keys");
    }

    const { ingredients, familyConfig, device_id } = body;

    // Connect to DB with Admin rights
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const today = new Date().toISOString().split('T')[0]; // "2024-12-30"

    const { data: usageData, error: usageError } = await supabase
      .from('daily_ai_usage')
      .select('request_count')
      .eq('device_id', device_id)
      .eq('usage_date', today)
      .single();

    // If they have a record and count is >= 2, BLOCK THEM
    if (usageData && usageData.request_count >= 2) {
      throw new Error("LIMIT_REACHED: Bugungi limit tugadi (2/2).");
    }

    const CURRENT_MONTH = new Date().getMonth()+1;
    // Security check: Don't log the full key, just the start
    console.log(`Key loaded: ${GEMINI_KEY.substring(0, 5)}...`);

    // 3. PARSE BODY
    let body;
    try {
      body = await req.json();
      console.log("Body parsed:", JSON.stringify(body));
    } catch (e) {
      console.error("JSON Parse Error:", e.message);
      throw new Error("Invalid JSON Body");
    }

    
    // 4. PREPARE PROMPT
    const prompt = `
      You are an expert Uzbek chef for a strictly Halal kitchen in Uzbekistan. LOOK RESPONSE SHOULD BE IN UZBEK LANGUAGE
      Current Season: ${CURRENT_MONTH} (Suggest heavy/warm meals for winter, light for summer).
      User's Ingredients: ${ingredients.join(', ')}.
      Family Size: ${familyConfig?.adults || 2} Adults, ${familyConfig?.children || 2} Children.

      TASK:
      Suggest 3 distinct recipes that match at least 90% of the User's Ingredients.
      Assume the user has basic pantry items (Salt, Oil, Water, Black Pepper).

      REQUIREMENTS:
      1. STRICTLY HALAL. No alcohol, no pork.
      2. QUANTITY LOGIC: Calculate total grams needed for this family size.
        - Rule: Adult = 400g portion, Child = 250g portion.
        - Total = (Adults * 400) + (Children * 250).
        - ADD 10% EXTRA to the final ingredient amounts for "baraka".
      3. MEASUREMENTS: Provide EVERY ingredient in BOTH Grams and Common Units (Cups, Tablespoons, Pieces).
        - Example: "Rice: 400g (2 cups)" or "Salt: 10g (1 tsp)".

      OUTPUT FORMAT (JSON ONLY no need extra messages or smth like that only json format message like this):
      [
        {
          "name_uz": "Name in Uzbek",
          "match_rate": 95,
          "cooking_time": "45 min",
          "ingredients": [
            {"name": "Rice", "amount": "440g (2.2 cups)"},
            {"name": "Meat", "amount": "300g (medium bowl)"}
          ],
          "steps": [
            "Step 1 instruction in Uzbek...",
            "Step 2 instruction in Uzbek..."
          ]
        },
        ... (2 more recipes)
      ]
    `

    // 5. CALL GOOGLE (Using Fetch)
    console.log("Sending request to Google...");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GOOGLE API ERROR: ${response.status}`, errorText);
      throw new Error(`Google Error: ${errorText}`);
    }

    const data = await response.json();
    console.log("Google Responded Success.", JSON.stringify(data));

    // 6. CLEANUP RESULT
    let aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();

    // We use "upsert" to handle both new users and existing users
    const currentCount = usageData ? usageData.request_count : 0;
    
    await supabase.from('daily_ai_usage').upsert({
      device_id: device_id,
      usage_date: today,
      request_count: currentCount + 1
    });

    return new Response(aiText, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("ERROR:", error.message);
    
    // Return specific status codes for the App to handle
    let status = 400;
    if (error.message.includes("LIMIT_REACHED")) status = 429; // Too Many Requests
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});