/**
 * Texto para guardar en BD: sin tildes, minúsculas, recortado.
 * El usuario puede escribir con mayúsculas y tildes en la UI.
 */
export function normalizeForDb(value) {
  if (value == null) return ''
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * Devuelve el `value` de la opción que coincide con lo guardado en BD (con o sin tildes / mayúsculas).
 * @param {string|null|undefined} raw
 * @param {{ value: string, label: string }[]} options
 */
export function alignValueToOptions(raw, options) {
  if (!options?.length) return ''
  if (raw == null || raw === '') return ''
  const r = String(raw).trim()
  const n = normalizeForDb(r)
  const hit = options.find(
    (o) =>
      o.value === r ||
      o.label === r ||
      normalizeForDb(o.value) === n ||
      normalizeForDb(o.label) === n
  )
  return hit ? hit.value : ''
}
