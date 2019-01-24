var request = require('request-promise-native');

class GitLab
{
  constructor(external_url, access_token, group) {
    this.external_url = external_url;
    this.access_token = access_token;
    this.group = group;
  }

  _getProjectMergeRequest(project_id,{page=1}) {
    const options = {
      uri: `${this.external_url}/api/v4/projects/${project_id}/merge_requests?state=opened&page=${page}`,
      headers: {
        'PRIVATE-TOKEN': this.access_token
      },
      json: true
    };
    return request(options);
  }
  async getProjectMergeRequests(project_id) {
    const options = {
      uri: `${this.external_url}/api/v4/projects/${project_id}/merge_requests?state=opened`,
      headers: {
        'PRIVATE-TOKEN': this.access_token,

      },
      json: true,
      resolveWithFullResponse: true,
    };
    
    try {
      let promises = []
      const resp = await request(options);
      const firstPage = resp.body;
      const totalPages = Number(resp.headers['x-total-pages']);
      for(let pageNumber = 2; pageNumber <= totalPages; pageNumber++) {
        promises.push(this._getProjectMergeRequest(project_id,{ page: pageNumber }));
      }

      let merge_requests = firstPage;
      
      if (totalPages > 1) {
        merge_requests = merge_requests.concat(await Promise.all(promises)); 
      } 
      // 
      .log('merge_requests', merge_requests);
      return merge_requests;
    } catch(e) {
      throw e;
    }
  }

  _getProject({ page = 1 }) {
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
        promises.push(this._getProject({ page: pageNumber }));
      }

      let projects = firstPage;
      if (totalPages > 1) {
        projects = projects.concat(await Promise.all(promises));        
      } 
      
      return projects;
    } catch(e) {      
        throw e;
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