import { useEffect, useRef, useState } from 'react';
import logoLeft from '../assets/ghostchecker-logoLeft.svg';
import logoRight from '../assets/ghostchecker-logoRight.svg';
import burgerIcon from '../assets/burger-menu.svg';
import enterIcon from '../assets/input-enterIcon.svg';


export default function Navbar({
  accessCode,
  onAccessCodeChange,
  onAccessCodeSubmit,
}: {
  accessCode: string;
  onAccessCodeChange: (next: string) => void;
  onAccessCodeSubmit: (code: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef<HTMLDivElement | null>(null);

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
    document.addEventListener('click', onDocClick);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('click', onDocClick);
    };
  }, [menuOpen]);


  return (
    <header className="site-header">
      <div className="nav-inner">
        {/* Brand / Logo */}
        <a
          href="#pricing"
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
          <a href="#newsletter" className="cta cta-secondary">
            <span className="cta-desktop">Subscribe to Newsletter</span>
            <span className="cta-mobile">Subscribe</span>
          </a>

          <a href="#pricing" className="cta cta-primary">
            <span className="cta-desktop">Get More Link Checks</span>
            <span className="cta-mobile">Upgrade</span>
          </a>

          {/* Access Code input (always available) */}
          <form
            className="nav-access"
            onSubmit={(e) => {
              e.preventDefault();
              onAccessCodeSubmit(accessCode);
            }}
          >
            <div className="nav-access-input">
              <input
                type="text"
                value={accessCode}
                onChange={(e) => onAccessCodeChange(e.target.value)}
                placeholder="Insert Access Code"
                aria-label="Access code"
              />
              <button type="submit" className="nav-access-enter" aria-label="Submit access code">
                <img src={enterIcon} alt="" aria-hidden="true" />
              </button>
            </div>
          </form>
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
            <div id="nav-menu-panel" className="nav-menu-panel" role="menu">
              <a
                role="menuitem"
                href="#pricing"
                className="nav-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                role="menuitem"
                href="#newsletter"
                className="nav-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                Newsletter
              </a>

              {/* Access Code (last item in mobile menu) */}
              <div className="nav-menu-access" role="none">
                <div className="nav-menu-access-label">Access Code</div>

                <form
                  className="nav-menu-access-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    onAccessCodeSubmit(accessCode);
                  }}
                >
                  <div className="nav-access-input nav-access-input--menu">
                    <input
                      type="text"
                      value={accessCode}
                      onChange={(e) => onAccessCodeChange(e.target.value)}
                      placeholder="Insert Access Code"
                      aria-label="Access code"
                    />
                    <button type="submit" className="nav-access-enter" aria-label="Submit access code">
                      <img src={enterIcon} alt="" aria-hidden="true" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
