import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * A collapsible form section with numbered header.
 */
export default function FormSection({ number, title, children, defaultOpen = true, id, headerControl }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="form-section" id={id}>
      <div className="section-header-row">
        <button
          type="button"
          className="section-header"
          onClick={() => setIsOpen((o) => !o)}
          aria-expanded={isOpen}
          aria-controls={`${id}-body`}
        >
          <span className="section-number" aria-hidden="true">{number}</span>
          <span className="section-title">{title}</span>
          <ChevronDown
            size={14}
            className={`section-chevron ${isOpen ? 'open' : ''}`}
            aria-hidden="true"
          />
        </button>
        {headerControl && <div className="section-header-control">{headerControl}</div>}
      </div>

      {isOpen && (
        <div className="section-body" id={`${id}-body`} role="group" aria-label={title}>
          {children}
        </div>
      )}
    </section>
  );
}
