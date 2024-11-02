export interface Game {
  id: string;
  title: string;
  coverImage: string;
  developer: string;
  releaseDate: string;
  playTime?: string;
  rating?: number;
}

export interface SidebarItem {
  key: string;
  icon: string;
  text: string;
}