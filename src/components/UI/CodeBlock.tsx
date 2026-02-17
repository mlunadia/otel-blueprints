import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language = 'yaml', title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-[var(--border-color)]">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-tertiary)] border-b border-[var(--border-color)]">
          <span className="text-sm font-medium text-[var(--text-secondary)]">{title}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)]">{language}</span>
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors"
            >
              {copied ? (
                <Check size={14} className="text-green-400" />
              ) : (
                <Copy size={14} className="text-[var(--text-secondary)]" />
              )}
            </button>
          </div>
        </div>
      )}
      <pre className="p-4 bg-[var(--bg-primary)] overflow-x-auto">
        <code className="text-sm text-[var(--text-primary)] font-mono whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
}
