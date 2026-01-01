// supabase/functions/generate-recipe/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // 1. Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. CHECK API KEY
    const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!GEMINI_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error("Server Misconfiguration: Missing Keys");
    }

    // 3. PARSE BODY
    let body;
    try {
      body = await req.json();
      console.log("Body parsed:", JSON.stringify(body));
    } catch (e) {
      console.error("JSON Parse Error:", e.message);
      throw new Error("Invalid JSON Body");
    }

    const { ingredients, familyConfig, device_id } = body;

    // Connect to DB with Admin rights
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const today = new Date().toISOString().split("T")[0]; // "2024-12-30"

    const { data: usageData, error: usageError } = await supabase
      .from("daily_ai_usage")
      .select("request_count")
      .eq("device_id", device_id)
      .eq("usage_date", today)
      .single();

    // If they have a record and count is >= 2, BLOCK THEM
    if (usageData && usageData.request_count >= 2) {
      throw new Error("LIMIT_REACHED: Bugungi limit tugadi (2/2).");
    }

    const CURRENT_MONTH = new Date().getMonth() + 1;
    // Security check: Don't log the full key, just the start
    console.log(`Key loaded: ${GEMINI_KEY.substring(0, 5)}...`);

    // 4. PREPARE PROMPT
    const systemPrompt = `
      ROLE: You are an expert International Chef specialized in "Halal Adaptation".
      You know REAL, AUTHENTIC recipes from Uzbekistan, Italy, Turkey, Japan, Mexico and other countries.

      USER CONTEXT:
      - Location: Uzbekistan (User has limited access to exotic ingredients).
      - Available Ingredients: ${
        ingredients ? ingredients.join(", ") : "Meat, Onion, Potato"
      }.
      - Family Size: ${familyConfig?.adults || 2} ${
      familyConfig?.children || 0
    } Adults.

      STRICT RULES:
      1. **AUTHENTICITY:** You must suggest REAL dishes with their ORIGINAL names (e.g., "Fettuccine Alfredo", "Kazan Kebab", "Menemen"). DO NOT INVENT names like "Uzbek style fried soup".
      2. **HALAL ADAPTATION:** - If a recipe uses Pork/Bacon -> Substitute with Beef/Lamb or Smoked Beef (Kolbasa).
        - If a recipe uses Wine -> Substitute with Grape Vinegar or Lemon Juice.
      3. **STRICT MATCH RATE CALCULATION:**
        - Start at 100%.
        - Look recipe if MAIN ingredient is missing do not show like user asks, (potato and onion, do not show Qozon kabob because without beef or mutton Qozon kabob is not possible, think which ingredient is MAIN and which is secondary ingredient, (Qozon kabob is just example it can be all recipe, rice for risotto, or pilaf like this I repeat again do not show if MAIN ingredients is missing) and calculate % from ingredient ).
        - Try to find a meal for the user using all of their products, if not, remove some ingredients but keep the ingredients that claim to be the MAIN ones.
        - Do NOT count Water, Salt, Black Pepper, Oil, and Sugar as "missing" ingredients (assume user has them and do not add Olive oil, avacado oil and like this oil as just oil in Uzbekistan people use sunflower oil, and count sunflower oil as oil, and add after olive oil, avacado oil after (yoki O'simlik yog'i)).
        - If the match rate is below 50%, do not show the recipe.
      4. **LOCALIZATION:** Use ingredients found in Tashkent bazaars.
      5. **PORSION:** Write porsion size. and make food 10-15% more than the user's family size (typically Uzbek's eat more).

      OUTPUT FORMAT (JSON ARRAY ONLY, UZBEK LANGUAGE):
      Return exactly 3 recipes in this JSON structure:
      [
        {
          "name_original": "Original Name (e.g. Shepherd's Pie)",
          "name_uz": "Uzbek Name (e.g. Cho'pon Pirogi)",
          "name_en": "English Name (e.g. Shepherd's Pie)",
          "name_ru": "Russian Name (e.g. Shepherd's Pie)",
          "porsion": 2, // write porsion size with number or number range as string (e.g. 2 or "2-3")
          "match_rate": 85,
          "difficulty": "4", // or rate from 1 to 5
          "cooking_time": "45 min", 
          "cuisine_type": "Davlat (e.g. Angliya)",
          "calories": "650 kcal",
          "ingredients": [
            // List ONLY ingredients needed for this recipe
            {"name": "Kartoshka", "amount": "4 dona"},
            {"name": "Mol go'shti (qiyma)", "amount": "300g"}
          ],
          "missing_ingredients": [
            // List items the user DOES NOT have but needs to buy/add
            "Sut (Milk)", "Saryog' (Butter)" 
          ],
          "steps": [
            "1. Kartoshkani qaynatib, pyure qiling...",
            "2. Go'shtni piyoz bilan qovuring..."
          ]
        }
      ]
      `;

    // 5. CALL GOOGLE (Using Fetch)
    console.log("Sending request to Google...");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GOOGLE API ERROR: ${response.status}`, errorText);
      throw new Error(`Google Error: ${errorText}`);
    }

    const data = await response.json();
    console.log("Google Responded Success.", JSON.stringify(data));

    // 6. CLEANUP RESULT (FIXED SECTION)
    let aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    // FIX: Find the FIRST '[' and LAST ']' to extract ONLY the JSON array.
    // This ignores any "Here is your recipe:" text before the JSON.
    const firstBracket = aiText.indexOf("[");
    const lastBracket = aiText.lastIndexOf("]");

    if (firstBracket !== -1 && lastBracket !== -1) {
      aiText = aiText.substring(firstBracket, lastBracket + 1);
    } else {
      // Fallback: If AI returned no array, send empty list instead of crashing
      console.error("AI returned invalid format:", aiText);
      aiText = "[]";
    }

    // Double Check: Ensure it parses here. If not, return [] to avoid Client Crash.
    try {
      JSON.parse(aiText);
    } catch (e) {
      console.error("JSON Clean Failed:", e);
      aiText = "[]";
    }

    // 7. DB UPSERT
    const currentCount = usageData ? usageData.request_count : 0;
    await supabase.from("daily_ai_usage").upsert({
      device_id: device_id,
      usage_date: today,
      request_count: currentCount + 1,
    });

    return new Response(aiText, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ERROR:", error.message);

    // Return specific status codes for the App to handle
    let status = 400;
    if (error.message.includes("LIMIT_REACHED")) status = 429; // Too Many Requests

    return new Response(JSON.stringify({ error: error.message }), {
      status: status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
