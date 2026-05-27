import { upsertPullRequestComment, COMMENT_MARKER } from "../comment";

interface MockComment {
  id: number;
  body?: string;
  user?: { type?: string; login?: string };
}

function mockOctokit(existingComments: MockComment[]) {
  const listComments = jest.fn().mockResolvedValue({ data: existingComments });
  const createComment = jest.fn().mockResolvedValue({});
  const updateComment = jest.fn().mockResolvedValue({});

  return {
    rest: {
      issues: { listComments, createComment, updateComment },
    },
    listComments,
    createComment,
    updateComment,
  };
}

describe("upsertPullRequestComment", () => {
  const owner = "test-owner";
  const repo = "test-repo";
  const issue_number = 42;
  const body = "## AI Review Verifier\n\nNo issues found.";

  it("creates a new comment when no prior comment exists", async () => {
    const octokit = mockOctokit([]);

    await upsertPullRequestComment(octokit as unknown as Parameters<typeof upsertPullRequestComment>[0], owner, repo, issue_number, body);

    expect(octokit.listComments).toHaveBeenCalledWith({
      owner,
      repo,
      issue_number,
      per_page: 100,
    });
    expect(octokit.createComment).toHaveBeenCalledWith({
      owner,
      repo,
      issue_number,
      body: `${COMMENT_MARKER}\n${body}`,
    });
    expect(octokit.updateComment).not.toHaveBeenCalled();
  });

  it("updates existing bot comment with marker", async () => {
    const octokit = mockOctokit([
      {
        id: 101,
        body: `${COMMENT_MARKER}\nold content`,
        user: { type: "Bot", login: "github-actions[bot]" },
      },
    ]);

    await upsertPullRequestComment(octokit as unknown as Parameters<typeof upsertPullRequestComment>[0], owner, repo, issue_number, body);

    expect(octokit.updateComment).toHaveBeenCalledWith({
      owner,
      repo,
      comment_id: 101,
      body: `${COMMENT_MARKER}\n${body}`,
    });
    expect(octokit.createComment).not.toHaveBeenCalled();
  });

  it("does not update comments from other users", async () => {
    const octokit = mockOctokit([
      {
        id: 200,
        body: `${COMMENT_MARKER}\ncontent`,
        user: { type: "User", login: "someone-else" },
      },
    ]);

    await upsertPullRequestComment(octokit as unknown as Parameters<typeof upsertPullRequestComment>[0], owner, repo, issue_number, body);

    expect(octokit.createComment).toHaveBeenCalled();
    expect(octokit.updateComment).not.toHaveBeenCalled();
  });

  it("does not update bot comments without marker", async () => {
    const octokit = mockOctokit([
      {
        id: 300,
        body: "some other bot comment",
        user: { type: "Bot", login: "github-actions[bot]" },
      },
    ]);

    await upsertPullRequestComment(octokit as unknown as Parameters<typeof upsertPullRequestComment>[0], owner, repo, issue_number, body);

    expect(octokit.createComment).toHaveBeenCalled();
    expect(octokit.updateComment).not.toHaveBeenCalled();
  });

  it("does not duplicate marker when body already starts with it", async () => {
    const octokit = mockOctokit([]);
    const bodyWithMarker = `${COMMENT_MARKER}\n## AI Review Verifier`;

    await upsertPullRequestComment(octokit as unknown as Parameters<typeof upsertPullRequestComment>[0], owner, repo, issue_number, bodyWithMarker);

    expect(octokit.createComment).toHaveBeenCalledWith({
      owner,
      repo,
      issue_number,
      body: bodyWithMarker,
    });
  });
});
