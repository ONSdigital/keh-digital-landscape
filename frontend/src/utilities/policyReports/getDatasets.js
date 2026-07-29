import { toast } from 'react-hot-toast';
import customFetch from '../customFetch';

export const fetchDatasetsByOrganisation = async organisation => {
  try {
    const response = await customFetch(
      `/policy-reports/api/datasets?organisation=${encodeURIComponent(organisation)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch datasets: ${response.statusText}`);
    }

    const data = await response.json();
    return data.datasets || [];
  } catch (error) {
    toast.error('Error loading datasets for the selected organisation.');
    return [];
  }
};
