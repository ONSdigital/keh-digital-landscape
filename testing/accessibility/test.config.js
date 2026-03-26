const config = {
  pages: [
    {
      name: 'Home Page',
      url: '/',
      authentication: [],
    },
    {
      name: 'Tech Radar',
      url: '/radar',
      authentication: [],
    },
    {
      name: 'Statistics',
      url: '/statistics',
      authentication: [],
    },
    {
      name: 'Projects',
      url: '/projects',
      authentication: [],
    },
    {
      name: 'GitHub Copilot Organisation Usage',
      url: '/copilot/org/historic',
      authentication: [],
    },
    {
      name: 'GitHub Copilot Team Usage',
      url: '/copilot/team',
      authentication: ['githubUserToken'],
    },
    {
      name: 'GitHub Address Book',
      url: '/addressbook',
      authentication: [],
    },
    {
      name: 'Review Dashboard',
      url: '/review/dashboard',
      authentication: [],
    },
    {
      name: 'Admin Dashboard',
      url: '/admin/dashboard',
      authentication: [],
    },
  ],
};

module.exports = config;
