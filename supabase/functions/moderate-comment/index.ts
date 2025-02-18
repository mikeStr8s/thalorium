import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";


console.log(`Function "moderate-comment" up and running!`);

Deno.serve(async (req) => {
  const approveComment = async (id: string) => {
    const { error } = await supabaseClient.from('comments').update({ moderated: true }).eq('id', id);
    if (error) {
      return `Error approving comment id: ${id}`;
    } else {
      return 'Comment Approved!';
    }
  }
  const deleteComment = async (id: string) => {
    const { error } = await supabaseClient.from('comments').delete().eq('id', id);
    if (error) {
      return `Error deleting comment id: ${id}`;
    } else {
      return 'Comment Deleted.';
    }
  }
  const respondToSlack = async (url: string, text: string, type: string) => {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `${ type === "approve_comment" ? "Approvement" : "Deletion" } succesful! ${ type === "approve_comment" ? ":white_check_mark:" : ":octagonal_sign:" }`,
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: text,
            },
          },
        ],
        response_type: "in_channel",
      }),
    });
  };

  const formData = await req.formData();
  const payload = await formData.get('payload');
  const { response_url, actions } = JSON.parse(payload as string);

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      global: {
        headers: {
          Authorization: `Bearer ${
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
          }`,
        },
      },
    },
  );

  let res = '';
  if (actions[0].action_id === 'approve_comment') {
    res = await approveComment(actions[0].value);
  } else if (actions[0].action_id === 'delete_comment') {
    res = await deleteComment(actions[0].value);
  }

  await respondToSlack(response_url, res, actions[0].action_id);

  return new Response(
    JSON.stringify({ message: 'success' }),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/moderate-comment' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
