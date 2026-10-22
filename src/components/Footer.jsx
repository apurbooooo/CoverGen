import { Mail } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Compact product and creator attribution footer.
 */
export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <span className="footer-brand">
          <img className="brand-mark" src="/favicon.svg" alt="" aria-hidden="true" />
          CoverGen
        </span>

        <span className="footer-credit">
          Built by{' '}
          <a href="https://github.com/apurbooooo" target="_blank" rel="noreferrer">
            Apurbo
            <svg className="footer-github-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.02c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.8 1.19 1.82 1.19 3.08 0 4.43-2.69 5.41-5.25 5.69.41.36.77 1.06.77 2.14v3.17c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
          </a>
        </span>

        <div className="footer-meta">
          <span className="footer-copy">
            Problem or suggestion? Reach out. © {CURRENT_YEAR}
          </span>
          <a className="footer-email" href="mailto:anxapurbo@gmail.com">
            <Mail size={14} aria-hidden="true" /> anxapurbo@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
