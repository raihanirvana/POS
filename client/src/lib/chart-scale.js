// Batas atas sumbu dibulatkan ke angka "bersih" (1, 2, 5 × 10^n) agar tick mudah dibaca.
export function niceMax(value) {
  if (value <= 0) {
    return 100000;
  }
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((multiple) => multiple * power >= value);
  return step * power;
}

export function axisTicks(max) {
  return [max, max / 2, 0];
}
