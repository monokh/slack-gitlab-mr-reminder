#!/usr/bin/env node
var yaml = require('js-yaml');
var fs = require('fs');
var SlackGitlabMRReminder = require('./slack-gitlab-mr-reminder');

const optionsFile = process.argv[2];
let options = yaml.safeLoad(fs.readFileSync(optionsFile, 'utf-8'));
options.slack.webhook_url = process.env.SLACK_WEBHOOK_URL;
options.gitlab.access_token = process.env.GITLAB_ACCESS_TOKEN;
const reminder = new SlackGitlabMRReminder(options);

reminder.remind();