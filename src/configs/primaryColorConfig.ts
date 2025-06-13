export type PrimaryColorConfig = {
  name?: string
  light?: string
  main: string
  dark?: string
}

// Primary color config object
const primaryColorConfig: PrimaryColorConfig[] = [
  {
    name: 'telesklad-primary',
    light: '#3EB5EA',
    main: '#1B6EF3',
    dark: '#134EC0'
  },
  {
    name: 'primary-pink',
    light: '#E67FB3',
    main: '#DF4C9D',
    dark: '#C9428D'
  },
  {
    name: 'primary-2',
    light: '#3DA8A9',
    main: '#0D9394',
    dark: '#0B8485'
  },
  {
    name: 'primary-3',
    light: '#FFBB4A',
    main: '#FFAB1D',
    dark: '#E5991A'
  },
  {
    name: 'primary-4',
    light: '#EF6382',
    main: '#EB3D63',
    dark: '#D33659'
  },
  {
    name: 'primary-5',
    light: '#4CA7EF',
    main: '#2092EC',
    dark: '#1C83D4'
  }
]

export default primaryColorConfig
