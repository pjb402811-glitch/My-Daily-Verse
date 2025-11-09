
export interface BibleVerse {
  book: string;
  chapter: number;
  verse: string;
  text: string;
}

export interface Hymn {
  title: string;
  number?: number;
  youtubeSearchQuery?: string;
}

export interface Recommendation {
  verses: BibleVerse[];
  traditionalHymns: Hymn[];
  ccms: Hymn[];
}

export interface DiaryEntry {
  text: string;
  savedVerse: BibleVerse | null;
  emotions?: string[];
  gratitude?: string;
}

export type DiaryEntries = Record<string, DiaryEntry>;