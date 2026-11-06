/** Original decorative demo content — not Spotify catalog data. */
export interface DemoAlbum { id: string; title: string; subtitle: string; cover: string; accent: string; badge?: string }
export const demoAlbums: DemoAlbum[] = [
  { id: 'orbit', title: 'Pink Orbit', subtitle: 'A little cosmic escape', cover: '/covers/orbit.svg', accent: '#ec84d8', badge: 'dream pop' },
  { id: 'velvet', title: 'Velvet Hours', subtitle: 'For the after hours', cover: '/covers/velvet.svg', accent: '#8b70eb', badge: 'late night' },
  { id: 'starlight', title: 'Starlight Motel', subtitle: 'Somewhere past midnight', cover: '/covers/starlight.svg', accent: '#7385e9', badge: 'indie' },
  { id: 'sugar', title: 'Sugarcloud', subtitle: 'Sweet things only', cover: '/covers/sugar.svg', accent: '#ffa4c4', badge: 'feel good' },
  { id: 'lunar', title: 'Lunar Garden', subtitle: 'Breathe in the quiet', cover: '/covers/lunar.svg', accent: '#9a91ff', badge: 'focus' },
  { id: 'glow', title: 'Afterglow Radio', subtitle: 'Drive into the sunset', cover: '/covers/glow.svg', accent: '#eb80c5', badge: 'electronic' },
];
export interface DemoSong { id: string; name: string; artist: string; album: string; cover: string; duration: number; color: string }
export const demoSongs: DemoSong[] = [
  { id: 'a', name: 'Floating Somewhere', artist: 'The Lunar Kids', album: 'Pink Orbit', cover: '/covers/orbit.svg', duration: 224000, color: '#ec84d8' },
  { id: 'b', name: 'Half Past Forever', artist: 'Violet Avenue', album: 'Velvet Hours', cover: '/covers/velvet.svg', duration: 196000, color: '#8b70eb' },
  { id: 'c', name: 'Stardust on the Floor', artist: 'Night Arcade', album: 'Starlight Motel', cover: '/covers/starlight.svg', duration: 242000, color: '#7385e9' },
  { id: 'd', name: 'Candy-Coloured Skies', artist: 'Sunday Static', album: 'Sugarcloud', cover: '/covers/sugar.svg', duration: 187000, color: '#ffa4c4' },
  { id: 'e', name: 'Slow Motion Flowers', artist: 'Polaris Bloom', album: 'Lunar Garden', cover: '/covers/lunar.svg', duration: 251000, color: '#9a91ff' },
];
