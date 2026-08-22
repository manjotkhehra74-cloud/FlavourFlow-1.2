/*
 * A very small PDF writer — enough for HRMate's tabular exports. Zero dependencies so the
 * production VM never has to build anything native. Base-14 Helvetica only, WinAnsi text.
 */

const PAGE = { a4Landscape: { width: 842, height: 595 }, a4Portrait: { width: 595, height: 842 } };

/* Approximate Helvetica advance widths (per 1pt of font size). Good enough for truncation. */
const NARROW = new Set([...'iljItf.,:;\'`|!()[]{}/\\ ']);
const WIDE = new Set([...'mwMW@%']);
const charWidth = (character) => (NARROW.has(character) ? 0.29 : WIDE.has(character) ? 0.84 : 0.55);
const textWidth = (text, size) => [...String(text)].reduce((total, character) => total + charWidth(character), 0) * size;

function fit(text, size, maxWidth) {
  const value = String(text ?? '');
  if (textWidth(value, size) <= maxWidth) return value;
  let out = '';
  for (const character of value) {
    if (textWidth(`${out}${character}…`, size) > maxWidth) break;
    out += character;
  }
  return `${out}…`;
}

const escapeText = (text) => String(text ?? '')
  .replace(/[\\()]/g, (c) => `\\${c}`)
  // Drop anything outside WinAnsi so the viewer never sees mojibake.
  .replace(/[^\x20-\x7e\xa0-\xff]/g, '-');

class Content {
  constructor() { this.parts = []; }

  rect(x, y, width, height, [r, g, b]) {
    this.parts.push(`${r} ${g} ${b} rg ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f`);
    return this;
  }

  line(x1, y1, x2, y2, [r, g, b], lineWidth = 0.6) {
    this.parts.push(`${r} ${g} ${b} RG ${lineWidth} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
    return this;
  }

  text(x, y, value, { size = 10, bold = false, colour = [0.1, 0.12, 0.16] } = {}) {
    const [r, g, b] = colour;
    this.parts.push(`BT ${r} ${g} ${b} rg /${bold ? 'FB' : 'FR'} ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${escapeText(value)}) Tj ET`);
    return this;
  }

  toString() { return this.parts.join('\n'); }
}

function assemble(pages, size) {
  const objects = [];
  const push = (body) => { objects.push(body); return objects.length; };

  const fontRegular = push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const fontBold = push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const pagesId = objects.length + 1 + pages.length * 2;

  const pageIds = [];
  for (const content of pages) {
    const stream = content.toString();
    const streamId = push(`<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`);
    pageIds.push(push(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${size.width} ${size.height}] /Resources << /Font << /FR ${fontRegular} 0 R /FB ${fontBold} 0 R >> >> /Contents ${streamId} 0 R >>`));
  }

  push(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`);
  const catalogId = push(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, 'latin1');
}

/**
 * Renders a paginated table PDF with an HRMate-blue banner on the first page.
 *
 * @param {object} options
 * @param {string} options.title
 * @param {string} [options.subtitle]
 * @param {Array<{label: string, value: string}>} [options.stats] Summary chips under the banner.
 * @param {string[]} options.header
 * @param {Array<string[]>} options.rows
 * @param {number[]} [options.widths] Relative column weights.
 * @param {string} [options.footer]
 * @param {boolean} [options.landscape]
 * @returns {Buffer}
 */
export function buildTablePdf({
  title, subtitle = '', stats = [], header, rows, widths, footer = '', landscape = true,
}) {
  const size = landscape ? PAGE.a4Landscape : PAGE.a4Portrait;
  const margin = 34;
  const tableWidth = size.width - margin * 2;
  const weights = widths && widths.length === header.length ? widths : header.map(() => 1);
  const weightTotal = weights.reduce((a, b) => a + b, 0);
  const columns = weights.map((weight) => (weight / weightTotal) * tableWidth);
  const offsets = columns.reduce((acc, width) => [...acc, acc[acc.length - 1] + width], [margin]);

  const blue = [0.118, 0.435, 0.878];
  const grey = [0.42, 0.45, 0.5];
  const line = [0.89, 0.91, 0.94];
  const zebra = [0.968, 0.976, 0.988];
  const rowHeight = 19;

  const pages = [];
  let content = null;
  let y = 0;
  let firstPage = true;

  const startPage = () => {
    content = new Content();
    pages.push(content);
    if (firstPage) {
      content.rect(0, size.height - 96, size.width, 96, blue);
      content.text(margin, size.height - 44, title, { size: 19, bold: true, colour: [1, 1, 1] });
      if (subtitle) content.text(margin, size.height - 63, subtitle, { size: 10.5, colour: [0.88, 0.93, 1] });
      let statX = margin;
      for (const stat of stats) {
        const label = `${stat.label}: `;
        content.text(statX, size.height - 84, label, { size: 9.5, colour: [0.85, 0.91, 1] });
        content.text(statX + textWidth(label, 9.5), size.height - 84, String(stat.value), { size: 9.5, bold: true, colour: [1, 1, 1] });
        statX += textWidth(`${label}${stat.value}`, 9.5) + 26;
      }
      y = size.height - 124;
      firstPage = false;
    } else {
      content.text(margin, size.height - 40, title, { size: 12, bold: true });
      if (subtitle) content.text(margin + textWidth(`${title} `, 12) + 8, size.height - 40, subtitle, { size: 9.5, colour: grey });
      y = size.height - 62;
    }
    // Header row
    content.rect(margin, y - 5, tableWidth, rowHeight + 2, [0.94, 0.96, 0.99]);
    header.forEach((label, index) => {
      content.text(offsets[index] + 6, y + 1, fit(label, 9.5, columns[index] - 12), { size: 9.5, bold: true, colour: [0.2, 0.25, 0.33] });
    });
    y -= rowHeight + 2;
  };

  startPage();
  rows.forEach((row, rowIndex) => {
    if (y < margin + 26) startPage();
    if (rowIndex % 2 === 1) content.rect(margin, y - 5, tableWidth, rowHeight, zebra);
    row.forEach((value, index) => {
      content.text(offsets[index] + 6, y + 1, fit(value, 9, columns[index] - 12), { size: 9 });
    });
    content.line(margin, y - 5, margin + tableWidth, y - 5, line);
    y -= rowHeight;
  });

  if (!rows.length) content.text(margin + 6, y, 'No records for this period.', { size: 10, colour: grey });

  pages.forEach((page, index) => {
    const label = `${footer ? `${footer}  ·  ` : ''}Page ${index + 1} of ${pages.length}`;
    page.text(size.width - margin - textWidth(label, 8.5), 22, label, { size: 8.5, colour: grey });
  });

  return assemble(pages, size);
}
