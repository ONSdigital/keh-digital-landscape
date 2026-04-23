# Banner Support

The Digital Landscape has functionality to support application wide banners. These banners can be used to display important information or alerts to users across the application.
Banners can be created, shown and hidden, and deleted by users via the admin page within the tool's UI.

## How Banners Work

### Frontend

There are 5 main components to the banner system:

1. **Banner Container**: This component is responsible for rendering the banner on the screen. It collects all active banners using the Admin Banner utility and creates a banner for each one.
2. **Banner**: This component is responsible for rendering the content of a single banner. It receives the banner's content and styling information as props and displays it accordingly. This component also handles the logic for closing banner based on user input.
3. **Banner Manage**: This component is responsible for managing the creation, toggling, and deletion of banners. It provides a user interface for administrators to create new banners, specify their content, and configure their display settings.
4. **Admin Banner**: This utility is responsible for plugging the Banner Manage component into the backend. It facilitates the CRUD operations by calling endpoints from the backend.
5. **Get Banner**: This utility is responsible for collecting banners from the backend and providing them to the Banner Container component for rendering. This component also houses all of the page matching and visibility logic for the banners, determining which banners should be shown to the user based on the current page and the user's interaction history with the banner (i.e. whether they have dismissed the banner in the past).

#### Banner Collection Logic

##### Admin Page (Banner Manage)

On the admin page, all banners are collected and shown to the user regardless of their active status. This allows administrators to see all banners that have been created, manage their content, and toggle their visibility or delete them as needed.

This is implemented in the Admin Banner utility, which calls the `GET /banners` endpoint to retrieve all banners from the backend and provides them to the Banner Manage component for rendering.

The Admin Banner utility also provides functions for creating, toggling, and deleting banners by calling the respective endpoints in the backend when administrators interact with the Banner Manage component.

##### Other Pages (Banner Container)

For all other pages in the application, only active banners that are relevant to the current page are collected and shown to the user. This ensures that users only see banners that are applicable to their current context.

The Get Banner utility is responsible for this logic. It contains a `fetchBanners()` method which calls the `GET /banners` endpoint to retrieve all banners from the backend. It then filters the banners based on their active status and the pages they are configured to be shown on, returning only the relevant banners to the Banner Container component for rendering.

The utility will only ever return a single banner per page, even if multiple banners are active for that page. It will return only the most recently created banner for the page.

This utility also contains the logic for reactivating banners that have been dismissed by the user. When a user dismisses a banner, the utility sets a cookie to hide the banner for that user for seven days. After this period, the utility will automatically show the banner again to the user unless it has been deactivated or deleted by an administrator in the meantime.

### Backend

#### Endpoints

The backend of the banner system is responsible for storing and managing the banner data. Logic for this is implemented within the admin route of the backend. This provides the following endpoints:

- `POST /banners/update`: This endpoint is used to create new banners or update existing ones.
- `GET /banners`: This endpoint retrieves all banners from AWS S3 and returns them to the frontend.
- `POST /banners/toggle`: This endpoint is used to toggle the active status of a banner, allowing administrators to show or hide banners without deleting them.
- `POST /banners/delete`: This endpoint is used to delete a banner permanently from the system.

#### Data Structure

All banners are stored in AWS S3 as a JSON file (`messages.json`). Each banner is represented as an object with the following properties:

```json
{
  "messages": [
    {
      "title": "Test Banner",
      "message": "Test Banner Message",
      "description": "Test Banner Message",
      "type": "info", // Either info, warning, or error
      "pages": [
        // The pages across the application that the banner should be shown on
        "radar",
        "statistics",
        "addressbook"
      ],
      "show": false // Whether the banner is currently active and should be shown to users
    }
  ]
}
```

### Banner Lifecycle

The lifecycle of a banner typically involves the following steps:

1. **Creation**: An administrator creates a new banner using the Banner Manage component within the admin page. They can specify the content and display settings for the banner.
2. **Activation**: Once created, the banner is activated and becomes visible to users across the application, for the specified pages. The Banner Container component retrieves the active banners from the backend and renders them on the screen.
3. **Interaction**: Users can interact with the banner, such as dismissing it or clicking on links within the banner. The Banner component handles these interactions and updates the banner's visibility accordingly.
4. **Reactivation**: If a user dismisses a banner, it will be hidden for that user for seven days. After this period, the banner will become visible again to the user unless it has been deactivated or deleted by an administrator.
5. **Deactivation/Deletion**: An administrator can choose to deactivate (hide) or delete a banner at any time using the Banner Manage component. Deactivating a banner will hide it from all users, while deleting it will remove it permanently from the system.

## Developer Guides

### Changing Banner Reactivation Time

The reactivation time for dismissed banners is currently set to seven days. This means that when a user dismisses a banner, it will be hidden from them for seven days before it becomes visible again.

This is controlled within `utilities/getBanner.js` in the `fetchBanners()` method. The reactivation time is set using a variable called `sevenDays`.

Simply change the value of this variable to adjust the reactivation time for dismissed banners.
This is calculated in milliseconds.

### Adding Banner Support to a New Page

To add banner support to a new page within the application, you must do the following:

1. Ensure that the new page is wrapped within the `layout` component, as the Banner Container component is rendered within the layout and will only be visible on pages that are wrapped by it.

   Example:

   ```js
   <Layout
       headerProps={{
         ...
       }}
       bannerProps={{ page: 'PAGE_NAME' }}
   >
       page content here
   </Layout>
   ```

2. Update the `Banner Manage` component to include the new page as an option when creating or editing banners.

   This involves adding the new page to the list of available pages that administrators can select when configuring a banner's display settings.

   Update the `pageOptions` array in the `Banner Manage` component to include the new page:

   ```js
   const pageOptions = [
     { label: 'Radar', value: 'radar' },
     { label: 'Statistics', value: 'statistics' },
     { label: 'Projects', value: 'projects' },
     { label: 'Copilot Team', value: 'copilot/team' },
     { label: 'Copilot Org', value: 'copilot/org' },
     { label: 'Address Book', value: 'addressbook' },
     { label: 'New Page', value: 'newpage' }, // Add new page option here
   ];
   ```

   The `label` is the name that will be shown to administrators in the dropdown menu when configuring a banner, and the `value` is the identifier that will be used in the backend to determine which page the banner should be shown on. Make sure to use a unique value for the new page that does not conflict with existing page values.

3. Update UI tests for the banner logic to include the new page option.

   This can be done by updating the `pageOptions` array in `admin.banners.test.js` to include the new page/match the one within code.

   The test uses this list to ensure that banners can be created for each page option.

After completing these steps, the new page will be able to support banners, and administrators will be able to create banners that are shown on the new page.
