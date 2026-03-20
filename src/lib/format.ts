export function formatAnswer(answer: string): string {
  // Convert bold text
  let formatted = answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert unordered lists (asterisks or hyphens)
  const lines = formatted.split('\n');
  let inList = false;
  const processedLines = lines.map(line => {
    if (line.startsWith('* ') || line.startsWith('- ')) {
      const content = line.substring(2);
      if (!inList) {
        inList = true;
        return '<ul><li>' + content + '</li>';
      }
      return '<li>' + content + '</li>';
    } else {
      if (inList) {
        inList = false;
        return '</ul>' + line;
      }
      return line;
    }
  });

  if (inList) {
    processedLines.push('</ul>');
  }

  return processedLines.join('<br />');
}
