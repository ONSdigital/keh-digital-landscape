import { useData } from '../contexts/dataContext';
import { specialTechMatchers } from './getSpecialTechMatchers';

/**
 * A React hook that returns a function to get the technology status.
 *
 * @returns {Function} A function that takes a technology name and returns its status
 */
export const useTechnologyStatus = () => {
  const { techRadarData, getTechRadarData } = useData();

  /**
   * Get the status of a technology from the radar data
   *
   * @param {string} tech - The technology to get the status for
   * @returns {string|null} - The technology status or null if not found
   */
  const getTechnologyStatus = tech => {
    if (!tech) return null;

    // Use existing radar data if available (synchronous path)
    if (techRadarData && techRadarData.entries) {
      return getStatusFromRadarData(tech, techRadarData);
    }

    // If techRadarData is not available, this returns a Promise
    return getTechRadarData().then(radarData => {
      return getStatusFromRadarData(tech, radarData);
    });
  };

  /**
   * Helper function to extract status from radar data
   *
   * @param {string} tech - The technology to get the status for
   * @param {Object} radarData - The radar data to search in
   * @returns {string|null} - The technology status or null if not found
   */
  const getStatusFromRadarData = (tech, radarData) => {
    if (!tech || !radarData || !radarData.entries) {
      return null;
    }

    for (let i = 0; i < radarData.entries.length; i++) {
      const radarTitle = radarData.entries[i].title;

      if (
        radarTitle.toLowerCase() === tech.trim().toLowerCase() ||
        (specialTechMatchers[radarTitle] &&
          specialTechMatchers[radarTitle](tech))
      ) {
        const entry = radarData.entries[i];
        if (!entry.timeline || entry.timeline.length === 0) {
          return null;
        }

        // Get the default directorate's ID from localStorage
        const defaultDirectorateId = localStorage.getItem(
          'defaultDirectorateId'
        );

        // Filter timeline entries to only include those relevant to the default directorate
        // If a timeline entry does not specify a directorate, we assume it applies to all directorates and include it
        const filteredTimeline = entry.timeline.filter(timelineEntry => {
          return (
            timelineEntry.directorate === defaultDirectorateId ||
            !timelineEntry.directorate
          );
        });

        const lastTimelineEntry =
          filteredTimeline[filteredTimeline.length - 1].ringId.toLowerCase();
        if (lastTimelineEntry === 'review' || lastTimelineEntry === 'ignore') {
          continue;
        }

        return lastTimelineEntry;
      }
    }

    return null;
  };

  return getTechnologyStatus;
};
