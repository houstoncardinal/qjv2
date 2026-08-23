import { SHOPIFY_STORE_PERMANENT_DOMAIN } from "@/lib/shopify";

const CONTACT_FORM_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/contact#contact_form`;

/**
 * Submits to Shopify's built-in form handler — the same endpoint Shopify's own themes post to for
 * contact and newsletter forms, so it needs no separate account or API key. Posted via a hidden
 * form + iframe rather than fetch(), since a cross-origin fetch to this endpoint would be blocked
 * by CORS while a real form POST is not.
 *
 * Shopify's response is cross-origin and therefore opaque to this page, so the resolved promise
 * only means "the request round-tripped" — it can't distinguish Shopify accepting vs. silently
 * rejecting the submission. That's an inherent limit of this credential-free integration, not a
 * bug: treat resolution as "sent," and always keep a direct contact fallback visible alongside
 * any form that uses this.
 */
export function submitShopifyForm(fields: Record<string, string>): Promise<void> {
  return new Promise((resolve) => {
    const iframeName = `shopify-form-target-${Date.now()}`;
    const iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.style.display = "none";

    const form = document.createElement("form");
    form.action = CONTACT_FORM_URL;
    form.method = "POST";
    form.target = iframeName;
    form.style.display = "none";

    for (const [name, value] of Object.entries(fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }

    let settled = false;
    // Cleanup is deferred until the request actually completes (or the safety-net timeout) —
    // removing the form/iframe right after submit() can abort the in-flight cross-origin
    // navigation before the browser commits to it.
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
      iframe.remove();
      form.remove();
    };
    iframe.addEventListener("load", finish);
    window.setTimeout(finish, 4000); // safety net if the load event never fires

    document.body.appendChild(iframe);
    document.body.appendChild(form);
    form.submit();
  });
}
