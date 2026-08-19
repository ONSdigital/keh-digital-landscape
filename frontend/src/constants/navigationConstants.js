import {
  TbSmartHome,
  TbEditCircle,
  TbUserShield,
  TbUsers,
  TbChartBar,
  TbAddressBook,
  TbReport,
} from 'react-icons/tb';
import { MdOutlineRadar } from 'react-icons/md';
import { VscCopilot } from 'react-icons/vsc';

const baseNavigationItems = {
  home: {
    path: '/',
    label: 'Home',
    icon: TbSmartHome,
    isLink: true,
  },
  radar: {
    path: '/radar',
    label: 'Tech Radar',
    description:
      'Explore the technology radar, including adoption status and trends over time.',
    icon: MdOutlineRadar,
    isLink: true,
  },
  statistics: {
    path: '/statistics',
    label: 'Statistics',
    description:
      'Analyse repository statistics and language usage across the organisation.',
    icon: TbChartBar,
    isLink: true,
  },
  projects: {
    path: '/projects',
    label: 'Projects',
    description:
      'View all projects and their technology stacks across the organisation.',
    icon: TbUsers,
    isLink: true,
  },
  copilot: {
    path: '/copilot',
    label: 'GitHub Copilot',
    description:
      'Analyse GitHub Copilot usage statistics organisation-wide.',
    icon: VscCopilot,
    isLink: true,
    hasChildren: true,
    homeUseAnchor: true,
  },
  addressBook: {
    path: '/addressbook',
    label: 'GitHub Address Book',
    description: 'Translate GitHub Usernames to ONS Staff or vice versa.',
    icon: TbAddressBook,
    isLink: true,
    homeUseAnchor: true,
  },
  policyReports: {
    path: '/github-policy-reports',
    label: 'GitHub Policy Reports',
    description: 'Generate and view reports on GitHub Usage Policy compliance.',
    icon: TbReport,
    isLink: true,
    homeUseAnchor: true,
  },
  review: {
    path: '/review/dashboard',
    label: 'Review',
    description: 'Authorised users can update the data on the Tech Radar.',
    icon: TbEditCircle,
    isLink: false,
    homeUseAnchor: true,
  },
  admin: {
    path: '/admin/dashboard',
    label: 'Admin',
    description: 'Manage system-wide settings and configurations.',
    icon: TbUserShield,
    isLink: false,
    homeUseAnchor: true,
  },
};

export const generalNavigationItems = [
  baseNavigationItems.home,
  baseNavigationItems.radar,
  baseNavigationItems.statistics,
  baseNavigationItems.projects,
  baseNavigationItems.copilot,
  baseNavigationItems.addressBook,
  baseNavigationItems.policyReports,
];

export const restrictedNavigationItems = [
  baseNavigationItems.review,
  baseNavigationItems.admin,
];

export const homePageNavigationItems = [
  baseNavigationItems.radar,
  baseNavigationItems.statistics,
  baseNavigationItems.projects,
  baseNavigationItems.copilot,
  baseNavigationItems.addressBook,
  baseNavigationItems.policyReports,
  baseNavigationItems.review,
  baseNavigationItems.admin,
];

export const isNavigationItemActive = (item, pathname) => {
  if (item.hasChildren) {
    return pathname.includes(item.path);
  }

  return pathname === item.path;
};
