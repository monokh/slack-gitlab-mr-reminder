var request = require('request-promise-native');

class GitLab
{
  constructor(access_token, group) {
    this.access_token = access_token;
    this.group = group;
  }

  getProjectMergeRequests(project_id) {
    const options = {
      uri: `https://gitlab.com/api/v4/projects/${project_id}/merge_requests?state=opened`,
      headers: {
        'PRIVATE-TOKEN': this.access_token
      },
      json: true
    };
    return request(options);
  }

  getMergeRequests() {
    const options = {
      uri: `https://gitlab.com/api/v4/groups/${this.group}/projects`,
      headers: {
        'PRIVATE-TOKEN': this.access_token
      },
      json: true
    };

    return request(options)
    .then((projects) => {
      return Promise.all(projects.map((project) => this.getProjectMergeRequests(project.id)));
    })
    .then((merge_requests) => {
      return [].concat(...merge_requests);
    });
  }
}

module.exports = GitLab;