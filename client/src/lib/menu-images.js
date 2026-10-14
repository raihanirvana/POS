import americano from '../assets/menu/americano.jpg';
import chocolate from '../assets/menu/chocolate.jpg';
import cinnamon from '../assets/menu/cinnamon.jpg';
import croissant from '../assets/menu/croissant.jpg';
import icedCoffee from '../assets/menu/iced-coffee.jpg';
import latte from '../assets/menu/latte.jpg';
import matcha from '../assets/menu/matcha.jpg';
import tea from '../assets/menu/tea.jpg';

// Foto preset lokal (sumber di assets/menu/SOURCES.md). Kunci sama dengan imageKey API.
const menuImages = {
  'iced-coffee': icedCoffee,
  latte,
  americano,
  matcha,
  chocolate,
  tea,
  croissant,
  cinnamon,
};

export function menuImage(imageKey) {
  return menuImages[imageKey] ?? latte;
}

export function hasMenuImage(imageKey) {
  return typeof imageKey === 'string' && Object.hasOwn(menuImages, imageKey);
}
