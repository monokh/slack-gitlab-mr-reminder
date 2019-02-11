const SlackGitlabMRReminder = require('./slack-gitlab-mr-reminder');
const moment = require('moment');

const mock_options = {
  slack: {
    webhook_url: 'hook',
    channel: 'merge-requests',
  },
  gitlab: {
    access_token: 'token',
    group: 'mygroup'
  }
};

const mock_merge_requests = [
  {
    id: 1,
    title: 'MR1',
    description: 'MR1 description',
    author: {
      name: 'person'
    },
    web_url: 'https://gitlab.com/merge/1',
    updated_at: 1234567
  },
  {
    id: 2,
    title: 'MR2',
    description: 'MR2 description',
    author: {
      name: 'person'
    },
    web_url: 'https://gitlab.com/merge/2',
    updated_at: moment()
      .subtract(4, 'days')
      .toDate()
  },
  {
    id: 3,
    title: 'WIP: MR3',
    description: 'WIP MR with :',
    author: {
      name: 'person'
    },
    web_url: 'https://gitlab.com/merge/3',
    updated_at: moment()
      .subtract(10, 'days')
      .toDate()
  },
  {
    id: 4,
    title: '[WIP] MR4',
    description: 'WIP MR with []',
    author: {
      name: 'person'
    },
    web_url: 'https://gitlab.com/merge/4',
    updated_at: moment()
      .subtract(10, 'days')
      .toDate()
  },
  {
    id: 5,
    title: 'wIp: MR5',
    description: 'WIP MR with : and case-insensitive',
    author: {
      name: 'person'
    },
    web_url: 'https://gitlab.com/merge/5',
    updated_at: moment()
      .subtract(10, 'days')
      .toDate()
  },
  {
    id: 5,
    title: '[wiP] MR6',
    description: 'WIP MR with [] and case-insensitive',
    author: {
      name: 'person'
    },
    web_url: 'https://gitlab.com/merge/6',
    updated_at: moment()
      .subtract(10, 'days')
      .toDate()
  }
];

test('merge requests reminder is sent', async () => {
  var reminder = new SlackGitlabMRReminder(mock_options);
  reminder.gitlab.getGroupMergeRequests = jest.fn(() => {
    return new Promise((resolve, reject) => {
      process.nextTick(() => {
        resolve(mock_merge_requests);
      });
    });
  });
  const result = await reminder.remind();
  expect(result).toBe('Reminder sent');
  expect(reminder.webhook.send).toHaveBeenCalledTimes(1);
  expect(reminder.webhook.send.mock.calls[0][0]).toEqual({
    attachments: [
      {
        author_name: 'person',
        color: '#FC6D26',
        text: 'MR1 description',
        title: 'MR1',
        title_link: 'https://gitlab.com/merge/1'
      },
      {
        author_name: 'person',
        color: '#FC6D26',
        text: 'MR2 description',
        title: 'MR2',
        title_link: 'https://gitlab.com/merge/2'
      },
      {
        author_name: 'person',
        color: '#FC6D26',
        text: 'WIP MR with :',
        title: 'WIP: MR3',
        title_link: 'https://gitlab.com/merge/3'
      },
      {
        author_name: 'person',
        color: '#FC6D26',
        text: 'WIP MR with []',
        title: '[WIP] MR4',
        title_link: 'https://gitlab.com/merge/4'
      },
      {
        author_name: 'person',
        color: '#FC6D26',
        text: 'WIP MR with : and case-insensitive',
        title: 'wIp: MR5',
        title_link: 'https://gitlab.com/merge/5'
      },
      {
        author_name: 'person',
        color: '#FC6D26',
        text: 'WIP MR with [] and case-insensitive',
        title: '[wiP] MR6',
        title_link: 'https://gitlab.com/merge/6'
      }
    ],
    text: 'Merge requests are overdue:'
  });
});

