import { RotateCcw, Sun, Moon } from 'lucide-react';

/**
 * Application header with wordmark, theme toggle, and reset button.
 */
export default function Header({ onReset, appearance, onToggleAppearance, downloadActions }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <a className="header-brand" href="#" aria-label="CoverGen home">
          <img className="brand-mark" src="/favicon.svg" alt="" aria-hidden="true" />
          <h1 className="header-title">
            Cover<span className="header-title-gen">Gen</span>
          </h1>
        </a>

        <div className="header-actions">
          {downloadActions && <div className="header-export">{downloadActions}</div>}
          <button
            type="button"
            className="header-btn"
            onClick={onToggleAppearance}
            aria-label={`Switch to ${appearance === 'dark' ? 'light' : 'dark'} mode`}
            aria-pressed={appearance === 'dark'}
            title={`Switch to ${appearance === 'dark' ? 'light' : 'dark'} mode`}
          >
            {appearance === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            id="btn-reset"
            className="header-btn"
            onClick={onReset}
            aria-label="Reset all form fields"
            title="Clear all fields and start over"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
}
