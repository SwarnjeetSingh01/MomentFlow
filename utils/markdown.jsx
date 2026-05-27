/* ─── SIMPLE MARKDOWN RENDERER ────────────────────────────────────── */

export function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }
    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) { elements.push(<hr key={i} />); i++; continue; }
    if (line.startsWith('### ')) { elements.push(<h3 key={i}>{inlineFormat(line.slice(4))}</h3>); i++; continue; }
    if (line.startsWith('## ')) { elements.push(<h2 key={i}>{inlineFormat(line.slice(3))}</h2>); i++; continue; }
    if (line.startsWith('# ')) { elements.push(<h1 key={i}>{inlineFormat(line.slice(2))}</h1>); i++; continue; }

    if (line.includes('|') && line.trim().startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim().startsWith('|')) { tableLines.push(lines[i]); i++; }
      elements.push(renderTable(tableLines, elements.length));
      continue;
    }

    if (/^\s*[-*]\s/.test(line) || /^\s*\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && (/^\s*[-*]\s/.test(lines[i]) || /^\s*\d+\.\s/.test(lines[i]))) {
        const content = lines[i].replace(/^\s*[-*]\s/, '').replace(/^\s*\d+\.\s/, '');
        items.push(<li key={i}>{inlineFormat(content)}</li>);
        i++;
      }
      elements.push(<ul key={`list-${i}`}>{items}</ul>);
      continue;
    }
    elements.push(<p key={i}>{inlineFormat(line)}</p>);
    i++;
  }
  return elements;
}

function renderTable(lines, key) {
  const dataLines = lines.filter(l => !/^[\s-:|]+$/.test(l.replace(/\|/g, '').trim()));
  if (dataLines.length === 0) return null;
  const parse = (line) => line.split('|').filter((_, i, a) => i > 0 && i < a.length - 1).map(c => c.trim());
  const headers = parse(dataLines[0]);
  const rows = dataLines.slice(1).map(parse);
  return (
    <div key={`tw-${key}`} className="tableWrapper">
      <table key={`t-${key}`}>
        <thead><tr>{headers.map((h, j) => <th key={j}>{inlineFormat(h)}</th>)}</tr></thead>
        <tbody>{rows.map((row, ri) => <tr key={ri}>{row.map((c, ci) => <td key={ci}>{inlineFormat(c)}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function inlineFormat(text) {
  if (!text) return text;
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    return part.split(/(`[^`]+`)/g).map((cp, j) => {
      if (cp.startsWith('`') && cp.endsWith('`')) return <code key={`${i}-${j}`}>{cp.slice(1, -1)}</code>;
      return cp;
    });
  });
}
