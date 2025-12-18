import logoLeft from '../assets/ghostchecker-logoLeft.svg';
import logoRight from '../assets/ghostchecker-logoRight.svg';

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="nav-inner">
        {/* Brand / Logo */}
        <a href="#pricing" className="brand">
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

        {/* Actions */}
        <div className="nav-actions">
          <a href="#newsletter" className="cta cta-secondary">
            <span className="cta-desktop">Subscribe to Newsletter</span>
            <span className="cta-mobile">Newsletter</span>
          </a>

          <a href="#pricing" className="cta cta-primary">
            <span className="cta-desktop">Get More Link Checks</span>
            <span className="cta-mobile">Pricing</span>
          </a>
        </div>
      </div>
    </header>
  );
}
