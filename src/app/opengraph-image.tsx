import { HOME_POSTER, OG_SIZE, poster } from './_og/poster';

export const alt = 'Artistant — Get paid. Not ghosted. The safe way to book live artists in India.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return poster(HOME_POSTER);
}
