var SlackGitlabMRReminder = require('slack-gitlab-mr-reminder');

const reminder = new SlackGitlabMRReminder({
  mr: {
    wip_mr_days_threshold: 7,
    wip_mr_days_threshold: 30,
  },
  slack: {
    webhook_url: 'https://hooks.slack.com/services/...',
    channel: 'merge-requests',
  },
  gitlab: {
    access_token: '...',
    group: 'mygroup'
  }
});

reminder.remind();