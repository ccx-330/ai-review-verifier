import * as core from "@actions/core";
import * as github from "@actions/github";
import { getChangedFiles } from "./diff";
import { loadConfig } from "./config";
import { runRules } from "./rules";
import { formatComment } from "./formatter";
import { upsertPullRequestComment } from "./comment";
import { emitAnnotations } from "./annotations";
import { createInlineComments } from "./inlineComments";
import { shouldFail } from "./failure";

async function run(): Promise<void> {
  try {
    const eventName = github.context.eventName;
    const repo = `${github.context.repo.owner}/${github.context.repo.repo}`;
    const sha = github.context.sha;

    core.info(`Event:  ${eventName}`);
    core.info(`Repo:   ${repo}`);
    core.info(`SHA:    ${sha}`);

    if (eventName !== "pull_request") {
      core.info(`Event is "${eventName}", not "pull_request". Skipping.`);
      return;
    }

    const pullRequest = github.context.payload.pull_request;
    if (!pullRequest) {
      core.warning("pull_request event payload is missing pull_request data.");
      return;
    }

    const { owner, repo: repoName } = github.context.repo;
    const pullNumber = pullRequest.number;

    const token = core.getInput("github-token", { required: true });
    const octokit = github.getOctokit(token);

    const config = loadConfig();
    core.info(`Config: ${JSON.stringify(config)}`);

    core.info(`PR #${pullNumber} — fetching changed files.`);
    const files = await getChangedFiles(octokit, owner, repoName, pullNumber);

    core.info(`Found ${files.length} changed file(s).`);

    const results = runRules(files, config);
    core.info(`Rules produced ${results.length} finding(s).`);

    emitAnnotations(results);

    const body = formatComment(files, results);

    await upsertPullRequestComment(octokit, owner, repoName, pullNumber, body);

    core.info("Comment posted successfully.");
    core.setOutput("comment-posted", "true");

    const inlineComments = core.getBooleanInput("inline-comments");
    if (inlineComments) {
      await createInlineComments({
        octokit,
        owner,
        repo: repoName,
        pull_number: pullNumber,
        commit_id: sha,
        results,
        files,
      });
      core.info("Inline comments posted.");
    }

    const failOnWarning = core.getBooleanInput("fail-on-warning");
    const failOnError = core.getBooleanInput("fail-on-error");

    const { failed, message } = shouldFail(results, { failOnWarning, failOnError });
    if (failed && message) {
      core.setFailed(message);
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed(String(error));
    }
  }
}

run();
