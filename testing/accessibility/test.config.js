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
    {
      name: 'GitHub Copilot Landing Page',
      url: '/copilot/home',
      authentication: [],
    },
    {
      name: 'GitHub Copilot Legacy Usage',
      url: '/copilot/legacy',
      authentication: [],
    },
    {
      name: 'GitHub Copilot General Usage',
      url: '/copilot/general',
      authentication: [],
    },
    {
      name: 'GitHub Copilot Code Completions',
      url: '/copilot/code-completions',
      authentication: [],
    },
  ],
};

module.exports = config;
