export type CsvCell = string | number | boolean | null | undefined

function escapeCsvCell(value: CsvCell) {
  if (value === null || value === undefined) return ''

  const raw = String(value)

  // Escape quotes by doubling them. Wrap in quotes if value contains any special CSV characters.
  const escaped = raw.replace(/"/g, '""')
  if (/[\n\r,\"]/g.test(raw)) return `"${escaped}"`
  return escaped
}

export function toCsv(
  rows: CsvCell[][],
  options: {
    headers?: string[]
    eol?: '\n' | '\r\n'
  } = {}
) {
  const eol = options.eol ?? '\n'
  const headerLine = options.headers ? `${options.headers.map(escapeCsvCell).join(',')}${eol}` : ''
  const body = rows.map((row) => row.map(escapeCsvCell).join(',')).join(eol)
  return `${headerLine}${body}${eol}`
}

export function downloadTextFile(
  filename: string,
  content: string,
  type = 'text/plain;charset=utf-8'
) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()

  URL.revokeObjectURL(url)
}
