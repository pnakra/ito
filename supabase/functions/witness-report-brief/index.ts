// Practice-only: turns a witness's story into a structured, de-identified brief.
// Nothing is sent anywhere and nothing is stored.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const Body = z.object({
  story: z.string().trim().min(10).max(5000),
  recipient: z.enum(["campus_police", "title_ix", "chapter_leader", "ra", "rainn"]),
});

const SYSTEM = `You turn an anonymous witness's story into a short factual brief for someone who can act (campus police, Title IX, a chapter leader, an RA, or RAINN).
Rules:
- Only use facts in the story. Write "not stated" when unknown. Never invent names, times or places.
- Remove anything that could identify the WITNESS (their name, phone, handle, room, "my roommate" style links). List each removal in reporter_identifiers_removed.
- Keep details about the incident (venue type, time window, number of people, intoxication signs, evidence) because the recipient needs them. Use venue type rather than exact address unless the story gives it.
- Flag writing quirks that could identify the witness (unusual slang, specific details only they would know) in style_flags so they can choose to change them.
- Plain, neutral language. Name sexual assault plainly if that is what was described, but as "reported" not proven.
- No first-person pronouns from you.`;

const tool = {
  type: "function",
  function: {
    name: "report_brief",
    parameters: {
      type: "object",
      properties: {
        urgency: { type: "string", enum: ["happening_now", "recent", "past"] },
        summary: { type: "string", description: "2-3 sentence neutral summary" },
        when: { type: "string" },
        where: { type: "string" },
        people_involved: { type: "string" },
        intoxication_signs: { type: "string" },
        what_was_seen: { type: "array", items: { type: "string" } },
        evidence: { type: "array", items: { type: "string" } },
        ongoing_risk: { type: "string" },
        reporter_willing_to: { type: "string" },
        reporter_identifiers_removed: { type: "array", items: { type: "string" } },
        style_flags: { type: "array", items: { type: "string" } },
      },
      required: ["urgency", "summary", "when", "where", "people_involved", "intoxication_signs", "what_was_seen", "evidence", "ongoing_risk", "reporter_willing_to", "reporter_identifiers_removed", "style_flags"],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);

  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return json({ error: "Service configuration error" }, 500);

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `Recipient: ${parsed.data.recipient}\n\nStory:\n${parsed.data.story}` },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: "report_brief" } },
    }),
  });
  if (resp.status === 429) return json({ error: "Too many requests. Try again in a moment." }, 429);
  if (resp.status === 402) return json({ error: "AI credits are used up." }, 402);
  if (!resp.ok) {
    console.error("gateway error", resp.status, await resp.text());
    return json({ error: "Could not build the brief." }, 500);
  }
  const data = await resp.json();
  const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  try {
    return json({ brief: JSON.parse(args) });
  } catch {
    return json({ error: "Could not build the brief." }, 500);
  }
});
