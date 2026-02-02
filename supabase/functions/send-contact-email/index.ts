import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContactRequest {
  subject: string;
  senderEmail: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, senderEmail, message }: ContactRequest = await req.json();

    // Validate required fields
    if (!subject || !senderEmail || !message) {
      throw new Error("Missing required fields: subject, senderEmail, and message are required");
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail)) {
      throw new Error("Invalid email address format");
    }

    console.log(`Sending contact email from: ${senderEmail}, subject: ${subject}`);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Press+Start+2P&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Orbitron', 'Segoe UI', sans-serif; 
            background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a1a 100%);
            color: #ffffff; 
            padding: 40px 20px;
            min-height: 100vh;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: linear-gradient(145deg, rgba(20, 30, 50, 0.95) 0%, rgba(30, 20, 60, 0.95) 50%, rgba(15, 35, 45, 0.95) 100%);
            border-radius: 20px; 
            padding: 0;
            border: 2px solid #00ffff;
            box-shadow: 
              0 0 30px rgba(0, 255, 255, 0.3),
              0 0 60px rgba(255, 0, 255, 0.15),
              inset 0 0 60px rgba(0, 255, 255, 0.05);
            overflow: hidden;
          }
          .header { 
            text-align: center; 
            padding: 40px 30px 30px;
            background: linear-gradient(180deg, rgba(0, 255, 255, 0.1) 0%, transparent 100%);
            border-bottom: 1px solid rgba(0, 255, 255, 0.3);
          }
          .header-icon {
            font-size: 48px;
            margin-bottom: 15px;
            display: block;
          }
          .header h1 { 
            font-family: 'Press Start 2P', 'Orbitron', monospace;
            color: #00ffff; 
            font-size: 16px; 
            margin: 0 0 15px 0;
            text-shadow: 
              0 0 10px #00ffff,
              0 0 20px #00ffff,
              0 0 40px #00ffff;
            letter-spacing: 2px;
            line-height: 1.6;
          }
          .header p { 
            font-family: 'Orbitron', sans-serif;
            color: #ff00ff; 
            font-size: 13px; 
            margin: 0;
            text-shadow: 0 0 10px rgba(255, 0, 255, 0.5);
            letter-spacing: 1px;
          }
          .content {
            padding: 30px;
          }
          .field { 
            margin-bottom: 25px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            padding: 20px;
            border-left: 4px solid #00ffff;
            box-shadow: 
              0 0 15px rgba(0, 255, 255, 0.1),
              inset 0 0 20px rgba(0, 255, 255, 0.03);
          }
          .label { 
            font-family: 'Press Start 2P', monospace;
            color: #00ffff; 
            font-size: 10px; 
            text-transform: uppercase; 
            letter-spacing: 3px; 
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
          }
          .label-icon {
            font-size: 14px;
          }
          .value { 
            font-family: 'Orbitron', sans-serif;
            color: #ffffff;
            font-size: 15px;
            line-height: 1.8;
            font-weight: 500;
            text-shadow: 0 0 2px rgba(255, 255, 255, 0.3);
          }
          .value a {
            color: #ff00ff;
            text-decoration: none;
            text-shadow: 0 0 10px rgba(255, 0, 255, 0.5);
          }
          .message-content { 
            white-space: pre-wrap; 
            line-height: 1.9;
            color: #e8f4ff;
            font-size: 14px;
          }
          .footer { 
            text-align: center; 
            padding: 25px 30px;
            background: linear-gradient(0deg, rgba(0, 255, 255, 0.08) 0%, transparent 100%);
            border-top: 1px solid rgba(0, 255, 255, 0.2);
          }
          .footer-text {
            font-family: 'Orbitron', sans-serif;
            color: #00ffff;
            font-size: 11px;
            letter-spacing: 2px;
            text-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
          }
          .footer-date {
            font-family: 'Press Start 2P', monospace;
            color: rgba(255, 255, 255, 0.5);
            font-size: 8px;
            margin-top: 10px;
            letter-spacing: 1px;
          }
          .decoration-bar {
            height: 4px;
            background: linear-gradient(90deg, transparent, #00ffff, #ff00ff, #00ffff, transparent);
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="decoration-bar"></div>
          <div class="header">
            <span class="header-icon">🚀</span>
            <h1>INCOMING TRANSMISSION</h1>
            <p>✦ New Message from Nexus Space ✦</p>
          </div>
          
          <div class="content">
            <div class="field">
              <div class="label"><span class="label-icon">📡</span> FROM</div>
              <div class="value"><a href="mailto:${senderEmail}">${senderEmail}</a></div>
            </div>
            
            <div class="field">
              <div class="label"><span class="label-icon">📋</span> SUBJECT</div>
              <div class="value">${subject}</div>
            </div>
            
            <div class="field">
              <div class="label"><span class="label-icon">💬</span> MESSAGE</div>
              <div class="value">
                <div class="message-content">${message.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-text">⚡ NEXUS SPACE PORTFOLIO ⚡</div>
            <div class="footer-date">${new Date().toLocaleString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short'
            })}</div>
          </div>
          <div class="decoration-bar"></div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Nexus Space Portfolio <onboarding@resend.dev>",
        to: ["zidaneachmadnurjayyin@gmail.com"],
        subject: `[Portfolio Contact] ${subject}`,
        reply_to: senderEmail,
        html: emailHtml,
      }),
    });

    const responseData = await emailResponse.json();
    
    if (!emailResponse.ok) {
      console.error("Resend API error:", responseData);
      throw new Error(responseData.message || "Failed to send email");
    }

    console.log("Contact email sent successfully:", responseData);

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
