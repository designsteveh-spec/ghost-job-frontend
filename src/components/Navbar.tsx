import { useEffect, useRef, useState } from 'react';
import logoLeft from '../assets/ghostchecker-logoLeft.svg';
import logoRight from '../assets/ghostchecker-logoRight.svg';
import burgerIcon from '../assets/burger-menu.svg';


export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!menuWrapRef.current) return;
      const target = e.target as Node | null;
      if (!target) return;

      // If click is outside the menu wrapper, close
      if (!menuWrapRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown, { passive: true });

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, []);

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
            <span className="cta-mobile">Newsletter</span>
          </a>

          <a href="#pricing" className="cta cta-primary">
            <span className="cta-desktop">Get More Link Checks</span>
            <span className="cta-mobile">Pricing</span>
          </a>
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
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
