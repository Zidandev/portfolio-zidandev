import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// In-memory rate limit store (resets on function cold start)
// For production, consider using Supabase table or Redis
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 1;

function isRateLimited(ip: string): { limited: boolean; remainingSeconds: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now >= record.resetAt) {
    // New window
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false, remainingSeconds: 0 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const remainingSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { limited: true, remainingSeconds };
  }

  record.count++;
  return { limited: false, remainingSeconds: 0 };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get client IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    console.log(`[submit-testimonial] Request from IP: ${ip}`);

    // Check rate limit
    const { limited, remainingSeconds } = isRateLimited(ip);
    if (limited) {
      console.log(`[submit-testimonial] Rate limited IP: ${ip}, retry in ${remainingSeconds}s`);
      return new Response(
        JSON.stringify({ 
          error: 'rate_limited',
          message: `Terlalu banyak request. Coba lagi dalam ${remainingSeconds} detik.`,
          retryAfter: remainingSeconds
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': remainingSeconds.toString()
          } 
        }
      );
    }

    // Parse request body
    const { name, rating, message } = await req.json();

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 50) {
      return new Response(
        JSON.stringify({ error: 'invalid_name', message: 'Nama tidak valid (max 50 karakter)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return new Response(
        JSON.stringify({ error: 'invalid_rating', message: 'Rating harus 1-5' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0 || message.length > 500) {
      return new Response(
        JSON.stringify({ error: 'invalid_message', message: 'Pesan tidak valid (max 500 karakter)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert testimonial
    const { data, error } = await supabase
      .from('testimonials')
      .insert({
        name: name.trim(),
        rating,
        message: message.trim()
      })
      .select()
      .single();

    if (error) {
      console.error('[submit-testimonial] Insert error:', error);
      throw error;
    }

    console.log(`[submit-testimonial] Testimonial created: ${data.id}`);

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[submit-testimonial] Error:', error);
    return new Response(
      JSON.stringify({ error: 'server_error', message: 'Gagal menyimpan testimonial' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
