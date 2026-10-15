/** Bandera como emoji a partir del código ISO de 2 letras (sin imágenes externas). */
export function flagEmoji(iso: string | null | undefined): string {
  if (!iso || !/^[A-Za-z]{2}$/.test(iso)) return ''
  return String.fromCodePoint(
    ...iso
      .toUpperCase()
      .split('')
      .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  )
}
