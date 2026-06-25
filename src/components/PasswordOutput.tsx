import { useEffect, useState } from "react";

interface PasswordOutputProps {
  password: string;
  length: number;
}

function DisplayPassword({ password, length, onClick }: { password: string; length: number; onClick: () => void }) {
  return (
    <output
      className="password-slots"
      onClick={onClick}
      role="button"
      tabIndex={password ? 0 : -1}
      aria-label="Copy generated password"
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      {Array.from({ length }, (_, index) => (
        <span key={index} className="password-char">
          {password[index] || "\u00A0"}
        </span>
      ))}
    </output>
  );
}

export function PasswordOutput({ password, length }: PasswordOutputProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timeout = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const copyPassword = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
  };

  return (
    <section className="output-panel" aria-label="Generated password">
      <div className="password-row">
        <DisplayPassword password={password} onClick={copyPassword} length={length} />
        {copied && <span className="copy-popup">Copied</span>}
      </div>
    </section>
  );
}
