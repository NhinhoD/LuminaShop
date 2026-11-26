import type { Product } from "@/shared/types/product";

interface SampleSeed {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly price: number;
  readonly techStack: readonly string[];
  readonly demoUrl: string;
}

const SAMPLE_SEEDS: readonly SampleSeed[] = [
  {
    id: "sample-1",
    title: "E-Commerce Storefront Template",
    description:
      "Mẫu giao diện bán hàng tĩnh HTML5, CSS3, Bootstrap 5 với bố cục giỏ hàng, lưới sản phẩm và trang thanh toán chuẩn responsive.",
    price: 499000,
    techStack: ["HTML5", "CSS3", "Bootstrap 5", "JavaScript"],
    demoUrl: "https://demo.khoui.com/ecommerce",
  },
  {
    id: "sample-2",
    title: "Admin Dashboard UI Kit",
    description:
      "Bộ giao diện quản trị tĩnh với bảng biểu, thẻ thống kê card, biểu đồ chart JS và menu sidebar co giãn mượt mà.",
    price: 389000,
    techStack: ["HTML5", "Bootstrap 5", "Chart.js", "CSS3"],
    demoUrl: "https://demo.khoui.com/dashboard",
  },
  {
    id: "sample-3",
    title: "Developer & Designer Portfolio",
    description:
      "Mẫu portfolio cá nhân tĩnh với hiệu ứng cuộn mượt, giới thiệu kỹ năng, dự án tiêu biểu và form liên hệ tĩnh.",
    price: 0,
    techStack: ["HTML5", "CSS3", "JavaScript", "Responsive"],
    demoUrl: "https://demo.khoui.com/portfolio",
  },
  {
    id: "sample-4",
    title: "Corporate Business Landing",
    description:
      "Mẫu trang web giới thiệu công ty, doanh nghiệp chuẩn Bootstrap 5 với phần giới thiệu dịch vụ, bảng giá và đánh giá.",
    price: 550000,
    techStack: ["HTML5", "CSS3", "Bootstrap 5", "FontAwesome"],
    demoUrl: "https://demo.khoui.com/corporate",
  },
  {
    id: "sample-5",
    title: "Creative Digital Studio Agency",
    description:
      "Template giới thiệu dịch vụ sáng tạo, agency quảng cáo với phong cách hiện đại, hiệu ứng hover và typography đẹp mắt.",
    price: 299000,
    techStack: ["HTML5", "CSS3", "JavaScript", "W3C Valid"],
    demoUrl: "https://demo.khoui.com/agency",
  },
  {
    id: "sample-6",
    title: "Product & SaaS Landing Page",
    description:
      "Trang đích giới thiệu sản phẩm phần mềm với cấu trúc tính năng, bảng so sánh giá và khối kêu gọi hành động CTA rõ ràng.",
    price: 320000,
    techStack: ["HTML5", "Bootstrap 5", "CSS3", "SEO Ready"],
    demoUrl: "https://demo.khoui.com/landing",
  },
];

const SAMPLE_TIMESTAMP = new Date("2026-01-01T00:00:00.000Z");

/**
 * Preview catalogue shown only when the datastore has no active products yet.
 * These rows are never treated as purchasable records; they keep the landing
 * page presentable in a fresh environment.
 */
export const CURATED_SAMPLE_TEMPLATES: readonly Product[] = SAMPLE_SEEDS.map((seed) => ({
  id: seed.id,
  categoryId: "all",
  title: { vi: seed.title, en: seed.title },
  slug: seed.id,
  description: { vi: seed.description, en: seed.description },
  price: seed.price,
  stock: 1,
  imageUrl: undefined,
  isActive: true,
  demoUrl: seed.demoUrl,
  sourceCodeUrl: "",
  techStack: [...seed.techStack],
  createdAt: SAMPLE_TIMESTAMP,
  updatedAt: SAMPLE_TIMESTAMP,
}));
