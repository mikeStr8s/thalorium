// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

console.log(`Function "post-new-comment" up and running!`);

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { author, body, post, bot } = await req.json();
  if (bot) {
    return new Response(JSON.stringify({ message: "Comment Posted." }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
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

    const { data, error } = await supabaseClient.from("comments").insert({
      author: author,
      body: body,
      post_id: post,
      moderated: false,
    }).select();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    } else {
      fetch(
        "https://hooks.slack.com/services/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",
        {
          method: "POST",
          body: JSON.stringify({
            blocks: [
              {
                type: "header",
                text: {
                  type: "plain_text",
                  text: "New comment waiting for approval!",
                },
              },
              {
                type: "section",
                fields: [
                  {
                    type: "mrkdwn",
                    text: `*Blog post:*\n${post}`,
                  },
                  {
                    type: "mrkdwn",
                    text:
                      `*Database:*\n<https://supabase.com/dashboard/project/pdhlzmchhlsbnqenslqn/editor/29182?schema=public&filter=moderated%3Aeq%3AFALSE|Unmoderated comments>`,
                  },
                ],
              },
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*Comment:*\n${body}`,
                },
              },
              {
                type: "context",
                elements: [
                  {
                    type: "mrkdwn",
                    text: `*Submitted by:* ${author}`,
                  },
                ],
              },
              {
                type: "divider",
              },
              {
                type: "actions",
                elements: [
                  {
                    type: "button",
                    text: {
                      type: "plain_text",
                      emoji: true,
                      text: "Approve",
                    },
                    style: "primary",
                    action_id: "approve_comment",
                    value: `${data[0].id}`,
                  },
                  {
                    type: "button",
                    text: {
                      type: "plain_text",
                      emoji: true,
                      text: "Delete",
                    },
                    style: "danger",
                    action_id: "delete_comment",
                    value: `${data[0].id}`,
                    confirm: {
                      title: {
                        type: "plain_text",
                        text: "Are you sure?",
                      },
                      text: {
                        type: "mrkdwn",
                        text: "This will delete the comment permanently.",
                      },
                      confirm: {
                        type: "plain_text",
                        text: "Delete",
                      },
                      deny: {
                        type: "plain_text",
                        text: "Cancel",
                      },
                      style: "danger",
                    },
                  },
                ],
              },
            ],
          }),
        },
      ).then((response) => {
        console.log(response.body);
      });
      return new Response(
        JSON.stringify({
          message: "Comment posted successfully, awaiting moderation.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/post-new-comment' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"author":"Local Test","body":"This is a test from local","post":"post-1","bot":false}'

*/
