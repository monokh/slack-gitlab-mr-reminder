var moment = require('moment');
var slack = require('@slack/client');
var GitLab = require('./gitlab');

const SLACK_LOGO_URL = 'https://about.gitlab.com/images/press/logo/logo.png';

class SlackGitlabMRReminder {

  constructor(options) {
    this.options = options;
    this.options.gitlab.external_url = this.options.gitlab.external_url || 'https://gitlab.com';
    this.options.slack.name = this.options.slack.name || 'GitLab Reminder';
    this.options.slack.message = this.options.slack.message || 'Merge requests are overdue:';
    this.gitlab = new GitLab(this.options.gitlab.external_url, this.options.gitlab.access_token, this.options.gitlab.group);
    this.webhook = new slack.IncomingWebhook(this.options.slack.webhook_url, {
      username: this.options.slack.name,
      iconUrl: SLACK_LOGO_URL,
      channel: this.options.slack.channel
    });
  }

  createSlackMessage(merge_requests) {
    const attachments = merge_requests.map((mr) => {
      return {
        color: '#FC6D26',
        author_name: mr.author.name,
        title: mr.title,
        title_link: mr.web_url,
        text: mr.description,
      };
    });

    return {
      text: this.options.slack.message,
      attachments
    };
  }
  
  remind() {
    return this.gitlab.getGroupMergeRequests()
    .then((merge_requests) => {
      return merge_requests.filter((mr) => {
        return moment().diff(moment(mr.updated_at), 'days') > 0;
      });
    })
    .then((merge_requests) => {
      if(merge_requests.length > 0) {
        return this.createSlackMessage(merge_requests);
      }
      else {
        throw 'No reminders to send'
      }
    })
    .then((message) => {
      return new Promise((resolve, reject) => {
        this.webhook.send(message, (err, res) => {
          err ? reject(err) : resolve('Reminder sent');
        });
      });
    }, (message) => {
      return Promise.resolve(message);
    });
  }

}

module.exports = SlackGitlabMRReminder;