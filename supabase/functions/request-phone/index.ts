// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");

Deno.serve(async (req) => {
  const { telegram_data } = await req.json();

  // 1. Parse 'telegram_data' to get the User ID (and verify signature if strict)
  const params = new URLSearchParams(telegram_data);
  const user = JSON.parse(params.get("user"));
  const chatId = user.id;

  // 2. Send the "Share Contact" button to the user via Telegram API
  const response = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "Please tap the button below to verify your phone number:",
        reply_markup: {
          keyboard: [
            [
              {
                text: "📱 Share Phone Number",
                request_contact: true, // This is the magic key
              },
            ],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      }),
    }
  );

  return new Response("Request Sent", { status: 200 });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/request-phone' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
