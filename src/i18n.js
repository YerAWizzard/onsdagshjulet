export const translations = {
  sv: {
    languageName: 'Svenska',
    headerTitle: 'Gör vardagen lite roligare.',
    subtitle: 'Kan ni inte bestämma er? Låt Onsdagshjulet välja.',
    headerControlsLabel: 'Språk och information',
    controlsLabel: 'Hjulreglage',
    focusMode: {
      enter: 'Maximera hjulet',
      show: 'Visa kontroller',
      helper: 'Klicka på “Visa kontroller” för att ändra dina val.',
      hideLabel: 'Maximera hjulet och dölj kontroller',
      showLabel: 'Visa kontroller och avsluta fokusläge',
    },
    settings: {
      title: 'Lägg till dina val',
      help: 'Skriv in alternativen som hjulet ska välja mellan. Justera vinstchansen, markera en stjärnvinst eller använd + för att lägga till ett underhjul. Om ett val med underhjul vinner snurrar hjulet vidare mellan dess alternativ.',
      helpIntro: 'Skriv in alternativen som hjulet ska välja mellan.',
      helpProbability: 'Justera vinstchansen',
      helpStar: 'Markera en stjärnvinst',
      helpSubwheel: 'Lägg till ett underhjul',
      helpOutro: 'Om ett val med underhjul vinner snurrar hjulet vidare mellan dess alternativ.',
      optionName: 'Namn på val {{number}}',
      optionPercentage: 'Procent för val {{number}}',
      editPercentage: 'Justera vinstchans för {{name}}',
      markStar: 'Markera {{name}} som stjärnvinst',
      remove: 'Ta bort {{name}}',
      addSubWheel: 'Lägg till underhjul för {{name}}',
      addSubWheelTooltip: 'Lägg till underhjul',
      showSubWheel: 'Visa underhjul för {{name}}',
      hideSubWheel: 'Dölj underhjul för {{name}}',
      showSubWheelTooltip: 'Visa underhjul',
      hideSubWheelTooltip: 'Dölj underhjul',
      adjustWinChance: 'Justera vinstchans',
      markStarWin: 'Markera som stjärnvinst',
      removeChoice: 'Ta bort',
      toggleSubWheel: 'Visa/dölj underhjul för {{name}}',
      subWheelHeading: 'Om {{name}} vinner, snurra mellan:',
      addSubOption: '+ Lägg till nytt val',
      removeSubWheel: 'Ta bort underhjul',
      minimumSubWheelLabel: 'Bekräfta borttagning av underhjul',
      minimumSubWheelQuestion: 'Ett underhjul måste ha minst två val. Vill du ta bort hela underhjulet istället?',
      removeSubOption: 'Ta bort undervalet {{name}}',
      subOptionName: 'Namn på underval {{number}} för {{name}}',
      subOptionPlaceholder: 'Val {{number}}',
      subOptionPercentage: 'Vinstchans för {{name}} i underhjulet för {{parent}}',
      defaultSubWheelTitle: 'Vad blir det idag?',
      automatic: 'Automatisk',
      addRow: '＋ Lägg till val',
      unnamedOption: 'val {{number}}',
      showProbabilities: 'Visa sannolikheten',
      hideProbabilities: 'Dölj sannolikheten',
      showSubwheels: 'Visa underhjul',
      hideSubwheels: 'Dölj underhjul',
      localProbability: '{{value}} inom underhjulet för {{parent}}',
      subwheelScopeNote: 'Procent i underhjul gäller inom respektive underhjul.',
      auto: '%',
      customPercentage: 'Ändra %',
      useAutomatic: 'Använd automatisk chans',
      saveProbability: 'Spara',
      cancelProbability: 'Avbryt',
      invalidPercentage: 'Ogiltig procentsats',
      totalExceeds: 'Den angivna chansen överstiger totalt 100 %',
    },
    audio: {
      title: 'Musik och stämning',
      help: 'Välj soundtracket till kvällens stora, fullständigt rimliga beslutsshow.',
      on: 'Musik på',
      off: 'Musik av',
      modeLabel: 'Musikläge',
      volume: 'Musik',
      effectsVolume: 'Ljudeffekter',
      modes: {
        Festival: 'Festival',
        Fantasy: 'Fantasy',
        Suspense: 'Spänning',
        Christmas: 'Jul',
        Lounge: 'Lounge',
      },
      themeHelp: {
        Festival: 'Konfettin är laddad, cirkusen är öppen och lagom mycket glatt kaos väntar bakom ridån.',
        Fantasy: 'Trollkarlarna har samlats. Nästa snurr är början på en mycket episk och märkligt viktig quest.',
        Suspense: 'Kodnamn: Onsdag. Uppdraget är hemligt, dramatiken maximal och hjulet vet för mycket.',
        Christmas: 'Tomten har tagit kommandot, bjällrorna är framme och lite julmagi avgör resten.',
        Lounge: 'Välkommen till hotellobbyn. Hissmusiken spelar och väntan är nästan orimligt elegant.',
      },
      previousTrack: 'Föregående låt',
      nextTrack: 'Nästa låt',
      trackStatus: '{{theme}} {{current}} av {{total}}',
    },
    session: {
      title: 'Spara dina inställningar lokalt',
      help: 'Spara hjulets nuvarande val och inställningar på den här enheten och återställ dem senare.',
      save: 'Spara',
      restore: 'Återställ',
      delete: 'Ta bort',
      none: 'Ingen sparad session på den här enheten.',
      savedWithoutDate: 'Det finns en sparad session på den här enheten.',
      lastSaved: 'Senast sparad: {{timestamp}}',
      saved: 'Sessionen sparades lokalt.',
      saveFailed: 'Sessionen kunde inte sparas lokalt.',
      restored: 'Den sparade sessionen återställdes.',
      deleted: 'Den sparade sessionen raderades.',
      missing: 'Ingen giltig sparad session hittades.',
      deleteFailed: 'Den sparade sessionen kunde inte raderas.',
      confirm: {
        cancel: 'Avbryt',
        overwrite: {
          label: 'Bekräfta överskrivning',
          question: 'Det finns redan en sparad session. Vill du ersätta den?',
          action: 'Ersätt',
        },
        restore: {
          label: 'Bekräfta återställning',
          question: 'Det här ersätter dina nuvarande val och inställningar med den sparade sessionen. Vill du fortsätta?',
          action: 'Återställ',
        },
        delete: {
          label: 'Bekräfta borttagning',
          question: 'Vill du ta bort den sparade sessionen från den här enheten?',
          action: 'Ta bort',
        },
      },
    },
    spinSettings: {
      title: 'Snurrinställningar',
      help: 'Välj hur kort eller länge hjulet kan snurra. Varje snurr får en slumpad tid inom intervallet.',
      minimum: 'Minsta snurrtid',
      maximum: 'Längsta snurrtid',
      seconds: '{{value}} sek',
    },
    templates: {
      title: 'Inspiration & färdiga hjul',
      help1: 'Beslutsångest deluxe? Ingen fara. Välj ett färdigt hjul, kasta in era egna idéer och låt slumpen styra upp resten. Middag, filmkväll, städkaos eller något helt annat — ibland är det skönt att bara snurra och köra.',
      help2: 'Vardagen ringde och bad om mer konfetti. Börja med ett färdigt hjul, ändra det tills det känns som ert och låt spontaniteten ta över.',
      help3: 'Middag eller film? Promenad eller soffläge? Välj en startpunkt och ge beslutsångesten ledigt resten av kvällen.',
      help4: 'Lite vardagslyx, ett uns kaos och noll möten. Plocka ett färdigt hjul och låt nästa snurr skriva kvällens manus.',
      help5: 'Ibland behövs ingen femårsplan — bara några roliga val och ett rejält ”bara kör”. Här börjar det.',
      replaceLabel: 'Ersätt hjulets val',
      replaceQuestion: 'Ersätt de nuvarande valen med ”{{name}}”?',
      replace: 'Ersätt valen',
      cancel: 'Avbryt',
    },
    wheel: {
      label: 'Hjul',
      canvasLabel: 'Snurrande valhjul med {{items}}',
      spinAgain: 'SNURRA VIDARE',
      done: 'KLAR',
      backToMain: 'Tillbaka till huvudhjulet',
      back: 'Tillbaka',
      subwheelContext: 'Underhjul',
      spin: '✨ SNURRA HJULET ✨',
      spinFromCenter: 'Snurra hjulet från mittstjärnan',
      countdownSpin: 'Snurra!',
      winner: 'VINNARE',
      starPrize: '★ STJÄRNVINST ★',
      waiting: 'VINNAREN VISAS HÄR',
      goodLuck: 'Lycka till!',
    },
    footer: {
      label: 'Programstatus',
      mobile: 'Gör vardagen lite mer magisk.',
      version: 'Onsdagshjulet – Version {{version}}',
      storage: 'Dina val sparas bara på den här enheten. Inget konto behövs.',
    },
    about: {
      open: 'Om Onsdagshjulet',
      title: 'Om Onsdagshjulet',
      paragraph1: 'Jag kollade runt på olika “Spin the Wheel”-sidor på nätet, men tyckte att de flesta var lite väl… tråkiga.',
      paragraph2: 'Jag ville ha något med mer känsla, mer personlighet och lite mer deluxe – utan att allt behöver vara så seriöst.',
      paragraph3: 'Vi har ofta svårt att bestämma vad vi ska hitta på. Därför får Onsdagshjulet låta slumpen välja – från middag och utflykter till spontana små äventyr.',
      paragraph4: 'Ibland är det helt enkelt skönt att slippa bestämma själv.',
      version: 'Version {{version}}',
    },
    probability: {
      atLeastTwo: 'Lägg till minst två val.',
      atLeastTwoValid: 'Underhjulet behöver minst två giltiga val.',
      invalid: 'Ogiltig procentsats',
      overTotal: 'Den angivna chansen överstiger totalt 100 %',
      exactTotal: 'När alla val har en procentandel måste summan vara 100 %.',
    },
    collapse: 'Dölj {{name}}',
    expand: 'Visa {{name}}',
  },
  en: {
    languageName: 'English',
    headerTitle: 'Make everyday life a little more fun.',
    subtitle: 'Can’t decide? Let Onsdagshjulet choose.',
    headerControlsLabel: 'Language and information',
    controlsLabel: 'Wheel controls',
    focusMode: {
      enter: 'Maximize wheel',
      show: 'Show controls',
      helper: 'Click “Show controls” to edit your choices.',
      hideLabel: 'Maximize the wheel and hide controls',
      showLabel: 'Show controls and exit focus mode',
    },
    settings: {
      title: 'Add your choices',
      help: 'Enter the options you want the wheel to choose between. Adjust the win chance, mark a star prize, or use + to add a subwheel. If an option with a subwheel wins, the wheel spins again between its options.',
      helpIntro: 'Enter the options you want the wheel to choose between.',
      helpProbability: 'Adjust the win chance',
      helpStar: 'Mark a star prize',
      helpSubwheel: 'Add a subwheel',
      helpOutro: 'If an option with a subwheel wins, the wheel spins again between its options.',
      optionName: 'Option {{number}} name',
      optionPercentage: 'Option {{number}} percentage',
      editPercentage: 'Adjust win chance for {{name}}',
      markStar: 'Mark {{name}} as star win',
      remove: 'Remove {{name}}',
      addSubWheel: 'Add subwheel for {{name}}',
      addSubWheelTooltip: 'Add subwheel',
      showSubWheel: 'Show subwheel for {{name}}',
      hideSubWheel: 'Hide subwheel for {{name}}',
      showSubWheelTooltip: 'Show subwheel',
      hideSubWheelTooltip: 'Hide subwheel',
      adjustWinChance: 'Adjust win chance',
      markStarWin: 'Mark as star win',
      removeChoice: 'Remove',
      toggleSubWheel: 'Show/hide sub-wheel for {{name}}',
      subWheelHeading: 'If {{name}} wins, spin between:',
      addSubOption: '+ Add new option',
      removeSubWheel: 'Remove sub-wheel',
      minimumSubWheelLabel: 'Confirm subwheel removal',
      minimumSubWheelQuestion: 'A subwheel needs at least two choices. Do you want to remove the entire subwheel instead?',
      removeSubOption: 'Remove sub-option {{name}}',
      subOptionName: 'Sub-option {{number}} name for {{name}}',
      subOptionPlaceholder: 'Choice {{number}}',
      subOptionPercentage: 'Win chance for {{name}} in the subwheel for {{parent}}',
      defaultSubWheelTitle: "What's it going to be today?",
      automatic: 'Automatic',
      addRow: '＋ Add choice',
      unnamedOption: 'option {{number}}',
      showProbabilities: 'Show probability',
      hideProbabilities: 'Hide probability',
      showSubwheels: 'Show subwheels',
      hideSubwheels: 'Hide subwheels',
      localProbability: '{{value}} within the subwheel for {{parent}}',
      subwheelScopeNote: 'Subwheel percentages apply within their own subwheel.',
      auto: '%',
      customPercentage: 'Change %',
      useAutomatic: 'Use automatic probability',
      saveProbability: 'Save',
      cancelProbability: 'Cancel',
      invalidPercentage: 'Invalid percentage',
      totalExceeds: 'The entered probabilities exceed 100% in total',
    },
    audio: {
      title: 'Music & mood',
      help: 'Choose the soundtrack for tonight’s grand and entirely reasonable decision show.',
      on: 'Music on',
      off: 'Music off',
      modeLabel: 'Music mode',
      volume: 'Music',
      effectsVolume: 'Sound effects',
      modes: {
        Festival: 'Festival',
        Fantasy: 'Fantasy',
        Suspense: 'Suspense',
        Christmas: 'Christmas',
        Lounge: 'Lounge',
      },
      themeHelp: {
        Festival: 'The confetti is loaded, the circus is open, and just the right amount of cheerful chaos waits behind the curtain.',
        Fantasy: 'The wizards have assembled. Your next spin begins a highly epic and strangely important quest.',
        Suspense: 'Codename: Wednesday. The mission is secret, the drama is maximum, and the wheel knows too much.',
        Christmas: 'Santa is in command, the bells are out, and a little Christmas magic will settle the rest.',
        Lounge: 'Welcome to the hotel lobby. The elevator music is playing and the wait is almost unreasonably elegant.',
      },
      previousTrack: 'Previous track',
      nextTrack: 'Next track',
      trackStatus: '{{theme}} {{current}} of {{total}}',
    },
    session: {
      title: 'Save your settings locally',
      help: 'Save the wheel’s current choices and settings on this device and restore them later.',
      save: 'Save',
      restore: 'Restore',
      delete: 'Delete',
      none: 'No saved session on this device.',
      savedWithoutDate: 'There is a saved session on this device.',
      lastSaved: 'Last saved: {{timestamp}}',
      saved: 'Session saved locally.',
      saveFailed: 'The session could not be saved locally.',
      restored: 'Saved session restored.',
      deleted: 'Saved session deleted.',
      missing: 'No valid saved session was found.',
      deleteFailed: 'The saved session could not be deleted.',
      confirm: {
        cancel: 'Cancel',
        overwrite: {
          label: 'Confirm overwrite',
          question: 'There is already a saved session. Do you want to replace it?',
          action: 'Replace',
        },
        restore: {
          label: 'Confirm restore',
          question: 'This will replace your current choices and settings with the saved session. Do you want to continue?',
          action: 'Restore',
        },
        delete: {
          label: 'Confirm deletion',
          question: 'Do you want to delete the saved session from this device?',
          action: 'Delete',
        },
      },
    },
    spinSettings: {
      title: 'Spin settings',
      help: 'Choose how briefly or how long the wheel may spin. Each spin gets a random duration within the range.',
      minimum: 'Minimum spin time',
      maximum: 'Maximum spin time',
      seconds: '{{value}} sec',
    },
    templates: {
      title: 'Inspiration & ready-made wheels',
      help1: 'Decision paralysis deluxe? No worries. Pick a ready-made wheel, toss in your own ideas, and let chance sort out the rest. Dinner, movie night, cleaning chaos, or something else entirely — sometimes it feels good to spin and go.',
      help2: 'Everyday life called and asked for more confetti. Start with a ready-made wheel, tweak it until it feels like yours, and let spontaneity take over.',
      help3: 'Dinner or a movie? A walk or the sofa? Pick a starting point and give decision fatigue the rest of the evening off.',
      help4: 'A little everyday luxury, a dash of chaos, and zero meetings. Pick a ready-made wheel and let the next spin write tonight’s script.',
      help5: 'Sometimes you don’t need a five-year plan — just a few fun choices and a wholehearted “let’s go.” Start here.',
      replaceLabel: 'Replace wheel options',
      replaceQuestion: 'Replace the current options with “{{name}}”?',
      replace: 'Replace options',
      cancel: 'Cancel',
    },
    wheel: {
      label: 'Wheel',
      canvasLabel: 'Spinning choice wheel with {{items}}',
      spinAgain: 'SPIN AGAIN',
      done: 'DONE',
      backToMain: 'Back to the main wheel',
      back: 'Back',
      subwheelContext: 'Subwheel',
      spin: '✨ SPIN THE WHEEL ✨',
      spinFromCenter: 'Spin the wheel from the center star',
      countdownSpin: 'Spin!',
      winner: 'WINNER',
      starPrize: '★ STAR PRIZE ★',
      waiting: 'THE WINNER APPEARS HERE',
      goodLuck: 'Good luck!',
    },
    footer: {
      label: 'Application status',
      mobile: 'Make everyday a little more magical.',
      version: 'Onsdagshjulet – Version {{version}}',
      storage: 'Your choices are saved only on this device. No account needed.',
    },
    about: {
      open: 'About Onsdagshjulet',
      title: 'About Onsdagshjulet',
      paragraph1: 'I looked around at different “Spin the Wheel” sites online, but thought most of them were a little too… boring.',
      paragraph2: 'I wanted something with more feeling, more personality, and a little more deluxe – without everything having to be so serious.',
      paragraph3: 'We often have a hard time deciding what to do. So Onsdagshjulet lets chance choose – from dinner and outings to spontaneous little adventures.',
      paragraph4: 'Sometimes it’s simply nice not to have to decide for yourself.',
      version: 'Version {{version}}',
    },
    probability: {
      atLeastTwo: 'Add at least two options.',
      atLeastTwoValid: 'The subwheel needs at least two valid choices.',
      invalid: 'Invalid percentage',
      overTotal: 'The entered probabilities exceed 100% in total',
      exactTotal: 'When every option has a percentage, the values must total 100%.',
    },
    collapse: 'Collapse {{name}}',
    expand: 'Expand {{name}}',
  },
}

