var moment = require('moment');
var slack = require('@slack/client');
var GitLab = require('./gitlab');

const SLACK_LOGO_URL = 'https://about.gitlab.com/images/press/logo/logo.png';

class SlackGitlabMRReminder {

  constructor(options) {
    this.options = options;
    this.options.mr = this.options.mr || {}; // backward compatible;
    this.options.gitlab.external_url = this.options.gitlab.external_url || 'https://gitlab.com';
    this.options.slack.name = this.options.slack.name || 'GitLab Reminder';
    this.options.slack.message = this.options.slack.message || 'Merge requests are overdue:';
    this.options.mr.normal_mr_days_threshold = this.options.mr.normal_mr_days_threshold || 0;
    this.options.mr.wip_mr_days_threshold = this.options.mr.normal_mr_days_threshold || 7;
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
  
  async remind() {
    let merge_requests = await this.gitlab.getGroupMergeRequests();
    merge_requests = merge_requests.filter((mr) => {
      return moment().diff(moment(mr.updated_at), 'days') > 0;
    });
    if(merge_requests.length === 0) {
      return 'No reminders to send'
    }
    const message = this.createSlackMessage(merge_requests);
    return new Promise((resolve, reject) => {
      this.webhook.send(message, (err, res) => {
        err ? reject(err) : resolve('Reminder sent');
      });
    });
  }
}

module.exports = SlackGitlabMRReminder;
