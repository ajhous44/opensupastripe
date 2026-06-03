/// Example Supabase Edge Function — text embedding via built-in Supabase AI.
/// Invoke locally: supabase functions serve hello --env-file ../../apps/web/.env.local
/// Deploy: supabase functions deploy hello

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { text } = await req.json() as { text?: string }

    if (!text || typeof text !== 'string') {
      return Response.json({ error: 'text is required' }, { status: 400 })
    }

    const model = new Supabase.ai.Session('gte-small')
    const embedding = await model.run(text, { mean_pool: true, normalize: true })

    return Response.json({
      dimensions: embedding.length,
      embedding,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
})
