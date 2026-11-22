"use client";

import { useRef } from "react";
import { ArrowUpRight, Lock } from "lucide-react";

import { toast } from "@/client/hooks/useToastStore";
import { useRevealBatch } from "@/client/components/common/motion/useRevealBatch";
import type { SectionCopy } from "./types";

/**
 * Newsletter block on ink. Client-side validation keeps the existing toast
 * feedback contract without pretending a real subscription was persisted.
 *
 * @param props - Copy and locale.
 * @returns Newsletter section.
 */
export function Newsletter({ dict }: SectionCopy): React.JSX.Element {
  const ref = useRef<HTMLElement>(null);
  const ui = dict.homeUi;

  useRevealBatch(ref);

  /**
   * Validates the email field and reports the outcome through the toast store.
   *
   * @param event - Submit event of the newsletter form.
   */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const form = event.currentTarget;
    const emailInput = form.elements.namedItem("newsletter_email") as HTMLInputElement | null;
    const email = emailInput?.value?.trim() ?? "";
    const isValid = email.includes("@") && email.includes(".") && email.length > 3;

    if (!isValid) {
      toast.warning(ui.newsletterInvalidTitle, ui.newsletterInvalidDesc);
      return;
    }

    toast.success(ui.newsletterSuccessTitle, ui.newsletterSuccessDesc);
    form.reset();
  };

  return (
    <section ref={ref} className="relative overflow-hidden bg-dark text-background">
      <div aria-hidden="true" className="hairline-grid pointer-events-none absolute inset-0 opacity-[0.08]" />

      <div className="relative mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div data-reveal className="lg:col-span-7">
            <span className="mono-meta text-primary">{ui.newsletterIndex}</span>
            <h2 className="mt-4 display max-w-2xl text-[clamp(1.8rem,4vw,3.2rem)] text-background">
              {ui.newsletterTitle}
            </h2>
            <p className="mt-5 max-w-md text-[13px] leading-relaxed text-background/55">
              {dict.home.newsletter.desc}
            </p>
          </div>

          <div data-reveal className="flex flex-col justify-end lg:col-span-5">
            <form onSubmit={handleSubmit} className="w-full">
              <label htmlFor="newsletter_email" className="mono-meta mb-2 block text-[8.5px] text-background/40">
                {dict.home.newsletter.placeholder}
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="newsletter_email"
                  type="email"
                  name="newsletter_email"
                  required
                  autoComplete="email"
                  placeholder={dict.home.newsletter.placeholder}
                  className="h-12 min-w-0 flex-1 border border-background/25 bg-transparent px-3.5 text-[13px] text-background outline-none transition-colors placeholder:text-background/30 focus:border-primary"
                />
                <button
                  type="submit"
                  className="inline-flex h-12 shrink-0 items-center justify-center gap-1.5 bg-primary px-5 text-[12px] font-semibold text-background transition-colors hover:bg-primary-dark"
                >
                  <span>{dict.home.newsletter.button}</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>

              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-background/40">
                <Lock size={11} />
                <span>{dict.home.newsletter.privacy}</span>
              </p>
            </form>

            <p className="mono-meta mt-6 border-t border-background/15 pt-4 text-[8px] text-background/30">
              {ui.labelLicense} · {ui.labelSource} · {ui.labelInstant}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
