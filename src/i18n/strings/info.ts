// Info/About view and the data tools (demo, clear all).
// Both languages side by side — a new key must be added to BOTH blocks.
export const info = {
  en: {
    infoTitle: 'About',
    infoTabAbout: 'About',
    infoTabGuide: 'Guide',
    infoTabPrivacy: 'Privacy',
    infoTabHeatmap: 'Heatmap',
    infoTabData: 'Data',
    infoDataTitle: 'Manage your data',
    infoDataIntro:
      'Back up or restore your check-ins, try the app with sample data, or permanently remove everything stored on this device.',
    infoDataExportTitle: 'Back up your entries',
    infoDataExportDesc:
      'Download all your check-ins as a JSON file to keep as a backup or move to another browser.',
    infoDataImportTitle: 'Restore from a backup',
    infoDataImportDesc:
      'Load check-ins from a JSON backup. You choose whether to overwrite or skip entries that already exist.',
    infoDataDemoTitle: 'Demo data',
    infoDataDemoDesc:
      'Adds 30 days of randomly generated check-ins alongside your own entries. Handy for exploring the overview, history and summary; your real entries are kept.',
    infoDataClearTitle: 'Clear all data',
    infoDataClearDesc:
      'Permanently deletes every check-in, all settings and cached weather from this browser. This cannot be undone, so export a backup first.',
    infoDesc:
      'A small private web app for a regular check-in with yourself. Runs entirely in your browser — no server, no account, no tracking.',
    infoKwa:
      "The name “Keep the Wolves Away” comes from the song by Uncle Lucius. It meant a lot to me during a burn-out — the same period in which I built this app, step by step. It's the app's default logo; if you prefer, you can pick a more neutral one under Settings → Logo.",
    infoSwingsTitle: 'Mood swings',
    infoSwingsDesc:
      'On the home page each “swing” score (0–100) shows how much that signal varied over the chosen period — its spread (standard deviation), scaled against the largest spread that is possible. 0 means every check-in was the same (a flat line); 100 means you swung fully between the two extremes each time. The emotion wheel has one axis; the mood matrix shows two — positivity and energy. It says nothing about whether you felt good or bad, only how much it moved.',
    infoPrivacyTitle: 'Privacy',
    infoPrivacyNoServer: 'No server. Everything runs locally in your browser.',
    infoPrivacyNoTracking: 'No analytics, no cookies, no tracking.',
    infoScoreTitle: 'How are the heatmap colours calculated?',
    infoScoreIntro:
      'The 28-day history and the 7-day summary both use three colours: green (good), orange (mixed) and red (low). The calculation differs per tab.',
    btnDemo: 'Generate demo data',
    btnClearAll: 'Clear all data',
    demoConfirm: 'Generate 30 demo entries?',
    clearConfirm: 'Delete ALL data? This cannot be undone.',
    demoGenerated: 'Generated {count} demo entries.',
    clearConfirmDouble: 'Are you really sure? All check-ins will be permanently deleted.',
    clearDone: 'All data cleared. Reloading…',
  },
  nl: {
    infoTitle: 'Over',
    infoTabAbout: 'Over',
    infoTabGuide: 'Gids',
    infoTabPrivacy: 'Privacy',
    infoTabHeatmap: 'Heatmap',
    infoTabData: 'Data',
    infoDataTitle: 'Je gegevens beheren',
    infoDataIntro:
      'Maak een back-up van je check-ins of zet ze terug, probeer de app met voorbeeldgegevens, of verwijder alles wat op dit apparaat is opgeslagen definitief.',
    infoDataExportTitle: 'Back-up van je entries',
    infoDataExportDesc:
      'Download al je check-ins als JSON-bestand om als back-up te bewaren of naar een andere browser te verplaatsen.',
    infoDataImportTitle: 'Terugzetten uit een back-up',
    infoDataImportDesc:
      'Laad check-ins uit een JSON-back-up. Je kiest zelf of bestaande entries worden overschreven of overgeslagen.',
    infoDataDemoTitle: 'Demodata',
    infoDataDemoDesc:
      'Voegt 30 dagen willekeurig gegenereerde check-ins toe naast je eigen gegevens. Handig om het overzicht, de historiek en de samenvatting te verkennen; je echte gegevens blijven behouden.',
    infoDataClearTitle: 'Alle data wissen',
    infoDataClearDesc:
      'Verwijdert definitief elke check-in, alle instellingen en gecachet weer uit deze browser. Dit kan niet ongedaan worden gemaakt, dus exporteer eerst een back-up.',
    infoDesc:
      'Een kleine privé web-app voor een regelmatige check-in met jezelf. Draait volledig in je browser — geen server, geen account, geen tracking.',
    infoKwa:
      'De naam “Keep the Wolves Away” komt van het gelijknamige nummer van Uncle Lucius. Het nummer is voor mij belangrijk geweest tijdens een burn-out — de periode waarin ik ook deze app, stap voor stap, heb gebouwd. Het is het standaardlogo van de app; wil je liever iets neutralers, dan kies je bij Instellingen → Logo een ander logo.',
    infoSwingsTitle: 'Stemmingswisselingen',
    infoSwingsDesc:
      'Op de homepagina laat elke “swing”-score (0–100) zien hoeveel dat signaal varieerde in de gekozen periode — de spreiding (standaarddeviatie), geschaald tegen de grootst mogelijke spreiding. 0 betekent dat elke check-in hetzelfde was (een vlakke lijn); 100 betekent dat je elke keer volledig tussen de twee uitersten schommelde. Het emotiewiel heeft één as; de mood-matrix toont er twee — positiviteit en energie. Het zegt niets over of je je goed of slecht voelde, alleen hoeveel het bewoog.',
    infoPrivacyTitle: 'Privacy',
    infoPrivacyNoServer: 'Geen server. Alles draait lokaal in je browser.',
    infoPrivacyNoTracking: 'Geen analytics, geen cookies, geen tracking.',
    infoScoreTitle: 'Hoe worden de heatmap-kleuren berekend?',
    infoScoreIntro:
      'De 28-dagen geschiedenis en de 7-daagse samenvatting gebruiken drie kleuren: groen (goed), oranje (gemengd) en rood (laag). De berekening verschilt per tabblad.',
    btnDemo: 'Genereer demodata',
    btnClearAll: 'Wis alle data',
    demoConfirm: '30 demo-entries genereren?',
    clearConfirm: 'ALLE data verwijderen? Dit kan niet ongedaan worden.',
    demoGenerated: '{count} demo-invoeren aangemaakt.',
    clearConfirmDouble: 'Weet je het zeker? Alle check-ins worden permanent verwijderd.',
    clearDone: 'Alle gegevens gewist. Herladen…',
  },
} as const;
