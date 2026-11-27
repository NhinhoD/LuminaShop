import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/shared/constants";

interface AuthShellProps {
  /** Short spec code shown in the panel chrome, e.g. "AUTH-01". */
  readonly code: string;
  readonly tag: string;
  readonly title: string;
  readonly subtitle: string;
  readonly children: React.ReactNode;
  /** Optional footer row inside the form panel (links, switches). */
  readonly footer?: React.ReactNode;
}

/**
 * Shared Spec Sheet frame for every authentication screen.
 *
 * Renders a two-column editorial layout: an identity/meta column on the left
 * and a hairline form panel on the right. Purely presentational — pages own the
 * copy and the form components own all behaviour.
 *
 * @param props - Codes, localized copy, form content and optional footer.
 * @returns Auth page frame.
 */
export function AuthShell({ code, tag, title, subtitle, children, footer }: AuthShellProps): React.JSX.Element {
  return (
    <main className="flex-grow bg-background font-sans">
      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 sm:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Identity column */}
          <aside className="lg:col-span-5">
            <Link
              href={ROUTES.HOME}
              className="inline-flex items-center gap-2 transition-opacity hover:opacity-70"
            >
              <Image
                src="/LogoKhoUI.png"
                alt="KhoUI"
                width={110}
                height={34}
                className="h-8 w-auto object-contain"
              />
              <span className="mono-meta border border-border px-1.5 py-1 text-[7.5px] text-dark/40">
                VN
              </span>
            </Link>

            <div className="mt-8 border-t border-border pt-6 lg:mt-12">
              <span className="mono-meta flex items-center gap-2 text-primary">
                <span className="h-1.5 w-1.5 bg-primary" />
                {tag}
              </span>
              <h1 className="mt-3 display text-[clamp(1.6rem,3.2vw,2.6rem)] text-dark">{title}</h1>
              <p className="mt-4 max-w-md text-[13px] leading-relaxed text-dark/55">{subtitle}</p>
            </div>

            <div className="mt-8 hidden border-t border-border pt-4 lg:block">
              <span className="mono-meta text-[8px] text-dark/30">{code}</span>
            </div>
          </aside>

          {/* Form panel */}
          <section className="lg:col-span-7">
            <div className="border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="mono-meta text-[8.5px] text-dark/45">
                  {code} / {tag}
                </span>
                <span className="mono-meta text-[8px] text-dark/25">KHOUI / SECURE</span>
              </div>

              <div className="p-5 sm:p-8">{children}</div>

              {footer && (
                <div className="border-t border-border bg-background-subtle/40 px-5 py-4 sm:px-8">
                  {footer}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
