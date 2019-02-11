const GitLab = require('./gitlab');

const mock_project = {
  id: 1,
  name: 'project1'
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
    updated_at: 1234567
  }
]

test('merge requests are retrieved', async () => {
  const gitlab = new GitLab('https://gitlab.com', 'xxx', 'mygroup');
  gitlab.getProjects = jest.fn(() => { 
    return new Promise((resolve, reject) => {
      process.nextTick(() => {
        resolve([mock_project, mock_project]);
      });
    });
  });
  gitlab.getProjectMergeRequests = jest.fn((project) => { 
    return new Promise((resolve, reject) => {
      process.nextTick(() => {
        resolve(mock_merge_requests);
      });
    });
  });

  const result = await gitlab.getGroupMergeRequests();
  expect(result).toContainEqual(mock_merge_requests[0]);
  expect(result).toContainEqual(mock_merge_requests[1]);
  expect(gitlab.getProjects).toHaveBeenCalled();
  expect(gitlab.getProjectMergeRequests).toHaveBeenCalledWith(1);
});

test('No open merge requests work', async () => {
  const gitlab = new GitLab('https://gitlab.com', 'xxx', 'mygroup');
  gitlab.getProjects = jest.fn(() => { 
    return new Promise((resolve, reject) => {
      process.nextTick(() => {
        resolve([mock_project, mock_project]);
      });
    });
  });
  gitlab.getProjectMergeRequests = jest.fn((project) => { 
    return new Promise((resolve, reject) => {
      process.nextTick(() => {
        resolve([]);
      });
    });
  });

  const result = await gitlab.getGroupMergeRequests();
  expect(result).toEqual([]);
  expect(gitlab.getProjects).toHaveBeenCalled();
  expect(gitlab.getProjectMergeRequests).toHaveBeenCalledWith(1);
});
