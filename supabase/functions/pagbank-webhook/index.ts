import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("PagBank Webhook received:", JSON.stringify(body));

    const referenceId = body.reference_id || body.reference;
    if (!referenceId) {
      console.log("No reference_id/reference found in webhook");
      return new Response("OK", { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, freight_payment_status, label_status, payment_id")
      .eq("id", referenceId)
      .single();

    if (orderErr || !order) {
      console.error("Order not found for reference:", referenceId);
      return new Response("OK", { status: 200 });
    }

    const pbStatus = body.status || (body.charges && body.charges[0] && body.charges[0].status);
    const paymentId = body.id;

    // Server-side validation with PagBank API if status is PAID
    if (pbStatus === "PAID" && paymentId) {
      const PAGBANK_TOKEN = Deno.env.get("PAGBANK_TOKEN");
      const ENV = Deno.env.get("PAGBANK_ENVIRONMENT") || "sandbox";
      const PAGBANK_API_URL = ENV === "sandbox" ? "https://sandbox.api.pagseguro.com" : "https://api.pagseguro.com";
      
      try {
        const verifyRes = await fetch(`${PAGBANK_API_URL}/orders/${paymentId}`, {
          headers: { Authorization: `Bearer ${PAGBANK_TOKEN}` },
        });
        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          if (verifyData.status !== "PAID") {
            console.error("PagBank verification failed: status mismatch", verifyData.status);
            return new Response("OK", { status: 200 });
          }
        } else {
          console.error("PagBank verification request failed", verifyRes.status);
        }
      } catch (e) {
        console.error("Error verifying payment with PagBank API", e);
      }
    }

    let freightStatus = order.freight_payment_status;

    if (pbStatus === "PAID") {
      freightStatus = "approved";
    } else if (pbStatus === "DECLINED") {
      freightStatus = "rejected";
    } else if (pbStatus === "CANCELED") {
      freightStatus = "cancelled";
    } else if (pbStatus === "WAITING" || pbStatus === "IN_ANALYSIS") {
      freightStatus = "pending";
    }

    if (freightStatus !== order.freight_payment_status) {
      await supabase
        .from("orders")
        .update({
          freight_payment_status: freightStatus,
          payment_id: body.id, 
        })
        .eq("id", referenceId);

      await supabase.from("payment_logs").insert({
        order_id: referenceId,
        provider: "pagbank",
        status: pbStatus,
        payload: body,
      });

      if (freightStatus === "approved" && order.label_status !== "generated") {
        console.log("Triggering label generation for:", referenceId);
        try {
          const labelRes = await fetch(
            `${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-label`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              },
              body: JSON.stringify({ order_id: referenceId }),
            }
          );
          const labelData = await labelRes.json();
          console.log("Label result:", labelRes.status, labelData);
        } catch (e) {
          console.error("Label generation failed:", e);
        }
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("OK", { status: 200 });
  }
});
