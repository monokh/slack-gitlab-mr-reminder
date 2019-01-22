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
      uri: `${this.external_url}/api/v4/projects/${project_id}/merge_requests?state=opened  `,
      headers: {
        'PRIVATE-TOKEN': this.access_token
      },
      json: true
    };
    return request(options);
  }

  getProject({ page = 1 }) {
    console.log(page);
    const options = {
      uri: `${this.external_url}/api/v4/groups/${this.group}/projects?page=${page}`,
      headers: {
        'PRIVATE-TOKEN': this.access_token
      },
      json: true
    };
    return request(options);
  }

  async getProjects() {
    const options = {
      uri: `${this.external_url}/api/v4/groups/${this.group}/projects`,
      headers: {
        'PRIVATE-TOKEN': this.access_token
      },
      json: true,
      resolveWithFullResponse: true,
    };
    try {
      let promises = []
      const resp = await request(options);
      const firstPage = resp.body;
      const totalPages = Number(resp.headers['x-total-pages']);
      // console.log(resp.headers);

      for(let pageNumber = 2; pageNumber <= totalPages; pageNumber++) {
        promises.push(this.getProject({ page: pageNumber }));
      }

      let [projects] = await Promise.all(promises);
      projects = projects.concat(firstPage); 
      // console.log('projects', projects.length);
      return projects;
    } catch(e) {
      console.log(e);
    }
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