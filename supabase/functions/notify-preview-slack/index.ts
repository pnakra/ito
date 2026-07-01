const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SLACK_CHANNEL = '#ito_preview_actions';
const GATEWAY_URL = 'https://connector-gateway.lovable.dev/slack/api';

interface Payload {
  event: string;
  scenario_id?: string;
  scenario_theme?: string;
  selected_style?: string;
  signal_label?: string;
  alignment?: string;
  utm?: Record<string, string>;
  referrer?: string;
  session_id?: string;
}

const EVENT_META: Record<string, { emoji: string; title: string }> = {
  preview_view: { emoji: '👀', title: 'Preview opened' },
  reveal_shown: { emoji: '✨', title: "ito's read revealed" },
  alignment_check: { emoji: '📏', title: 'Alignment check' },
  cta_try_own_click: { emoji: '🚀', title: 'Clicked: try with own situation' },
  share_click: { emoji: '🔗', title: 'Shared scenario' },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const SLACK_API_KEY = Deno.env.get('SLACK_API_KEY');
  if (!LOVABLE_API_KEY || !SLACK_API_KEY) {
    return new Response(JSON.stringify({ error: 'Slack not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!body.event || typeof body.event !== 'string') {
    return new Response(JSON.stringify({ error: 'event required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const meta = EVENT_META[body.event] ?? { emoji: '•', title: body.event };
  const lines: string[] = [`${meta.emoji} *${meta.title}*`];
  if (body.scenario_id) lines.push(`• scenario: \`${body.scenario_id}\`${body.scenario_theme ? ` (${body.scenario_theme})` : ''}`);
  if (body.selected_style) lines.push(`• pick: ${body.selected_style}`);
  if (body.signal_label) lines.push(`• ito read: ${body.signal_label}`);
  if (body.alignment) lines.push(`• alignment: ${body.alignment}`);
  if (body.utm && Object.keys(body.utm).length) {
    const utmStr = Object.entries(body.utm).map(([k, v]) => `${k}=${v}`).join(' · ');
    lines.push(`• source: ${utmStr}`);
  } else if (body.referrer) {
    lines.push(`• ref: ${body.referrer.slice(0, 120)}`);
  }
  if (body.session_id) lines.push(`• session: \`${body.session_id.slice(0, 8)}\``);

  const slackRes = await fetch(`${GATEWAY_URL}/chat.postMessage`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': SLACK_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: SLACK_CHANNEL,
      text: lines.join('\n'),
      username: 'ito preview',
      icon_emoji: ':eyes:',
    }),
  });

  const slackText = await slackRes.text();
  let slackData: any;
  try { slackData = JSON.parse(slackText); } catch { slackData = { raw: slackText }; }

  if (!slackRes.ok || !slackData?.ok) {
    console.error('[notify-preview-slack] slack error', slackRes.status, slackText.slice(0, 300));
    return new Response(JSON.stringify({ error: 'slack post failed', detail: slackData }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
