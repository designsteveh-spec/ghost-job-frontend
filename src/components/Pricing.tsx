// components/Pricing.tsx

import tierFree from '../assets/PriceTier1.svg';
import tierPlus from '../assets/PriceTier2.svg';
import tierPro from '../assets/PriceTier3.svg';
import xIcon from '../assets/red-checkmark.svg';


export default function Pricing() {
  const API_BASE =
    (import.meta as any).env?.VITE_API_BASE || 'https://ghost-job-api.onrender.com';

  async function startCheckout(plan: 'day' | 'casual' | 'active') {
    try {
      const r = await fetch(`${API_BASE}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await r.json().catch(() => null);

      if (!r.ok || !data?.url) {
        alert(data?.error || 'Checkout could not be started. Please try again.');
        return;
      }

      window.location.href = data.url;
    } catch {
      alert('Checkout could not be started. Please try again.');
    }
  }

  return (
    <section id="pricing" className="pricing">
      <div className="pricing-inner">
        <h2 className="pricing-title">
          <span className="accent">Upgrade</span> when you’re ready
        </h2>

        <p className="pricing-subtitle">
  Everything is included in every plan. Free checks are always available — paid passes increase daily usage.
</p>


        <div className="pricing-cards-wrap">
          <div className="pricing-grid">
          {/* FREE */}
          <div className="pricing-card">
            <div className="pricing-card-header free">DAY PASS</div>

            <div className="pricing-card-body">
              <div className="pricing-title-row">
                <img src={tierFree} alt="" className="pricing-icon" />
                <h3>Unlimited Day Pass</h3>
              </div>

              <p className="pricing-tagline">Unlimited checks for one full day.</p>


             <p className="pricing-description">
Run unlimited full analyses for 24 hours. No subscription.
</p>



              <ul className="pricing-features">
  <li>Unlimited checks for 24 hours</li>
  <li>Full analysis (same as paid plans)</li>
  <li>No subscription — ends automatically</li>
</ul>




              <div className="pricing-price">$1.99 <span>/ 24 hours</span></div>

              <button
  className="pricing-btn secondary"
  onClick={() => startCheckout('day')}
>
  Get Day Pass
</button>

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
  <li>Full analysis included</li>
  <li>Up to 10 checks per day</li>
  <li>No subscription — ends automatically</li>
</ul>


              <div className="pricing-price">
                $4.99 <span>/ 30 days</span>
              </div>

              <button className="pricing-btn primary" onClick={() => startCheckout('casual')}>
  Start Casual Pass
</button>
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
  <li>Full analysis included</li>
  <li>Up to 30 checks per day</li>
  <li>Priority processing</li>
  <li>No subscription — ends automatically</li>
</ul>


              <div className="pricing-price">
                $9.99 <span>/ 30 days</span>
              </div>

              <button className="pricing-btn primary outline" onClick={() => startCheckout('active')}>
  Start Job Hunt Pass
</button>
            </div>
          </div>
          </div>
        <p className="pricing-disclaimer">
          All results are probability-based assessments using observable signals. This tool does not verify hiring intent or make claims about employers.
        </p>
        </div>

        <div className="pricing-table-wrap">
          <section className="compare-plans">
            <h3 className="compare-title">Compare Plans</h3>

            {/* Mobile: stacked compare cards (no horizontal scroll) */}
            <div className="compare-cards" aria-label="Compare plans (mobile)">
  {/* Free (FIRST) */}
  <div className="compare-card">
    <div className="compare-card-head">
      <div className="compare-card-plan">Free Check</div>
    </div>
    <div className="compare-card-rows">
      <div className="compare-card-row">
        <div className="compare-card-label">Daily Usage</div>
        <div className="compare-card-value compare-accent">3 checks</div>
      </div>
      <div className="compare-card-row">
        <div className="compare-card-label">Analysis Engine Used</div>
        <div className="compare-card-value"><span className="compare-check">✓</span></div>
      </div>
      <div className="compare-card-row">
        <div className="compare-card-label">Full Analysis Included</div>
        <div className="compare-card-value"><span className="compare-check">✓</span></div>
      </div>
      <div className="compare-card-row">
        <div className="compare-card-label">Priority Processing</div>
        <div className="compare-card-value">
          <img className="compare-x" src={xIcon} alt="Not included" />
        </div>
      </div>
      <div className="compare-card-row">
        <div className="compare-card-label">Subscription Length</div>
        <div className="compare-card-value">-</div>
      </div>
      <div className="compare-card-row compare-card-row-footer">
        <div className="compare-card-label">Monthly Renewal</div>
        <div className="compare-card-value">
          <img className="compare-x" src={xIcon} alt="No" />
        </div>
      </div>
    </div>
  </div>

  {/* Day Pass (SECOND) */}
  <div className="compare-card">
    <div className="compare-card-head">
      <div className="compare-card-plan">Unlimited Day Pass</div>
    </div>
    <div className="compare-card-rows">
      <div className="compare-card-row">
        <div className="compare-card-label">Daily Usage</div>
        <div className="compare-card-value compare-accent">Unlimited (24h)</div>
      </div>
      <div className="compare-card-row">
        <div className="compare-card-label">Analysis Engine Used</div>
        <div className="compare-card-value"><span className="compare-check">✓</span></div>
      </div>
      <div className="compare-card-row">
        <div className="compare-card-label">Full Analysis Included</div>
        <div className="compare-card-value"><span className="compare-check">✓</span></div>
      </div>
      <div className="compare-card-row">
        <div className="compare-card-label">Priority Processing</div>
        <div className="compare-card-value">
          <img className="compare-x" src={xIcon} alt="Not included" />
        </div>
      </div>
      <div className="compare-card-row">
        <div className="compare-card-label">Subscription Length</div>
        <div className="compare-card-value compare-accent">24 hours</div>
      </div>
      <div className="compare-card-row compare-card-row-footer">
        <div className="compare-card-label">Monthly Renewal</div>
        <div className="compare-card-value">
          <img className="compare-x" src={xIcon} alt="No" />
        </div>
      </div>
    </div>
  </div>

  {/* Casual (THIRD) */}
  <div className="compare-card">
    <div className="compare-card-head">
      <div className="compare-card-plan">Casual Job Hunt Pass</div>
    </div>
    <div className="compare-card-rows">
      <div className="compare-card-row">
        <div className="compare-card-label">Daily Usage</div>
        <div className="compare-card-value compare-accent">10 checks</div>
      </div>
      <div className="compare-card-row">
        <div className="compare-card-label">Analysis Engine Used</div>
        <div className="compare-card-value"><span className="compare-check">✓</span></div>
      </div>
      <div className="compare-card-row">
        <div className="compare-card-label">Full Analysis Included</div>
        <div className="compare-card-value"><span className="compare-check">✓</span></div>
      </div>
      <div className="compare-card-row">
        <div className="compare-card-label">Priority Processing</div>
        <div className="compare-card-value">
          <img className="compare-x" src={xIcon} alt="Not included" />
        </div>
      </div>
      <div className="compare-card-row">
        <div className="compare-card-label">Subscription Length</div>
        <div className="compare-card-value compare-accent">30 days</div>
      </div>
      <div className="compare-card-row compare-card-row-footer">
        <div className="compare-card-label">Monthly Renewal</div>
        <div className="compare-card-value">
          <img className="compare-x" src={xIcon} alt="No" />
        </div>
      </div>
    </div>
  </div>

  {/* Active (FOURTH) */}
  <div className="compare-card">
    <div className="compare-card-head">
      <div className="compare-card-plan">Active Job Hunt Pass</div>
    </div>
    <div className="compare-card-rows">
      <div className="compare-card-row">
        <div className="compare-card-label">Daily Usage</div>
        <div className="compare-card-value compare-accent">30 checks</div>
      </div>
      <div className="compare-card-row">
        <div className="compare-card-label">Analysis Engine Used</div>
        <div className="compare-card-value"><span className="compare-check">✓</span></div>
      </div>
      <div className="compare-card-row">
        <div className="compare-card-label">Full Analysis Included</div>
        <div className="compare-card-value"><span className="compare-check">✓</span></div>
      </div>
      <div className="compare-card-row">
        <div className="compare-card-label">Priority Processing</div>
        <div className="compare-card-value"><span className="compare-check">✓</span></div>
      </div>
      <div className="compare-card-row">
        <div className="compare-card-label">Subscription Length</div>
        <div className="compare-card-value compare-accent">30 days</div>
      </div>
      <div className="compare-card-row compare-card-row-footer">
        <div className="compare-card-label">Monthly Renewal</div>
        <div className="compare-card-value">
          <img className="compare-x" src={xIcon} alt="No" />
        </div>
      </div>
    </div>
  </div>
</div>


            {/* Desktop/tablet: keep table */}
            <div className="compare-table-wrap">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th className="compare-col-label">Plans</th>
                    <th className="compare-col-plan">Free Check</th>
<th className="compare-col-plan">Unlimited Day Pass</th>
                    <th className="compare-col-plan">Casual Job Hunt Pass</th>
                    <th className="compare-col-plan">Active Job Hunt Pass</th>
                  </tr>
                </thead>

                <tbody>
  <tr>
    <td className="compare-row-label">Daily Usage</td>
    <td className="compare-accent">3 checks</td>
    <td className="compare-accent">Unlimited (24h)</td>
    <td className="compare-accent">10 checks</td>
    <td className="compare-accent">30 checks</td>
  </tr>

  <tr>
    <td className="compare-row-label">Analysis Engine Used</td>
    <td className="compare-center"><span className="compare-check">✓</span></td>
    <td className="compare-center"><span className="compare-check">✓</span></td>
    <td className="compare-center"><span className="compare-check">✓</span></td>
    <td className="compare-center"><span className="compare-check">✓</span></td>
  </tr>

  <tr>
    <td className="compare-row-label">Full Analysis Included</td>
    <td className="compare-center"><span className="compare-check">✓</span></td>
    <td className="compare-center"><span className="compare-check">✓</span></td>
    <td className="compare-center"><span className="compare-check">✓</span></td>
    <td className="compare-center"><span className="compare-check">✓</span></td>
  </tr>

  <tr>
    <td className="compare-row-label">Priority Processing</td>
    <td className="compare-center"><img className="compare-x" src={xIcon} alt="Not included" /></td>
    <td className="compare-center"><img className="compare-x" src={xIcon} alt="Not included" /></td>
    <td className="compare-center"><img className="compare-x" src={xIcon} alt="Not included" /></td>
    <td className="compare-center"><span className="compare-check">✓</span></td>
  </tr>

  <tr>
    <td className="compare-row-label">Subscription Length</td>
    <td className="compare-center">-</td>
    <td className="compare-accent">24 hours</td>
    <td className="compare-accent">30 days</td>
    <td className="compare-accent">30 days</td>
  </tr>

  <tr className="compare-row-footer">
    <td className="compare-row-label">Monthly Renewal</td>
    <td className="compare-center"><img className="compare-x" src={xIcon} alt="No" /></td>
    <td className="compare-center"><img className="compare-x" src={xIcon} alt="No" /></td>
    <td className="compare-center"><img className="compare-x" src={xIcon} alt="No" /></td>
    <td className="compare-center"><img className="compare-x" src={xIcon} alt="No" /></td>
  </tr>
</tbody>

              </table>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