test('merge requests (normal older than 5 days and all WIP) reminder is sent', async () => {
  var reminder = new SlackGitlabMRReminder(
    Object.assign(mock_options, {
      mr: {
        normal_mr_days_threshold: 5,
        wip_mr_days_threshold: 0
      }
    })
  );
  reminder.gitlab.getGroupMergeRequests = jest.fn(() => {
    return new Promise((resolve, reject) => {
      process.nextTick(() => {
        resolve(mock_merge_requests);
      });
    });
  });
  const result = await reminder.remind();
  expect(result).toBe('Reminder sent');
  expect(reminder.webhook.send).toHaveBeenCalledTimes(1);
  expect(reminder.webhook.send.mock.calls[0][0]).toEqual({
    attachments: [
      {
        author_name: 'person',
        color: '#FC6D26',
        text: 'MR1 description',
        title: 'MR1',
        title_link: 'https://gitlab.com/merge/1'
      },
      {
        author_name: 'person',
        color: '#FC6D26',
        text: 'WIP MR with :',
        title: 'WIP: MR3',
        title_link: 'https://gitlab.com/merge/3'
      },
      {
        author_name: 'person',
        color: '#FC6D26',
        text: 'WIP MR with []',
        title: '[WIP] MR4',
        title_link: 'https://gitlab.com/merge/4'
      },
      {
        author_name: 'person',
        color: '#FC6D26',
        text: 'WIP MR with : and case-insensitive',
        title: 'wIp: MR5',
        title_link: 'https://gitlab.com/merge/5'
      },
      {
        author_name: 'person',
        color: '#FC6D26',
        text: 'WIP MR with [] and case-insensitive',
        title: '[wiP] MR6',
        title_link: 'https://gitlab.com/merge/6'
      }
    ],
    text: 'Merge requests are overdue:'
  });
});

test('merge requests (all normal and no WIP) reminder is sent', async () => {
  var reminder = new SlackGitlabMRReminder(
    Object.assign(mock_options, {
      mr: {
        normal_mr_days_threshold: 0,
        wip_mr_days_threshold: 30
      }
    })
  );
  reminder.gitlab.getGroupMergeRequests = jest.fn(() => {
    return new Promise((resolve, reject) => {
      process.nextTick(() => {
        resolve(mock_merge_requests);
      });
    });
  });
  const result = await reminder.remind();
  expect(result).toBe('Reminder sent');
  expect(reminder.webhook.send).toHaveBeenCalledTimes(1);
  expect(reminder.webhook.send.mock.calls[0][0]).toEqual({
    attachments: [
      {
        author_name: 'person',
        color: '#FC6D26',
        text: 'MR1 description',
        title: 'MR1',
        title_link: 'https://gitlab.com/merge/1'
      },
      {
        author_name: 'person',
        color: '#FC6D26',
        text: 'MR2 description',
        title: 'MR2',
        title_link: 'https://gitlab.com/merge/2'
      }
    ],
    text: 'Merge requests are overdue:'
  });
});


test('merge requests (normal older than 5 days and no WIP) reminder is sent', async () => {
  var reminder = new SlackGitlabMRReminder(
    Object.assign(mock_options, {
      mr: {
        normal_mr_days_threshold: 5,
        wip_mr_days_threshold: Infinity
      }
    })
  );
  reminder.gitlab.getGroupMergeRequests = jest.fn(() => {
    return new Promise((resolve, reject) => {
      process.nextTick(() => {
        resolve(mock_merge_requests);
      });
    });
  });
  const result = await reminder.remind();
  expect(result).toBe('Reminder sent');
  expect(reminder.webhook.send).toHaveBeenCalledTimes(1);
  expect(reminder.webhook.send.mock.calls[0][0]).toEqual({
    attachments: [
      {
        author_name: 'person',
        color: '#FC6D26',
        text: 'MR1 description',
        title: 'MR1',
        title_link: 'https://gitlab.com/merge/1'
      }
    ],
    text: 'Merge requests are overdue:'
  });
});

test('no merge requests to send', async () => {
  var reminder = new SlackGitlabMRReminder(mock_options);
  reminder.gitlab.getGroupMergeRequests = jest.fn(() => {
    return new Promise((resolve, _) => {
      process.nextTick(() => {
        resolve([]);
      });
    });
  });
  expect(await reminder.remind()).toEqual('No reminders to send');
});
