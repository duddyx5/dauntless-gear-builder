import React from 'react';

/**
 * Parses markdown **bold** tokens, <b>bold</b> HTML tags, and leading label definitions (e.g. "Command:")
 * into highlighted React elements.
 */
export function formatInlineTokens(line: string, highlightClass = 'text-cyan-300'): React.ReactNode[] {
  let text = line.replace(/<b>(.*?)<\/b>/gi, '**$1**');
  if (!text.includes('**')) {
    const colonMatch = text.match(/^([A-Za-z0-9\s()'-]{3,32}:)\s*(.*)$/);
    if (colonMatch) {
      return [
        <strong key="prefix" className={`font-semibold ${highlightClass}`}>
          {colonMatch[1]}{' '}
        </strong>,
        <span key="rest">{colonMatch[2]}</span>,
      ];
    }
  }

  const tokens: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(<span key={lastIndex}>{text.substring(lastIndex, match.index)}</span>);
    }
    const inner = match[1].slice(2, -2);
    tokens.push(
      <strong key={match.index} className={`font-semibold ${highlightClass}`}>
        {inner}
      </strong>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    tokens.push(<span key={lastIndex}>{text.substring(lastIndex)}</span>);
  }

  return tokens;
}

/**
 * Splits multiline descriptions by paragraph and formats markdown bold tokens with accent colors.
 */
export function renderFormattedCoreText(rawText?: string | null, className = 'space-y-1.5', highlightClass = 'text-cyan-300'): React.ReactElement | null {
  if (!rawText) return null;
  const paragraphs = rawText.split(/\n+/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return null;

  return (
    <div className={className}>
      {paragraphs.map((p, idx) => (
        <p key={idx} className="leading-relaxed">
          {formatInlineTokens(p, highlightClass)}
        </p>
      ))}
    </div>
  );
}
