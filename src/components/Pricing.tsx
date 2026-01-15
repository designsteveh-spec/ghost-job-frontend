// components/Pricing.tsx

import tierFree from '../assets/PriceTier1.svg';
import tierPlus from '../assets/PriceTier2.svg';
import tierPro from '../assets/PriceTier3.svg';
import xIcon from '../assets/red-checkmark.svg';


export default function Pricing() {
  return (
    <section id="pricing" className="pricing">
      <div className="pricing-inner">
        <h2 className="pricing-title">
          <span className="accent">Upgrade</span> when you’re ready
        </h2>

        <p className="pricing-subtitle">
          Same analysis engine across all plans. Free checks are always available — paid passes increase daily usage.
        </p>

        <div className="pricing-grid">
          {/* FREE */}
          <div className="pricing-card">
            <div className="pricing-card-header free">FREE</div>

            <div className="pricing-card-body">
              <div className="pricing-title-row">
                <img src={tierFree} alt="" className="pricing-icon" />
                <h3>Free Check</h3>
              </div>

              <p className="pricing-tagline">Try the full analysis before you commit.</p>

              <p className="pricing-description">
                Run the same analysis used in paid plans, with a limited number of daily checks.
              </p>

              <ul className="pricing-features">
  <li>Full Basic + Deep Check analysis</li>
  <li>Job ad link support</li>

  <li>Up to 3 checks per day</li>
</ul>


              <div className="pricing-price free">$0</div>

              <button className="pricing-btn secondary">Run Free Check</button>
            </div>
          </div>

          {/* CASUAL PASS */}
          <div className="pricing-card pricing-card-highlight">
            <div className="pricing-card-header plus">Casual Pass</div>

            <div className="pricing-card-body">
              <div className="pricing-title-row">
                <img src={tierPlus} alt="" className="pricing-icon" />
                <h3>Casual Job Hunt Pass</h3>
              </div>

              <p className="pricing-tagline">For light or occasional job searching.</p>

              <p className="pricing-description">
                Ideal if you’re browsing opportunities or applying selectively.
              </p>

              <ul className="pricing-features">
                <li>Full analysis engine (same as Free)</li>
                <li>Job link + image/PDF uploads</li>
                <li>Up to 10 checks per day</li>
                <li>No subscription — ends automatically</li>
              </ul>

              <div className="pricing-price">
                $4.99 <span>/ 30 days</span>
              </div>

              <button className="pricing-btn primary">Start Casual Pass</button>
            </div>
          </div>

          {/* ACTIVE PASS */}
          <div className="pricing-card">
            <div className="pricing-card-header pro">Most Popular</div>

            <div className="pricing-card-body">
              <div className="pricing-title-row">
                <img src={tierPro} alt="" className="pricing-icon" />
                <h3>Active Job Hunt Pass</h3>
              </div>

              <p className="pricing-tagline">Built for active job searching.</p>

              <p className="pricing-description">
                Designed for frequent applications and deeper validation before you apply.
              </p>

              <ul className="pricing-features">
                <li>Full analysis engine (same as all plans)</li>
                <li>Job link + image/PDF uploads</li>
                <li>Up to 30 checks per day</li>
                <li>Priority processing</li>
                <li>No subscription — ends automatically</li>
              </ul>

              <div className="pricing-price">
                $9.99 <span>/ 30 days</span>
              </div>

              <button className="pricing-btn primary outline">
                Start Job Hunt Pass
              </button>
            </div>
          </div>
        </div>

        <p className="pricing-disclaimer">
          All results are probability-based assessments using observable signals. This tool does not verify hiring intent or make claims about employers.
        </p>

        <section className="compare-plans">
          <h3 className="compare-title">Compare Plans</h3>

          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="compare-col-label">Plans</th>
                  <th className="compare-col-plan">Free Check</th>
                  <th className="compare-col-plan">Casual Job Hunt Pass</th>
                  <th className="compare-col-plan">Active Job Hunt Pass</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td className="compare-row-label">Daily Usage</td>
                  <td className="compare-accent">3 checks</td>
                  <td className="compare-accent">10 checks</td>
                  <td className="compare-accent">30 checks</td>
                </tr>

                <tr>
                  <td className="compare-row-label">Analysis Engine Used</td>
                  <td className="compare-center"><span className="compare-check">✓</span></td>
                  <td className="compare-center"><span className="compare-check">✓</span></td>
                  <td className="compare-center"><span className="compare-check">✓</span></td>
                </tr>

                <tr>
                  <td className="compare-row-label">Basic Link Checks</td>
                  <td className="compare-center"><span className="compare-check">✓</span></td>
                  <td className="compare-center"><span className="compare-check">✓</span></td>
                  <td className="compare-center"><span className="compare-check">✓</span></td>
                </tr>

                <tr>
  <td className="compare-row-label">Image and PDF Checks</td>
  <td className="compare-center">
    <img className="compare-x" src={xIcon} alt="Not included" />
  </td>
  <td className="compare-center"><span className="compare-check">✓</span></td>
  <td className="compare-center"><span className="compare-check">✓</span></td>
</tr>


                <tr>
                  <td className="compare-row-label">Priority Processing</td>
                  <td className="compare-center">
                    <img className="compare-x" src={xIcon} alt="Not included" />
                  </td>
                  <td className="compare-center">
                    <img className="compare-x" src={xIcon} alt="Not included" />
                  </td>
                  <td className="compare-center"><span className="compare-check">✓</span></td>
                </tr>

                <tr>
                  <td className="compare-row-label">Subscription Length</td>
                  <td className="compare-center">-</td>
                  <td className="compare-accent">30 days</td>
                  <td className="compare-accent">30 days</td>
                </tr>

                <tr className="compare-row-footer">
                  <td className="compare-row-label">Monthly Renewal</td>
                  <td className="compare-center">
                    <img className="compare-x" src={xIcon} alt="No" />
                  </td>
                  <td className="compare-center">
                    <img className="compare-x" src={xIcon} alt="No" />
                  </td>
                  <td className="compare-center">
                    <img className="compare-x" src={xIcon} alt="No" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}
