# slack-gitlab-mr-reminder
[![npm version](https://badge.fury.io/js/slack-gitlab-mr-reminder.svg)](https://badge.fury.io/js/slack-gitlab-mr-reminder)

This node module can be used to send slack reminders for overdue gitlab merge requests. The criteria for this is currently merge requests not updated for longer than 1 day. There are plans for the criteria to be configurable.

## Installation
`
npm install slack-gitlab-mr-reminder
`

## Example - running
Call `remind.js` with a suitable `yml` config, gitlab access token and slack webhook. See [example.yml](blob/master/examples/config.yml) for an example of config.

`
GITLAB_ACCESS_TOKEN='XXXXXXXXXXXXX' SLACK_WEBHOOK_URL='https://hooks.slack.com/services/...' node src/remind.js examples/config.yml 
`

## Example - module
You may use the functionality as a module:

```
var SlackGitlabMRReminder = require('slack-gitlab-mr-reminder');

const reminder = new SlackGitlabMRReminder({
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
```

## Options

- `gitlab.group` - The name of the group to watch for merge requests
- `slack.channel` - The slack channel to post to
- `slack.name` - Name of the slack poster
- `slack.message` - Message to send at the top of the slack message