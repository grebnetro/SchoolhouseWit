/**
 * ============================================================================
 * SCHOOLHOUSEWIT — CLIENT SCRIPT
 * ============================================================================
 * Handles navigation interactions, FAQ accordion toggling, and the pre-launch
 * email waitlist submission stub.
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initFaqAccordion();
  initWaitlistForm();
});

/**
 * ----------------------------------------------------------------------------
 * 1. MOBILE NAVIGATION DRAWER
 * ----------------------------------------------------------------------------
 */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const drawer = document.getElementById('mobileNavDrawer');
  const navLinks = drawer ? drawer.querySelectorAll('a') : [];

  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('is-open');
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close drawer when an anchor is clicked
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      drawer.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * ----------------------------------------------------------------------------
 * 2. ACCESSIBLE FAQ ACCORDION
 * ----------------------------------------------------------------------------
 */
function initFaqAccordion() {
  const faqTriggers = document.querySelectorAll('.faq-trigger');

  faqTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.faq-item');
      if (!item) return;

      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      // Optionally close other open items for clean accordion UX
      document.querySelectorAll('.faq-item').forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove('is-active');
          const otherTrigger = otherItem.querySelector('.faq-trigger');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle clicked item
      item.classList.toggle('is-active', !isExpanded);
      trigger.setAttribute('aria-expanded', !isExpanded ? 'true' : 'false');
    });
  });
}

/**
 * ----------------------------------------------------------------------------
 * 3. WAITLIST EMAIL SUBMISSION STUB
 * ----------------------------------------------------------------------------
 * NOTE FOR PRODUCTION INTEGRATION:
 * When you are ready to connect a real email newsletter or database service,
 * replace the simulated delay inside `submitWaitlist()` below.
 * Supported providers:
 *  - Buttondown: fetch('https://api.buttondown.email/v1/subscribers', ...)
 *  - ConvertKit / Kit: POST to https://api.convertkit.com/v3/forms/...
 *  - Formspree / Formkeep: POST form endpoint
 *  - Cloudflare Workers / Supabase: POST /api/waitlist
 */
function initWaitlistForm() {
  const form = document.getElementById('waitlistForm');
  const emailInput = document.getElementById('waitlistEmail');
  const feedbackEl = document.getElementById('formFeedback');
  const submitBtn = document.getElementById('waitlistSubmitBtn');

  if (!form || !emailInput || !feedbackEl || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showFeedback('Please enter a valid school or personal email address.', 'error');
      emailInput.focus();
      return;
    }

    // Indicate submission in progress
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving your spot...';
    hideFeedback();

    try {
      // Execute the waitlist stub
      const result = await submitWaitlist(email);

      if (result.success) {
        showFeedback(
          '🎉 You’re on the VIP list! We will notify you the instant the first math tee drops.',
          'success'
        );
        form.reset();
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (err) {
      console.error('[SchoolhouseWit] Waitlist submission error:', err);
      showFeedback('Something went wrong. Please check your connection and try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });

  function showFeedback(message, type) {
    feedbackEl.textContent = message;
    feedbackEl.className = `form-feedback is-visible form-feedback-${type}`;
    feedbackEl.setAttribute('role', type === 'error' ? 'alert' : 'status');
  }

  function hideFeedback() {
    feedbackEl.textContent = '';
    feedbackEl.className = 'form-feedback';
    feedbackEl.removeAttribute('role');
  }
}

/**
 * Pluggable submission handler
 * @param {string} email
 * @returns {Promise<{success: boolean, email?: string, error?: string}>}
 */
async function submitWaitlist(email) {
  /* ==========================================================================
   * >>> PLUG IN YOUR REAL EMAIL / BACKEND SERVICE HERE <<<
   * Examples:
   *
   * 1. CONVERTKIT / KIT:
   * const response = await fetch('https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ api_key: 'YOUR_PUBLIC_KEY', email: email })
   * });
   * return { success: response.ok };
   *
   * 2. BUTTONDOWN:
   * const response = await fetch('https://api.buttondown.email/v1/subscribers', {
   *   method: 'POST',
   *   headers: { 'Authorization': 'Token YOUR_API_TOKEN', 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ email: email, tags: ['prelaunch-waitlist'] })
   * });
   * return { success: response.ok };
   *
   * 3. CLOUDFLARE WORKER / PAGES FUNCTION (e.g. /api/subscribe):
   * const response = await fetch('/api/subscribe', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ email: email })
   * });
   * return { success: response.ok };
   * ========================================================================== */

  console.log('[SchoolhouseWit Waitlist] New submission received:', {
    email: email,
    timestamp: new Date().toISOString(),
    source: 'landing_page_waitlist'
  });

  // Simulate network latency (400ms) for realistic UI response
  await new Promise((resolve) => setTimeout(resolve, 400));

  // Return success response object
  return { success: true, email: email };
}
