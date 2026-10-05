import { TECHNOLOGY_TAG_OPTIONS } from '../constants/technologyTagConstants';

export const matchesTechnologyTag = (tags, searchTermLower) =>
  tags?.some(tag => {
    const tagValue = String(tag).trim().toLowerCase();
    const tagOption = TECHNOLOGY_TAG_OPTIONS.find(
      option => option.value.toLowerCase() === tagValue
    );

    return (
      tagValue.includes(searchTermLower) ||
      tagOption?.label.toLowerCase().includes(searchTermLower)
    );
  }) ?? false;