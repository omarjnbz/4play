// Single source of truth for all site copy and media.
// Media provenance: every photo, cover and logo below is the artist's own,
// taken from the original 4PLAY artist profile (4playartistprofile.odoo.com),
// Audiomack and YouTube. Thumbnails are YouTube's own frames for his uploads.

export const artist = {
  name: "Nikunj Sharma",
  alias: "4PLAY",
  role: "DJ · Producer",
  city: "New Delhi, India",
  email: "4playinthehouse@gmail.com",
  whatsapp: "+91 96544 84129",
  whatsappHref: "https://wa.me/919654484129",
  epk: "https://drive.google.com/drive/folders/19nQYRBI0r9xQp6zBgKXTryAUuRSTXi8Z?usp=sharing",
  latestSet: "https://youtu.be/W-ZTcS_Fybk",
};

export const socials = [
  { label: "Instagram", href: "https://www.instagram.com/ar.nikunj_4play/", icon: "simple-icons:instagram" },
  { label: "SoundCloud", href: "https://soundcloud.com/nikunj-sharma-21946760", icon: "simple-icons:soundcloud" },
  { label: "YouTube", href: "https://www.youtube.com/channel/UCOKtgOsxMCBn6bMHFzVTFXQ", icon: "simple-icons:youtube" },
  { label: "Mixcloud", href: "https://www.mixcloud.com/4playinthehouse/", icon: "simple-icons:mixcloud" },
  { label: "Audiomack", href: "https://audiomack.com/4playinthehouse", icon: "simple-icons:audiomack" },
] as const;

export const nav = [
  { n: "I", label: "Home", href: "#top", note: "Third eye open", image: "/media/booth.jpg" },
  { n: "II", label: "Sound", href: "#sound", note: "Six moods, one journey", image: "/media/green.webp" },
  { n: "III", label: "Sets", href: "#sets", note: "Latest mixes & live sets", image: "/media/red.webp" },
  { n: "IV", label: "Venues", href: "#venues", note: "Delhi to the Himalayas", image: "/media/sunset.webp" },
  { n: "V", label: "Booking", href: "#booking", note: "EPK, rider, contact", image: "/media/violet.webp" },
] as const;

export const venues = [
  { name: "Kitty Su", city: "New Delhi" },
  { name: "Habibi", city: "New Delhi" },
  { name: "SoHo", city: "New Delhi" },
  { name: "Dorsia", city: "New Delhi" },
  { name: "Klub Hermis", city: "Gurugram" },
  { name: "Casa Danza", city: "Gurugram" },
  { name: "EDM Hostel", city: "Dharamkot" },
  { name: "Utopia", city: "Dharamkot" },
  { name: "Morgan's", city: "Dharamkot" },
  { name: "Hide Out", city: "Dharamkot" },
  { name: "Buen", city: "New Delhi" },
  { name: "Brown Cortile", city: "New Delhi" },
  { name: "Silly", city: "New Delhi" },
  { name: "Belisario", city: "New Delhi" },
  { name: "Zylo", city: "New Delhi" },
] as const;

export type Mix = {
  slug: string;
  title: string;
  tag: string;
  length: string;
  cover: string;
  embed: string;
  href: string;
};

