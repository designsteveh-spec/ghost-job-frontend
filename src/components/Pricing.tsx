// components/Pricing.tsx

import tierFree from '../assets/PriceTier1.svg';
import tierPlus from '../assets/PriceTier2.svg';
import tierPro from '../assets/PriceTier3.svg';

export default function Pricing() {
  return (
    <section id="pricing" className="pricing">
      <div className="pricing-inner">
        <h2 className="pricing-title">
          <span className="accent">Upgrade</span> when you’re ready
        </h2>

        <p className="pricing-subtitle">
          Free checks are always available. Paid plans simply increase daily
          usage.
        </p>

        <div className="pricing-grid">
          {/* FREE */}
          <div className="pricing-card">
            <div className="pricing-card-header free">FREE</div>

            <div className="pricing-card-body">
              <div className="pricing-title-row">
                <img src={tierFree} alt="" className="pricing-icon" />
                <h3>Free</h3>
              </div>

              <p className="pricing-tagline">Limited Free Usage</p>

              <p className="pricing-description">
                Get a quick probability-based assessment using observable
                signals.
              </p>

              <ul className="pricing-features">
                <li>2 checks per day</li>
                <li>Basic probability score</li>
                <li>High-level signal summary</li>
              </ul>

              <div className="pricing-price free">FREE FOR EVERYONE</div>

              <button className="pricing-btn secondary">Run Free Check</button>
            </div>
          </div>

          {/* PLUS */}
          <div className="pricing-card pricing-card-highlight">
            <div className="pricing-card-header plus">Plus</div>

            <div className="pricing-card-body">
              <div className="pricing-title-row">
                <img src={tierPlus} alt="" className="pricing-icon" />
                <h3>Plus</h3>
              </div>

              <p className="pricing-tagline">Most used</p>

              <p className="pricing-description">
                Get deeper visibility into posting activity patterns so you can
                focus your effort wisely.
              </p>

              <ul className="pricing-features">
                <li>10 checks per day</li>
                <li>Detailed signal breakdown</li>
                <li>Stronger explanations</li>
                <li>
                  Priority analysis queue{' '}
                  <span className="muted">(copy only)</span>
                </li>
              </ul>

              <div className="pricing-price">
                $1.99 <span>/ month</span>
              </div>

              <button className="pricing-btn primary">Upgrade to Plus</button>
            </div>
          </div>

          {/* PRO */}
          <div className="pricing-card">
            <div className="pricing-card-header pro">Pro</div>

            <div className="pricing-card-body">
              <div className="pricing-title-row">
                <img src={tierPro} alt="" className="pricing-icon" />
                <h3>Pro</h3>
              </div>

              <p className="pricing-tagline">Best overall</p>

              <p className="pricing-description">
                Designed for frequent analysis and repeated job posting
                evaluation.
              </p>

              <ul className="pricing-features">
                <li>30 checks per day</li>
                <li>Full signal history (last 30 days)</li>
                <li>Stronger pattern explanations</li>
                <li>Priority support</li>
              </ul>

              <div className="pricing-price">
                $4.99 <span>/ month</span>
              </div>

              <button className="pricing-btn primary outline">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>

        <p className="pricing-disclaimer">
          All results are probability-based assessments using observable
          signals. This tool does not verify hiring intent or make claims about
          employers.
        </p>
      </div>
    </section>
  );
}
