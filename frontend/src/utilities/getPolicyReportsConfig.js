import { toast } from 'react-hot-toast';
import customFetch from './customFetch';

export const fetchPolicyReportsConfig = async () => {
  try {
    const response = await customFetch('/policy-reports/api/config');

    if (!response.ok) {
      throw new Error(
        `Failed to fetch policy report config: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    toast.error('Error loading policy report configuration.');
    return null;
  }
};

export const fetchDatasetsByOrganisation = async (organisation) => {
  try {
    const response = await customFetch(
      `/policy-reports/api/datasets?organisation=${encodeURIComponent(organisation)}`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch datasets: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.datasets || [];
  } catch (error) {
    toast.error('Error loading datasets for the selected organisation.');
    return [];
  }
};
