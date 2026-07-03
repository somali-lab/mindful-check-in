// App shell: title, nav tabs, theme names, global dialogs/errors.
// Both languages side by side — a new key must be added to BOTH blocks.
export const shell = {
  en: {
    appTitle: 'Mindful Check-in',
    version: 'v1.0.0',
    tabOverview: 'Overview',
    dlgConfirm: 'Confirm',
    dlgCancel: 'Cancel',
    ariaRemove: 'Remove',
    storageWriteError: 'Could not save — your browser storage may be full.',
    noscript: 'This app requires JavaScript to work.',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    ciTabCheckin: 'Check-in',
    ciTabHome: 'Home',
  },
  nl: {
    appTitle: 'Mindful Check-in',
    version: 'v1.0.0',
    tabOverview: 'Overzicht',
    dlgConfirm: 'Bevestigen',
    dlgCancel: 'Annuleren',
    ariaRemove: 'Verwijderen',
    storageWriteError: 'Kon niet opslaan — de opslag van je browser is mogelijk vol.',
    noscript: 'Deze app heeft JavaScript nodig.',
    themeLight: 'Licht',
    themeDark: 'Donker',
    themeSystem: 'Systeem',
    ciTabCheckin: 'Inchecken',
    ciTabHome: 'Home',
  },
} as const;
