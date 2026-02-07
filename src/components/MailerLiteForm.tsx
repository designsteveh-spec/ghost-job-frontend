import { useEffect } from 'react';

export default function MailerLiteForm() {
  useEffect(() => {
    // ✅ MailerLite success callback MUST be global
    (window as any).ml_webform_success_34679109 = function () {
      const form = document.querySelector(
        '.ml-subscribe-form-34679109 .row-form'
      ) as HTMLElement | null;
      const success = document.querySelector(
        '.ml-subscribe-form-34679109 .row-success'
      ) as HTMLElement | null;

      if (form && success) {
        form.style.display = 'none';
        success.style.display = 'block';
      }
    };

    // Load MailerLite script once
    const script = document.createElement('script');
    script.src =
      'https://groot.mailerlite.com/js/w/webforms.min.js?v176e10baa5e7ed80d35ae235be3d5024';
    script.async = true;
    document.body.appendChild(script);

    // Required MailerLite tracking ping
    fetch(
      'https://assets.mailerlite.com/jsonp/1985110/forms/173902126632666375/takel'
    ).catch(() => {});

    return () => {
      document.body.removeChild(script);
      delete (window as any).ml_webform_success_34679109;
    };
  }, []);

  return (
    <section id="newsletter" className="newsletter">
      <div className="newsletter-inner">
        <div
          dangerouslySetInnerHTML={{
            __html: `
<style>
@import url("https://assets.mlcdn.com/fonts.css?version=1765458");
</style>

<div id="mlb2-34679109" class="ml-form-embedContainer ml-subscribe-form ml-subscribe-form-34679109">
  <div class="ml-form-align-center">
    <div class="ml-form-embedWrapper embedForm">

      <div class="ml-form-embedBody row-form">
        <div class="ml-form-embedContent">
          <h4 class="newsletter-title">
  <span class="newsletter-title-accent">Get Informed</span> About Job Hunting and Avoiding Ghost Jobs
</h4>
          <p style="text-align:center;">
  <strong>No spam.</strong> We never sell your information.
</p>
        </div>

        <form
          class="ml-block-form"
          action="https://assets.mailerlite.com/jsonp/1985110/forms/173902126632666375/subscribe"
          method="post"
        >
          <div class="ml-form-formContent">
            <div class="ml-form-fieldRow ml-last-item">
              <div class="ml-field-group ml-field-email ml-validate-email ml-validate-required">
                <input
                  aria-label="email"
                  aria-required="true"
                  type="email"
                  name="fields[email]"
                  placeholder="Email"
                  autocomplete="email"
                  required
                />
              </div>
            </div>
          </div>

          <input type="hidden" name="ml-submit" value="1" />

          <div class="ml-form-embedSubmit">
            <button type="submit" class="primary">Subscribe</button>

            <button
              disabled
              style="display:none"
              type="button"
              class="loading"
            >
              <div class="ml-form-embedSubmitLoad"></div>
              <span class="sr-only">Loading...</span>
            </button>
          </div>

          <input type="hidden" name="anticsrf" value="true" />
        </form>
      </div>

      <div class="ml-form-successBody row-success" style="display:none">
        <div class="ml-form-successContent">
          <h4>Thank you!</h4>
          <p>You have successfully joined our subscriber list.</p>
        </div>
      </div>

    </div>
  </div>
</div>
`,
          }}
        />
      </div>
    </section>
  );
}
