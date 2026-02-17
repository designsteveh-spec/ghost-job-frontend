import { useEffect, useRef, useState } from 'react';
import logoLeft from '../assets/ghostchecker-logoLeft.svg';
import logoRight from '../assets/ghostchecker-logoRight.svg';
import burgerIcon from '../assets/burger-menu.svg';
import enterIcon from '../assets/input-enterIcon.svg';


export default function Navbar({
  isPaidRoute,
  isHomePage = true,
  accessCode,
  onAccessCodeChange,
  onAccessCodeSubmit,
  onPricingClick,
}: {
  isPaidRoute: boolean;
  isHomePage?: boolean;
  accessCode: string;
  onAccessCodeChange: (next: string) => void;
  onAccessCodeSubmit: (code: string) => void;
  onPricingClick?: () => void;
}) {

  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef<HTMLDivElement | null>(null);

  const submitAccessCode = () => {
    const code = (accessCode || '').trim();
    if (!code) return;
    onAccessCodeSubmit(code);
    setMenuOpen(false);
  };

  const onAccessKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitAccessCode();
    }
  };

    useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    const onDocClick = (e: MouseEvent) => {
      if (!menuOpen) return;
      if (!menuWrapRef.current) return;

      const target = e.target as Node | null;
      if (!target) return;

      if (!menuWrapRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onDocClick);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onDocClick);
    };
  }, [menuOpen]);


  const homeHref = isHomePage ? '#hero' : '/';
  const pricingHref = isHomePage ? '#pricing' : '/#pricing';
  const newsletterHref = isHomePage ? '#newsletter' : '/#newsletter';

  return (
    <header className="site-header">
      <div className="nav-inner">
        {/* Brand / Logo */}
        <a
          href={isPaidRoute ? homeHref : pricingHref}
          className="brand"
          onClick={() => setMenuOpen(false)}
        >
          <img
            src={logoLeft}
            alt="Ghost Job Checker"
            className="brand-logo brand-logo-left"
          />
          <img
            src={logoRight}
            alt=""
            aria-hidden="true"
            className="brand-logo brand-logo-right"
          />
        </a>

        {/* Desktop actions */}
        <div className="nav-actions nav-actions-desktop">
          <a
  href={pricingHref}
  className="nav-link-pricing"
  onClick={(e) => {
    setMenuOpen(false);

    if (isHomePage && isPaidRoute && onPricingClick) {
      e.preventDefault();
      onPricingClick();
    }
  }}
>
  Get More Link Checks
</a>


          {/* Access Code input (always available) */}
          <div className="nav-access">
            <div className="accesscode-wrap">
              <input
                className="accesscode-input"
                type="text"
                value={accessCode}
                onChange={(e) => onAccessCodeChange(e.target.value)}
                onKeyDown={onAccessKeyDown}
                placeholder="Insert Access Code"
                aria-label="Access code"
              />
              <button
                type="button"
                className="accesscode-submit"
                onClick={submitAccessCode}
                aria-label="Submit access code"
              >
                <img src={enterIcon} alt="" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile hamburger */}
        <div className="nav-actions-mobile" ref={menuWrapRef}>
          <button
  type="button"
  className="nav-menu-btn"
  aria-label={menuOpen ? 'Close menu' : 'Open menu'}
  aria-expanded={menuOpen}
  aria-controls="nav-menu-panel"
  onClick={() => setMenuOpen((v) => !v)}
>
  <img src={burgerIcon} alt="" aria-hidden="true" className="nav-menu-svg" />
</button>


          {menuOpen && (
            <div id="nav-menu-panel" className="nav-menu-panel">
              <a
                role="menuitem"
                href="/blog"
                className="nav-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                Blog
              </a>

              <a
                href={pricingHref}
                className="nav-menu-item"
                onClick={(e) => {
                  setMenuOpen(false);

                  if (isHomePage && isPaidRoute && onPricingClick) {
                    e.preventDefault();
                    onPricingClick();
                  }
                }}
              >
                Pricing
              </a>

              <a
                role="menuitem"
                href={newsletterHref}
                className="nav-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                Newsletter
              </a>

              <div className="nav-menu-divider" />

              <div className="nav-menu-section-label">Access Code</div>

              <form
                className="nav-menu-access-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitAccessCode();
                }}
              >
                <div className="accesscode-wrap accesscode-wrap-menu">
                  <input
                    className="accesscode-input"
                    type="text"
                    value={accessCode}
                    onChange={(e) => onAccessCodeChange(e.target.value)}
                    onKeyDown={onAccessKeyDown}
                    placeholder="Insert Access Code"
                    aria-label="Access code"
                  />
                  <button
                    type="button"
                    className="accesscode-submit"
                    onClick={() => {
                      submitAccessCode();
                    }}
                    aria-label="Submit access code"
                  >
                    <img src={enterIcon} alt="" aria-hidden="true" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
