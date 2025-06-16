## [📖 Docs](https://docs.nextadmin.co/)

## Installation

1. Download/fork/clone the repo. Once you're in the correct directory, it's time to install all the necessary dependencies. You can do this by typing the following command:

```
npm install
```
> Some packages *may* cause peer-dependency issue with React 19. So if you face any issues while installing, use the optional `--legacy-peer-deps` command.


1. Okay, you're almost there. Now all you need to do is start the development server. If you're using **npm**, the command is:

```
npm run dev
```
And if you're using **Yarn**, it's:

```
yarn dev
```

And voila! You're now ready to start developing. **Happy coding**!


## Update Logs

### Version 1.2.1 - Fix peer dependency issue - [Mar 19, 2025]
- Fixed peer dependency issue with React 19
- Migrated from `react-table` to `@tanstack/react-table`
- Fixed reference error in `top-countries/map.tsx` component

### Version 1.2.0 - Major Upgrade and UI Improvements - [Jan 27, 2025]

- Upgraded to Next.js v15 and updated dependencies
- API integration with loading skeleton for tables and charts.
- Improved code structure for better readability.
- Rebuilt components like dropdown, modals, and all ui-elements using accessibility practices.
- Using search-params to store dropdown selection and refetch data.
- Semantic markups, better separation of concerns and more.

### Version 1.1.0 - Initial Release - [May 13, 2024]

- Updated Dependencies
- Removed Unused Integrations
- Optimized App

  
### Version 1.0.0 - Initial Release - [May 13, 2024]

- Initial release
