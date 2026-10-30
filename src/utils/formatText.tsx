import React from 'react';

/**
 * Parses markdown **bold** tokens and leading label definitions (e.g. "Void Orb:")
 * into highlighted React elements.
 */
export function formatInlineTokens(line: string): React.ReactNode[] {
  let text = line;
  if (!text.includes('**')) {
    const colonMatch = text.match(/^([A-Za-z0-9\s]{3,24}:)\s*(.*)$/);
    if (colonMatch) {
      return [
        <strong key="prefix" className="font-semibold text-cyan-300">
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
      <strong key={match.index} className="font-semibold text-cyan-300">
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
 * Splits multiline descriptions by paragraph and formats markdown bold tokens with cyan accents.
 */
export function renderFormattedCoreText(rawText?: string | null, className = 'space-y-1.5'): React.ReactElement | null {
  if (!rawText) return null;
  const paragraphs = rawText.split(/\n+/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return null;

  return (
    <div className={className}>
      {paragraphs.map((p, idx) => (
        <p key={idx} className="leading-relaxed">
          {formatInlineTokens(p)}
        </p>
      ))}
    </div>
  );
}
