import re

with open('src/contexts/LanguageContext.tsx', 'r') as f:
    content = f.read()

new_translations = """  'Pending': 'Ana jira',
  'Menstrual & Fertility Tracker': 'Bibiyar Al\\'ada da Lokacin Haihuwa',
  'Track your cycle and view estimated fertile days.': 'Bibi al\\'adarki kuma duba kwanakin samun juna biyu na kiyasi.',
  'Open Tracker': 'Bude Mai Bibiya',
  'Estimated fertile window': 'Kiyasin lokacin samun juna biyu',
  'Estimated ovulation': 'Kiyasin kwayar halittar mace',
  'Expected period': 'Al\\'adar da ake tsammani',
  'Lower estimated fertility days': 'Kwanakin da kiyasin samun juna biyu ke kasa',
  'Cycle and fertility dates shown here are estimates. Menstrual cycles and ovulation can vary. These predictions should not be used as a guarantee of preventing pregnancy.': 'Kwanakin al\\'ada da samun juna biyu da aka nuna a nan kiyasi ne. Al\\'ada da tsarin kwayar halitta na iya canzawa. Kada a yi amfani da wadannan kiyasi a matsayin tabbacin hana daukar ciki.',
  'If you need contraception or have concerns about your menstrual cycle, speak with a qualified healthcare professional.': 'Idan kina bukatar tsarin iyali ko kina da damuwa game da al\\'adarki, yi magana da kwararren ma\\'aikacin lafiya.',
  'Your cycle appears variable, so fertility estimates may be less reliable.': 'Al\\'adarki na canzawa, don haka kiyasin samun juna biyu na iya zama ba abin dogaro ba sosai.',
  'First day of last menstrual period': 'Ranar farko ta al\\'adarki ta karshe',
  'Average menstrual cycle length (days)': 'Tsawon lokacin al\\'ada (kwanaki)',
  'Average period duration (days)': 'Kwanakin da al\\'ada ke dauka',
  'Log Period': 'Rubuta Al\\'ada',
  'Cycle History': 'Tarihin Al\\'ada',
  'Save': 'Ajiye',
  'Edit': 'Gyara',
  'Delete': 'Goge',
  'Period Started': 'Al\\'ada ta fara',
  'Period Ended': 'Al\\'ada ta kare',
  'Today': 'Yau',
  'Cycle Day': 'Ranar Al\\'ada',
  'Current estimate:': 'Kiyasin yanzu:',
  'Estimated next period:': 'Kiyasin al\\'ada ta gaba:',
  'These dates are estimates. Ovulation can vary from cycle to cycle, so calendar predictions cannot guarantee that a day is safe from pregnancy.': 'Wadannan kwanakin kiyasi ne. Tsarin kwayar halitta na iya canzawa daga wannan al\\'ada zuwa waccan, don haka kiyasin kalanda ba zai iya bada tabbacin cewa babu matsalar daukar ciki a wannan ranar ba.',
  'Cancel': 'Soke',"""

content = content.replace("  'Pending': 'Ana jira'", new_translations)

with open('src/contexts/LanguageContext.tsx', 'w') as f:
    f.write(content)
