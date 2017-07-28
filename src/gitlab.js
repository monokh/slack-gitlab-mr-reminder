var request = require('request-promise-native');

class GitLab
{
  constructor(external_url, access_token, group) {
    this.external_url = external_url;
    this.access_token = access_token;
    this.group = group;
  }

  getProjectMergeRequests(project_id) {
    const options = {
      uri: `${this.external_url}/api/v4/projects/${project_id}/merge_requests?state=opened`,
      headers: {
        'PRIVATE-TOKEN': this.access_token
      },
      json: true
    };
    return request(options);
  }

  getProjects() {
    const options = {
      uri: `${this.external_url}/api/v4/groups/${this.group}/projects`,
      headers: {
        'PRIVATE-TOKEN': this.access_token
      },
      json: true
    };

    return request(options);
  }

  getGroupMergeRequests() {
    return this.getProjects()
    .then((projects) => {
      return Promise.all(projects.map((project) => this.getProjectMergeRequests(project.id)));
    })
    .then((merge_requests) => {
      return [].concat(...merge_requests);
    });
  }
}

module.exports = GitLab;