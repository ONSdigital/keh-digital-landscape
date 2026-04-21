# Data Context Documentation

## Overview

The DataContext provides centralised data management and caching for the Tech Radar application. It handles fetching and caching of CSV data, Tech Radar data, repository data, repository statistics, Copilot historic usage data, Copilot legacy usage data, banners, and user data.

## Core Functionality

### State Management

The context maintains these main pieces of state:

- csvData: Project and technology information
- techRadarData: Tech Radar entries and their statuses
- repositoryData: Repository-specific information (cached with Map)
- repositoryStats: General repository statistics (cached with Map)
- pageBanners: Page-specific banner content (cached with Map)
- historicUsageData: Organisation-level Copilot historic usage data
- legacyCopilotData: Legacy Copilot snapshots for pre-Feb 2025 and pre-Mar 2026
- userData: User profile information

### Caching Strategy

- Uses in-memory caching with React state
- Implements request deduplication using pendingRequests
- Supports forced refresh when needed
- Uses Map objects for parameterised data (repository data and stats)

### Request Handling

1. Check if data exists in cache
2. Check if there's a pending request for the same data
3. Make new request if needed
4. Cache the response
5. Clean up pending request

## Usage in Pages

### RadarPage

```javascript
const { getTechRadarData, getCsvData } = useData();

// Fetches and caches tech radar data
useEffect(() => {
  getTechRadarData().then(data => setData(data));
}, [getTechRadarData]);

// Fetches and caches project data
useEffect(() => {
  getCsvData().then(data => setProjectsData(data));
}, [getCsvData]);
```

### StatisticsPage

```javascript
const { getTechRadarData, getRepositoryStats, getCsvData } = useData();

// Initial data load
useEffect(() => {
  const [techData, projectData] = await Promise.all([
    getTechRadarData(),
    getCsvData()
  ]);
}, []);

// Fetching statistics with parameters
const fetchStatistics = async (date, repoView) => {
  const statsResponse = await getRepositoryStats(
    date,
    repoView === "archived" ? "true" : "false"
  );
};
```

### ProjectsPage

```javascript
const { getCsvData, getTechRadarData } = useData();

// Combined data fetching
useEffect(() => {
  const [csvData, techData] = await Promise.all([
    getCsvData(),
    getTechRadarData()
  ]);
}, []);

// Forced refresh
const handleRefresh = async () => {
  const newData = await getCsvData(true); // forceRefresh=true
};
```

## Cache Invalidation

The context provides a `clearCache` method to reset all cached data (including legacy Copilot data):

```javascript
const { clearCache } = useData();
clearCache(); // Clears all cached data
```

## Copilot Legacy Data

Legacy Copilot data is now fetched via DataContext to avoid page-level duplicate requests.

```javascript
const { getLegacyUsageData, legacyCopilotData } = useData();

useEffect(() => {
  getLegacyUsageData();
}, [getLegacyUsageData]);
```

- `getLegacyUsageData(forceRefresh = false)` fetches both legacy snapshots:
  - `pre-0225`
  - `pre-0326`
- `legacyCopilotData` shape:
  - `feb25`
  - `mar26`

The method uses the same deduplication pattern as other context fetchers (checks cache, then checks pending request, then performs fetch).

## Error Handling

- Each fetch method includes error handling
- Failed requests return null
- Components should handle null responses appropriately
- Toast notifications for user feedback

## Performance Considerations

1. Deduplication of in-flight requests prevents redundant API calls
2. Cached data reduces server load and improves response time
3. ForceRefresh parameter allows manual cache invalidation
4. Map-based caching enables efficient parameter-based data storage

## Best Practices

1. Always use useData hook within components
2. Include context methods in useEffect dependencies
3. Handle loading and error states in components
4. Use forceRefresh sparingly
5. Clear cache when data consistency is required