export const mixes: Mix[] = [
  {
    slug: "psy-hypnotic-2",
    title: "Psy Hypnotic Vol. 2",
    tag: "Psytech · Hypnotic",
    length: "1:52:02",
    cover: "/media/covers/psy-hypnotic-2.webp",
    embed: "https://audiomack.com/embed/4playinthehouse/song/psy-hypnotic-set-vol-2",
    href: "https://audiomack.com/4playinthehouse/song/psy-hypnotic-set-vol-2",
  },
  {
    slug: "high-energy-mayhem",
    title: "High Energy Mayhem",
    tag: "Minimal · Psytech · Hard Groove · Bounce",
    length: "1:24:43",
    cover: "/media/covers/high-energy-mayhem.webp",
    embed: "https://audiomack.com/embed/4playinthehouse/song/high-energy-mayhem",
    href: "https://audiomack.com/4playinthehouse/song/high-energy-mayhem",
  },
  {
    slug: "psy-hypnotic-1",
    title: "Psy Hypnotic Vol. 1",
    tag: "Psytech · Hypnotic",
    length: "1:26:33",
    cover: "/media/covers/psy-hypnotic-1.webp",
    embed: "https://audiomack.com/embed/4playinthehouse/song/psy-hypnotic-vol1",
    href: "https://audiomack.com/4playinthehouse/song/psy-hypnotic-vol1",
  },
  {
    slug: "hard-groove-bedroom-1",
    title: "Hard Groove Bedroom Session #1",
    tag: "Hard Groove",
    length: "1:11:05",
    cover: "/media/covers/hard-groove-bedroom-1.webp",
    embed: "https://audiomack.com/embed/4playinthehouse/song/hard-groove-bedroom-session-1",
    href: "https://audiomack.com/4playinthehouse/song/hard-groove-bedroom-session-1",
  },
  {
    slug: "hypnotic-groove-1",
    title: "Hypnotic Groove Vol. 1",
    tag: "Hard Groove · Hypnotic",
    length: "1:01:21",
    cover: "/media/covers/hypnotic-groove-1.webp",
    embed: "https://audiomack.com/embed/4playinthehouse/song/hard-groove-hypnotic-1",
    href: "https://audiomack.com/4playinthehouse/song/hard-groove-hypnotic-1",
  },
];

export const soundcloudSet = {
  title: "NDCR Submission — Bass, Dub & Breaks",
  href: "https://soundcloud.com/nikunj-sharma-21946760/new-delhi-community-radio-set",
};

export type Video = { id: string; title: string; place: string };

// Titles are the real YouTube titles (via oEmbed), trimmed of hashtags.
export const videos: Video[] = [
  { id: "W-ZTcS_Fybk", title: "3 Hours of Hypnotic Techno Journey", place: "Peak-time afterparty" },
  { id: "9cC_tpEmfLU", title: "Hypnotic Groove Techno", place: "Hide Out Stays, Dharamkot" },
  { id: "-g86YqELU9U", title: "Rominimal in the Mountains", place: "Utopia, Dharamkot" },
  { id: "v06Rsn-BG-w", title: "Psytrance Journey", place: "Morgan's, Dharamkot" },
  { id: "vS_iUDPzfsQ", title: "Psytrance Mix 2026", place: "EDM Hostel, Dharamkot" },
  { id: "L4EVeP8at2c", title: "Total Hypnosis", place: "Hypnotic techno journey" },
  { id: "8MFOFW5Sf58", title: "Rominimal & Microhouse Masterclass", place: "Live set" },
  { id: "RjwaNXatKhM", title: "Psytech Hypnotic Mixtape Vol. 3", place: "Mixtape" },
  { id: "UpW3xsTE_90", title: "Minimal × Peak-Time Techno", place: "Instagram Live session" },
];

// The light desk: each channel is one mood of the 4PLAY sound, lit with the
// actual stage colour of a photo from his sets.
export const channels = [
  {
    id: "hypnotic",
    label: "Hypnotic",
    short: "HYP",
    line: "Short loops that keep shifting, pulling you deeper.",
    light: "#3d6bff",
    image: "/media/blue.webp",
    bpm: 128,
  },
  {
    id: "groove",
    label: "Groove",
    short: "GRV",
    line: "Rolling bass, subtle funk, intricate percussion.",
    light: "#2bd46a",
    image: "/media/green.webp",
    bpm: 126,
  },
  {
    id: "house",
    label: "House",
    short: "HSE",
    line: "Warm and soulful when the room asks for it.",
    light: "#f2a541",
    image: "/media/amber.png",
    bpm: 124,
  },
  {
    id: "psychedelic",
    label: "Psychedelic",
    short: "PSY",
    line: "Surreal textures and evolving atmospheres.",
    light: "#a35bff",
    image: "/media/violet.webp",
    bpm: 134,
  },
  {
    id: "energy",
    label: "High Energy",
    short: "NRG",
    line: "Driving rhythm, heavy bass, tension and release.",
    light: "#ff3b2f",
    image: "/media/red.webp",
    bpm: 140,
  },
  {
    id: "vibe",
    label: "The Vibe",
    short: "VIBE",
    line: "No fixed formula. The room decides.",
    light: "#ffb36b",
    image: "/media/sunset.webp",
    bpm: 122,
  },
] as const;
