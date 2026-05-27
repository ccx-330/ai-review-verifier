import * as github from "@actions/github";

const COMMENT_MARKER = "<!-- ai-review-verifier -->";

type Octokit = ReturnType<typeof github.getOctokit>;

export { COMMENT_MARKER };

export async function upsertPullRequestComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  issue_number: number,
  body: string
): Promise<void> {
  const bodyWithMarker = body.startsWith(COMMENT_MARKER)
    ? body
    : `${COMMENT_MARKER}\n${body}`;

  const { data: comments } = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number,
    per_page: 100,
  });

  const existing = comments.find(
    (c) =>
      c.body?.includes(COMMENT_MARKER) &&
      (c.user?.type === "Bot" || c.user?.login.includes("github-actions"))
  );

  if (existing) {
    await octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: existing.id,
      body: bodyWithMarker,
    });
  } else {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number,
      body: bodyWithMarker,
    });
  }
}
