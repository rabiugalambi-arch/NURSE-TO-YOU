export interface KanoArea {
  id: string;
  name: string;
  isMetropolitan: boolean;
  lat: number;
  lng: number;
  popularAreas?: string[];
}

export const KANO_METROPOLITAN_AREAS: KanoArea[] = [
  { id: 'tarauni', name: 'Tarauni', isMetropolitan: true, lat: 11.9750, lng: 8.5600, popularAreas: ['Zoo Road', 'Gyadi-Gyadi', 'Maiduguri Road', 'Unguwa Uku', 'Darmanawa'] },
  { id: 'nassarawa', name: 'Nassarawa', isMetropolitan: true, lat: 11.9950, lng: 8.5400, popularAreas: ['Bompai', 'Brigade', 'Hotoro', 'Giginyu', 'Badawa', 'Kaura Goje'] },
  { id: 'kano_municipal', name: 'Kano Municipal', isMetropolitan: true, lat: 11.9900, lng: 8.5200, popularAreas: ['Kofar Kudu', 'Kofar Nassarawa', 'Kurmi Market', 'Mandawari', 'Shahuchi', 'Gandun Albasa'] },
  { id: 'fagge', name: 'Fagge', isMetropolitan: true, lat: 12.0100, lng: 8.5300, popularAreas: ['Fagge Ta Gabas', 'Sabon Gari', 'Wapa', 'Kwachiri', 'Yandutse', 'Jaba'] },
  { id: 'dala', name: 'Dala', isMetropolitan: true, lat: 12.0150, lng: 8.5000, popularAreas: ['Gwammaja', 'Dala Hill', 'Yalwa', 'Kabuwaya', 'Bakin Ruwa'] },
  { id: 'gwale', name: 'Gwale', isMetropolitan: true, lat: 11.9800, lng: 8.5050, popularAreas: ['Dorayi', 'Goron Dutse', 'Diso', 'Kabuga', 'Gidan Rumfa'] },
  { id: 'ungogo', name: 'Ungogo', isMetropolitan: true, lat: 12.0800, lng: 8.4800, popularAreas: ['Panisau', 'Rangaza', 'Rijiyar Zaki', 'Zango', 'Kadawa'] },
  { id: 'kumbotso', name: 'Kumbotso', isMetropolitan: true, lat: 11.8900, lng: 8.5000, popularAreas: ['Mariri', 'Panshekara', 'Challawa', 'Kumbotso Town', 'Danbare'] },
];

export const OTHER_KANO_LGAS: KanoArea[] = [
  { id: 'dawakin_kudu', name: 'Dawakin Kudu', isMetropolitan: false, lat: 11.8300, lng: 8.5900 },
  { id: 'dawakin_tofa', name: 'Dawakin Tofa', isMetropolitan: false, lat: 12.1100, lng: 8.3300 },
  { id: 'gezawa', name: 'Gezawa', isMetropolitan: false, lat: 12.0100, lng: 8.7500 },
  { id: 'bichi', name: 'Bichi', isMetropolitan: false, lat: 12.2300, lng: 8.2400 },
  { id: 'wudil', name: 'Wudil', isMetropolitan: false, lat: 11.7900, lng: 8.8400 },
  { id: 'rano', name: 'Rano', isMetropolitan: false, lat: 11.5500, lng: 8.5800 },
  { id: 'gwarzo', name: 'Gwarzo', isMetropolitan: false, lat: 11.9100, lng: 7.9300 },
  { id: 'madobi', name: 'Madobi', isMetropolitan: false, lat: 11.7800, lng: 8.2800 },
  { id: 'kura', name: 'Kura', isMetropolitan: false, lat: 11.7700, lng: 8.4200 },
  { id: 'danbatta', name: 'Danbatta', isMetropolitan: false, lat: 12.4300, lng: 8.5100 },
  { id: 'bagwai', name: 'Bagwai', isMetropolitan: false, lat: 12.1500, lng: 8.1300 },
  { id: 'shanono', name: 'Shanono', isMetropolitan: false, lat: 12.0500, lng: 7.9900 },
  { id: 'tsanyawa', name: 'Tsanyawa', isMetropolitan: false, lat: 12.2800, lng: 7.9900 },
  { id: 'minjibir', name: 'Minjibir', isMetropolitan: false, lat: 12.1700, lng: 8.6500 },
  { id: 'gabasawa', name: 'Gabasawa', isMetropolitan: false, lat: 12.2100, lng: 8.8900 },
  { id: 'warawa', name: 'Warawa', isMetropolitan: false, lat: 11.8800, lng: 8.6800 },
  { id: 'gaya', name: 'Gaya', isMetropolitan: false, lat: 11.8600, lng: 9.0000 },
  { id: 'albasu', name: 'Albasu', isMetropolitan: false, lat: 11.6700, lng: 9.1300 },
  { id: 'ajingi', name: 'Ajingi', isMetropolitan: false, lat: 11.9600, lng: 8.9700 },
  { id: 'kibiya', name: 'Kibiya', isMetropolitan: false, lat: 11.5300, lng: 8.6600 },
  { id: 'rogo', name: 'Rogo', isMetropolitan: false, lat: 11.5700, lng: 7.8300 },
  { id: 'karaye', name: 'Karaye', isMetropolitan: false, lat: 11.7400, lng: 8.0100 },
  { id: 'kiru', name: 'Kiru', isMetropolitan: false, lat: 11.7000, lng: 8.1300 },
  { id: 'bebeji', name: 'Bebeji', isMetropolitan: false, lat: 11.5800, lng: 8.4000 },
  { id: 'tudun_wada', name: 'Tudun Wada', isMetropolitan: false, lat: 11.2500, lng: 8.3900 },
  { id: 'doguwa', name: 'Doguwa', isMetropolitan: false, lat: 10.7500, lng: 8.7000 },
  { id: 'sumaila', name: 'Sumaila', isMetropolitan: false, lat: 11.5300, lng: 8.9700 },
  { id: 'takai', name: 'Takai', isMetropolitan: false, lat: 11.5800, lng: 9.1200 },
  { id: 'bunkure', name: 'Bunkure', isMetropolitan: false, lat: 11.6900, lng: 8.5300 },
  { id: 'garun_mallam', name: 'Garun Mallam', isMetropolitan: false, lat: 11.6900, lng: 8.3700 },
  { id: 'garko', name: 'Garko', isMetropolitan: false, lat: 11.6500, lng: 8.8000 },
];

export const ALL_KANO_AREAS: KanoArea[] = [
  ...KANO_METROPOLITAN_AREAS,
  ...OTHER_KANO_LGAS,
];

export const DEFAULT_KANO_CENTER = {
  lat: 11.9964,
  lng: 8.5167,
  name: 'Kano City Center'
};