export const templateCatalog = [
  {
    id: 'creator-favorite', emoji: '⭐',
    name: { sv: 'Min favorit (Göteborg)', en: 'My favorite (Gothenburg)' },
    options: {
      sv: [
        'Laga något riktigt gott',
        'Film & soffläge 🍿',
        'KÖPOTEKET!',
        'GRAND TOUR OF FIKA',
        'Gå ut och ät – inte en chans att vi lagar mat! 😎',
        'Kulturpoäng – museum!',
        'Bio med allt! 🎟️',
        'Ut i naturen! 🌲',
        'Surprise övernattning',
        'SPELKVÄLL',
        'Vardagsäventyr',
        'Spontaniteten flödar – unna dig utan konsekvenstänk 😂',
      ],
      en: [
        'Cook something seriously good',
        'Movie & couch mode 🍿',
        'Purchasing spree!',
        'GRAND TOUR OF COFFEE & CAKE',
        "We're eating out – absolutely no cooking tonight! 😎",
        'Culture points – museum time!',
        'Cinema with everything! 🎟️',
        'Get out into nature! 🌲',
        'Surprise overnight stay',
        'GAME NIGHT',
        'Everyday adventures',
        'Spontaneity mode – treat yourself, consequences later 😂',
      ],
    },
    optionSettings: {
      1: {
        subWheel: {
          id: 'favorite-movies',
          title: { sv: 'Vad ska vi se?', en: 'What should we watch?' },
          options: {
            sv: ['100-filmer-planschen 🎬', 'Komedi', 'Sci-Fi', '90s', '00s', '10s', '20s', 'Dealers Choice'],
            en: ['100-movie poster 🎬', 'Comedy', 'Sci-Fi', '90s', '00s', '10s', '20s', "Dealer's Choice"],
          },
          optionSettings: {
            7: {
              subWheel: {
                id: 'favorite-movies-dealers-choice',
                title: { sv: 'Vem väljer?', en: 'Who chooses?' },
                options: { sv: ['Me', 'You'], en: ['Me', 'You'] },
              },
            },
          },
        },
      },
      2: {
        subWheel: {
          id: 'kopoteket',
          title: { sv: 'Vad blir det idag?', en: "What's it going to be today?" },
          options: {
            sv: ['Hede Fashion Outlet', 'Costco', 'Eko', 'Ica Focus', 'Frölunda Torg', 'Ullared', 'Veckohandling', 'British Shop 🇬🇧', 'Saluhallen', 'Haga gå gata!'],
            en: ['Hede Fashion Outlet', 'Costco', 'Eko', 'Ica Focus', 'Frölunda Torg', 'Ullared', 'Weekly shop', 'British Shop 🇬🇧', 'Market Hall', 'Haga pedestrian street!'],
          },
        },
      },
      3: {
        subWheel: {
          id: 'favorite-fika',
          title: { sv: 'Var fikar vi?', en: 'Where should we grab coffee?' },
          options: {
            sv: ['Prova något nytt!', 'Gammal favorit!', 'Gångavstånd! 🚶', 'Kattcafé 🐈', 'Rooftop'],
            en: ['Try something new!', 'Old favorite!', 'Walking distance! 🚶', 'Cat café 🐈', 'Rooftop'],
          },
        },
      },
      4: {
        subWheel: {
          id: 'favorite-restaurants',
          title: { sv: 'Var ska vi äta?', en: 'Where should we eat?' },
          options: {
            sv: ['Prova något nytt!', 'Tapas', 'Bar Minimal', 'Asiatiskt', 'Pizza', 'HAMBORGOR!!', 'Dealers Choice', 'Rooftop'],
            en: ['Try something new!', 'Tapas', 'Bar Minimal', 'Asian', 'Pizza', 'BURGERS!!', "Dealer's Choice", 'Rooftop'],
          },
          optionSettings: {
            1: {
              subWheel: {
                id: 'favorite-restaurants-tapas',
                title: { sv: 'Vilken tapas?', en: 'Which tapas place?' },
                options: { sv: ['Mañana', 'Pinchos'], en: ['Mañana', 'Pinchos'] },
              },
            },
          },
        },
      },
      7: {
        subWheel: {
          id: 'favorite-nature',
          title: { sv: 'Vart går vi?', en: 'Where should we go?' },
          options: {
            sv: ['Åsa naturreservat', 'Skärgården', 'Slottskogen', 'Stadstomten på vift!', 'Delsjön', 'Botaniska'],
            en: ['Åsa nature reserve', 'The archipelago', 'Slottskogen', 'City gnome on the loose!', 'Delsjön', 'The Botanical Garden'],
          },
        },
      },
      8: {
        percentage: '3',
        star: true,
        subWheel: {
          id: 'favorite-overnight',
          title: { sv: 'Vilken övernattning?', en: 'What kind of overnight stay?' },
          options: {
            sv: ['Spa', 'Pool', 'I Göteborg', 'Naturnära', 'Vibes luxe!'],
            en: ['Spa', 'Pool', 'In Gothenburg', 'Close to nature', 'Luxury vibes!'],
          },
        },
      },
      9: {
        subWheel: {
          id: 'favorite-game-night',
          title: { sv: 'Vad spelar vi?', en: 'What should we play?' },
          options: {
            sv: ['TFT!', 'Exit', 'Hitster', 'Super Mario Party', 'It Takes Two', 'Escape room-PC-spel'],
            en: ['TFT!', 'Exit', 'Hitster', 'Super Mario Party', 'It Takes Two', 'Escape-room PC game'],
          },
        },
      },
      10: {
        star: true,
        subWheel: {
          id: 'favorite-everyday-adventures',
          title: { sv: 'Vilket vardagsäventyr?', en: 'Which everyday adventure?' },
          options: {
            sv: ['Hajbåten', 'Minigolf', 'Biljard', 'Escape room', 'Dart', 'Shuffleboard', 'Rooftop bar', 'Cocktail bar 🍸'],
            en: ['The shark boat', 'Mini golf', 'Pool', 'Escape room', 'Darts', 'Shuffleboard', 'Rooftop bar', 'Cocktail bar 🍸'],
          },
        },
      },
      11: { percentage: '0.1' },
    },
  },
  {
    id: 'eat', emoji: '🍕',
    name: { sv: 'Vad ska vi äta?', en: 'What should we eat?' },
    options: {
      sv: [
        '🍕 Pizza',
        '🌮 Tacos',
        '🍣 Sushi',
        '🍝 Pasta',
        '🐟 Fisk',
        '🍔 Hamburgare',
        '🥙 Kebab',
        '🍛 Asiatiskt',
        '🍲 Husmanskost',
        '🥗 Något lätt!',
        '🥣 Soppa',
        '🥘 Grytor',
      ],
      en: [
        '🍕 Pizza',
        '🌮 Tacos',
        '🍣 Sushi',
        '🍝 Pasta',
        '🐟 Fish',
        '🍔 Burgers',
        '🥙 Kebab',
        '🍛 Asian',
        '🍲 Comfort food',
        '🥗 Something light!',
        '🥣 Soup',
        '🥘 Stews',
      ],
    },
    optionSettings: {
      0: {
        subWheel: {
          id: 'eat-pizza',
          title: { sv: 'Vilken pizza?', en: 'Which pizza?' },
          options: {
            sv: ['Varma mackor är pizza!', 'Kvarterspizza – vem pallar laga mat!', 'Tortilla, ketchup & skinka!'],
            en: ['Hot sandwiches are pizza!', 'Neighborhood pizza – who can be bothered to cook!', 'Tortilla, ketchup & ham!'],
          },
        },
      },
      3: {
        subWheel: {
          id: 'eat-pasta',
          title: { sv: 'Vilken pasta?', en: 'Which pasta?' },
          options: {
            sv: ['Carbonara', 'Bolognese', 'Pesto', 'Lasagne', 'Krämig pasta', 'Testa något nytt'],
            en: ['Carbonara', 'Bolognese', 'Pesto', 'Lasagna', 'Creamy pasta', 'Try something new'],
          },
        },
      },
      4: {
        subWheel: {
          id: 'eat-fish',
          title: { sv: 'Vilken fiskrätt?', en: 'Which fish dish?' },
          options: {
            sv: ['Lax', 'Vit fisk', 'Fiskpinnar / Fiskbullar', 'Fiskburgare', 'Fisksoppa'],
            en: ['Salmon', 'White fish', 'Fish fingers / Fish balls', 'Fish burger', 'Fish soup'],
          },
          optionSettings: {
            0: { percentage: '25' },
            1: { percentage: '25' },
            2: { percentage: '20' },
            3: { percentage: '10' },
            4: { percentage: '20' },
          },
        },
      },
      5: {
        subWheel: {
          id: 'eat-burgers',
          title: { sv: 'Vilken hamburgare?', en: 'Which burger?' },
          options: {
            sv: ['Hemmagjorda', 'Finburgare', 'Snabbkäk'],
            en: ['Homemade', 'Gourmet burgers', 'Fast food'],
          },
          optionSettings: {
            2: {
              subWheel: {
                id: 'eat-burgers-fast-food',
                title: { sv: 'Vilket snabbkäk?', en: 'Which fast food?' },
                options: {
                  sv: ['Donken', 'Skurhink', 'Burger King'],
                  en: ["McDonald's", 'Chooses freely', 'Burger King'],
                },
              },
            },
          },
        },
      },
      7: {
        subWheel: {
          id: 'eat-asian',
          title: { sv: 'Vilket asiatiskt?', en: 'Which Asian food?' },
          options: {
            sv: ['Thai', 'Indiskt', 'Kinesiskt', 'Vietnamesiskt'],
            en: ['Thai', 'Indian', 'Chinese', 'Vietnamese'],
          },
        },
      },
      8: {
        subWheel: {
          id: 'eat-comfort-food',
          title: { sv: 'Vilken husmanskost?', en: 'Which comfort food?' },
          options: {
            sv: ['Raggmunk', 'Stekt falukorv', 'Ärtsoppa & pannkakor', 'Köttbullar med mos', 'Korvstroganoff', 'Pytt i panna', 'Hushållets favorit'],
            en: ['Swedish potato pancakes', 'Fried Swedish sausage', 'Pea soup & pancakes', 'Meatballs with mashed potatoes', 'Sausage stroganoff', 'Swedish hash', 'Household favorite'],
          },
        },
      },
      9: {
        subWheel: {
          id: 'eat-light',
          title: { sv: 'Vad blir det för något lätt?', en: 'What light meal should we have?' },
          options: {
            sv: ['Färdigt i kylen?', 'Färdigt i frysen?', 'Färdigt i skafferiet?', 'Bröd är middag, eller?', 'Girl dinner (plockmat)'],
            en: ['Ready in the fridge?', 'Ready in the freezer?', 'Ready in the pantry?', 'Bread counts as dinner, right?', 'Girl dinner (snack plate)'],
          },
        },
      },
      10: {
        subWheel: {
          id: 'eat-soup',
          title: { sv: 'Vilken soppa?', en: 'Which soup?' },
          options: {
            sv: ['Ärtsoppa', 'Morotssoppa', 'Tomatsoppa med bacon', 'Fisksoppa med lax & torsk', 'Nötfärssoppa', 'Gulasch', 'Potatis- och baconsoppa'],
            en: ['Pea soup', 'Carrot soup', 'Tomato soup with bacon', 'Fish soup with salmon & cod', 'Ground beef soup', 'Goulash', 'Potato and bacon soup'],
          },
        },
      },
      11: {
        subWheel: {
          id: 'eat-stews',
          title: { sv: 'Vilken gryta?', en: 'Which stew?' },
          options: {
            sv: ['Chorizo- och paprikagryta', 'Kikärtsgryta', 'Kycklinggryta', 'Chili con carne', 'Linser & kokosmjölk', 'Halloumi- och majsgryta', 'Tacogryta', 'Hushållets hemliga recept'],
            en: ['Chorizo and pepper stew', 'Chickpea stew', 'Chicken stew', 'Chili con carne', 'Lentils & coconut milk', 'Halloumi and corn stew', 'Taco stew', "The household's secret recipe"],
          },
          optionSettings: {
            2: {
              subWheel: {
                id: 'eat-stews-chicken',
                title: { sv: 'Vilken kycklinggryta?', en: 'Which chicken stew?' },
                options: {
                  sv: ['Curry', 'Paprika & grädde', 'Tomat & örter', 'Kokos & lime'],
                  en: ['Curry', 'Bell pepper & cream', 'Tomato & herbs', 'Coconut & lime'],
                },
              },
            },
          },
        },
      },
    },
  },
  {
    id: 'do', emoji: '🎈',
    name: { sv: 'Vad ska vi göra?', en: 'What should we do?' },
    options: {
      sv: [
        '🚶 Ta en promenad',
        '🎲 Spelkväll',
        '☕ Besök ett café',
        '🏊 Bada',
        '✨ Prova något nytt',
        '🎬 Film / bio',
        '🚗 Åk någonstans',
        '🏠 Gör något hemma',
        '🎯 Aktivitet',
        '🍻 Ut på stan',
      ],
      en: [
        '🚶 Take a walk',
        '🎲 Game night',
        '☕ Visit a café',
        '🏊 Go swimming',
        '✨ Try something new',
        '🎬 Movie / cinema',
        '🚗 Go somewhere',
        '🏠 Do something at home',
        '🎯 Activity',
        '🍻 Night on the town',
      ],
    },
    optionSettings: {
      0: {
        subWheel: {
          id: 'do-walk',
          title: { sv: 'Vart går vi?', en: 'Where should we walk?' },
          options: {
            sv: ['Bara gå!', 'Naturreservat', 'Stadspromenad', 'Promenad + fika', 'Gå någonstans du aldrig varit'],
            en: ['Just walk!', 'Nature reserve', 'Walk around town', 'Walk + coffee', "Go somewhere you've never been"],
          },
        },
      },
      1: {
        subWheel: {
          id: 'do-game-night',
          title: { sv: 'Vad spelar vi?', en: 'What should we play?' },
          options: {
            sv: ['Brädspel', 'Kortspel', 'TV-/konsolspel', 'Quiz', 'Något vi inte spelat på länge'],
            en: ['Board game', 'Card game', 'TV/console game', 'Quiz', "Something we haven't played in ages"],
          },
        },
      },
      2: {
        subWheel: {
          id: 'do-cafe',
          title: { sv: 'Vad blir det för café?', en: "What's the café plan?" },
          options: {
            sv: ['Favoritstället', 'Testa ett nytt', 'Café + promenad', 'Bakelse måste ingå!'],
            en: ['Our favorite place', 'Try a new one', 'Café + walk', 'Pastry is mandatory!'],
          },
        },
      },
      3: {
        subWheel: {
          id: 'do-swim',
          title: { sv: 'Var badar vi?', en: 'Where should we swim?' },
          options: {
            sv: ['Simhall', 'Sjö/hav', 'Spa!'],
            en: ['Indoor pool', 'Lake/sea', 'Spa!'],
          },
          optionSettings: {
            1: {
              winnerNote: {
                sv: 'Bara om vädret är rimligt 😄',
                en: 'Only if the weather is reasonable 😄',
              },
            },
          },
        },
      },
      4: {
        subWheel: {
          id: 'do-something-new',
          title: { sv: 'Vad testar vi?', en: 'What should we try?' },
          options: {
            sv: ['Ny restaurang', 'Ny aktivitet', 'Ny plats', 'Något vi sagt ”någon gång” om'],
            en: ['New restaurant', 'New activity', 'New place', 'Something we keep saying we’ll do “someday”'],
          },
        },
      },
      5: {
        subWheel: {
          id: 'do-movie',
          title: { sv: 'Vad ska vi se?', en: 'What should we watch?' },
          options: {
            sv: ['Netflix and chill?', 'Bio!'],
            en: ['Netflix and chill?', 'Cinema!'],
          },
          optionSettings: {
            0: {
              subWheel: {
                id: 'do-movie-at-home',
                title: { sv: 'Vad blir det?', en: 'What are we watching?' },
                options: {
                  sv: ['Något vi aldrig skulle valt själva', 'En gammal favorit', '3:e rekommendationen på rad 4!', 'Komedi!', 'Sci-Fi', 'Surprise me!'],
                  en: ["Something we'd never choose ourselves", 'An old favorite', 'The 3rd pick in row 4!', 'Comedy!', 'Sci-Fi', 'Surprise me!'],
                },
                optionSettings: {
                  5: {
                    winnerNotePool: [
                      'The Shawshank Redemption',
                      'The Godfather',
                      'The Dark Knight',
                      'The Godfather Part II',
                      'The Lord of the Rings: The Return of the King',
                      '12 Angry Men',
                      "Schindler's List",
                      'The Lord of the Rings: The Fellowship of the Ring',
                      'Pulp Fiction',
                      'The Good, the Bad and the Ugly',
                      'The Lord of the Rings: The Two Towers',
                      'Forrest Gump',
                      'Fight Club',
                      'Inception',
                      'Star Wars: Episode V - The Empire Strikes Back',
                      'The Matrix',
                      'Interstellar',
                      'GoodFellas',
                      "One Flew Over the Cuckoo's Nest",
                      'Seven',
                      "It's a Wonderful Life",
                      'The Silence of the Lambs',
                      'Saving Private Ryan',
                      'Seven Samurai',
                      'The Green Mile',
                      'City of God',
                      'Life Is Beautiful',
                      'Terminator 2: Judgment Day',
                      'Back to the Future',
                      'Star Wars: Episode IV - A New Hope',
                      'Kill Bill: The Whole Bloody Affair',
                      'Spirited Away',
                      'Gladiator',
                      'The Pianist',
                      'Parasite',
                      'Grave of the Fireflies',
                      'Harakiri',
                      'Psycho',
                      'The Lion King',
                      'The Departed',
                      'Whiplash',
                      'The Prestige',
                      'American History X',
                      'Spider-Man: Across the Spider-Verse',
                      'Léon: The Professional',
                      'Cinema Paradiso',
                      'Casablanca',
                      'The Intouchables',
                      'The Usual Suspects',
                      'Django Unchained',
                    ],
                  },
                },
              },
            },
          },
        },
      },
      6: {
        subWheel: {
          id: 'do-go-somewhere',
          title: { sv: 'Vart åker vi?', en: 'Where are we going?' },
          options: {
            sv: ['Ta bilen och välj en riktning', 'Far till grannbyn!', 'Hitta ett utsiktsställe', 'Mini-roadtrip'],
            en: ['Pick a direction and drive', 'Off to the next town!', 'Find a scenic viewpoint', 'Mini road trip'],
          },
          optionSettings: {
            0: {
              subWheel: {
                id: 'do-go-somewhere-direction',
                title: { sv: 'Vilken riktning?', en: 'Which direction?' },
                options: {
                  sv: ['Norr', 'Söder', 'Väst', 'Öst'],
                  en: ['North', 'South', 'West', 'East'],
                },
              },
            },
            3: {
              subWheel: {
                id: 'do-go-somewhere-roadtrip',
                title: { sv: 'Hur lång?', en: 'How long?' },
                options: {
                  sv: ['30 min', '1 timme', '2 timmar', '3 timmar'],
                  en: ['30 min', '1 hour', '2 hours', '3 hours'],
                },
                optionSettings: {
                  0: { percentage: '40' },
                  1: { percentage: '40' },
                  2: { percentage: '15' },
                  3: { percentage: '5' },
                },
              },
            },
          },
        },
      },
      7: {
        subWheel: {
          id: 'do-at-home',
          title: { sv: 'Vad gör vi hemma?', en: 'What should we do at home?' },
          options: {
            sv: ['Temakväll hemma', 'Baka något helt onödigt', 'Pussel / Lego', 'Myskväll deluxe'],
            en: ['Theme night at home', 'Bake something completely unnecessary', 'Puzzle / Lego', 'Deluxe cozy night'],
          },
          optionSettings: {
            0: {
              subWheel: {
                id: 'do-at-home-theme',
                title: { sv: 'Vilket tema?', en: 'Which theme?' },
                options: {
                  sv: ['Filmtema', 'Speltema', 'Mat från ett land', 'Nostalgikväll'],
                  en: ['Movie theme', 'Game theme', 'Food from another country', 'Nostalgia night'],
                },
              },
            },
          },
        },
      },
      8: {
        subWheel: {
          id: 'do-activity',
          title: { sv: 'Vilken aktivitet?', en: 'Which activity?' },
          options: {
            sv: ['Escape room', 'Bowling', 'Dart', 'Biljard', 'Minigolf', 'Shuffleboard', 'Klättring / bouldering'],
            en: ['Escape room', 'Bowling', 'Darts', 'Pool', 'Mini golf', 'Shuffleboard', 'Climbing / bouldering'],
          },
          optionSettings: {
            6: {
              winnerNote: {
                sv: 'Eller gå till ett utsiktsställe',
                en: 'Or go to a scenic viewpoint',
              },
            },
          },
        },
      },
      9: {
        subWheel: {
          id: 'do-night-out',
          title: { sv: 'Vad gör vi på stan?', en: 'What should we do in town?' },
          options: {
            sv: ['Gå runt som ett mähä!', 'Kulturellt ska det vara!', 'Ta ett glas någonstans', 'Testa ett nytt ställe'],
            en: ['Wander around like a lovable fool!', "Let's get cultural!", 'Grab a drink somewhere', 'Try a new place'],
          },
          optionSettings: {
            1: {
              subWheel: {
                id: 'do-night-out-culture',
                title: { sv: 'Vilken kulturpoäng?', en: 'What kind of culture?' },
                options: {
                  sv: ['Museum', 'Teater', 'Konsert / live-musik', 'Galleri / utställning'],
                  en: ['Museum', 'Theater', 'Concert / live music', 'Gallery / exhibition'],
                },
              },
            },
          },
        },
      },
    },
  },
  {
    id: 'clean', emoji: '🧹',
    name: { sv: 'Vad ska vi städa först?', en: 'What should we clean first?' },
    options: {
      sv: ['Köket', 'Badrummet', 'Vardagsrummet', 'Tvätten', 'Sovrummet', 'Skrivbordet'],
      en: ['Kitchen', 'Bathroom', 'Living room', 'Laundry', 'Bedroom', 'Desk'],
    },
  },
  {
    id: 'movie', emoji: '🎬',
    name: { sv: 'Filmkväll', en: 'Movie night' },
    options: {
      sv: ['Komedi', 'Thriller', 'Sci-fi', 'Animation', 'Drama', 'Dokumentär'],
      en: ['Comedy', 'Thriller', 'Sci-fi', 'Animation', 'Drama', 'Documentary'],
    },
  },
  {
    id: 'luxury', emoji: '✨',
    name: { sv: 'Vardagslyx', en: 'Everyday luxury' },
    options: {
      sv: ['Lyxkaffe', 'Färska blommor', 'Långfrukost', 'Ansiktsmask', 'Favoritefterrätt', 'En ny bok'],
      en: ['Fancy coffee', 'Fresh flowers', 'Long breakfast', 'Face mask', 'Favorite dessert', 'A new book'],
    },
  },
]

export function createTranslator(locale) {
  return (path, replacements = {}) => {
    const value = path.split('.').reduce((current, key) => current?.[key], translations[locale])
    if (typeof value !== 'string') return path
    return value.replace(/{{(\w+)}}/g, (_, key) => replacements[key] ?? '')
  }
}
