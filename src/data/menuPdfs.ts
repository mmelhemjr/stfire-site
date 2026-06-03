import type { LucideIcon } from 'lucide-react';
import { Sun, UtensilsCrossed, Wine, Pizza, Fish } from 'lucide-react';

export interface MenuPdf {
  id: string;
  /** Path under public/menus/ (served as /menus/...) */
  file: string;
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
}

/** Add PDF files to public/menus/ matching the `file` names below. */
export const menuPdfs: MenuPdf[] = [
  {
    id: 'breakfast-snack',
    file: 'breakfast-and-snack.pdf',
    titleKey: 'menu.pdfs.breakfast_snack.title',
    descriptionKey: 'menu.pdfs.breakfast_snack.description',
    icon: Sun,
  },
  {
    id: 'restaurant',
    file: 'restaurant.pdf',
    titleKey: 'menu.pdfs.restaurant.title',
    descriptionKey: 'menu.pdfs.restaurant.description',
    icon: UtensilsCrossed,
  },
  {
    id: 'wine-spirits-cocktails',
    file: 'wine-list-spirts-cocktails.pdf',
    titleKey: 'menu.pdfs.wine_spirits_cocktails.title',
    descriptionKey: 'menu.pdfs.wine_spirits_cocktails.description',
    icon: Wine,
  },
  {
    id: 'italian-night',
    file: 'italian-night.pdf',
    titleKey: 'menu.pdfs.italian_night.title',
    descriptionKey: 'menu.pdfs.italian_night.description',
    icon: Pizza,
  },
  {
    id: 'sushi-night',
    file: 'sushi-night.pdf',
    titleKey: 'menu.pdfs.sushi_night.title',
    descriptionKey: 'menu.pdfs.sushi_night.description',
    icon: Fish,
  },
];

export function getMenuPdfUrl(file: string): string {
  return `/menus/${file}`;
}
