import { redirect } from "next/navigation";
import { CategoryList } from "@/presentation/components/category/CategoryList";
import { getCategoriesAction } from "@/presentation/actions/category";
import { PaginationControls } from "@/presentation/components/common/PaginationControls";

export const metadata = {
  title: "Quản lý danh mục - Admin KhoUI",
};

interface AdminCategoriesPageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function AdminCategoriesPage({ searchParams }: AdminCategoriesPageProps) {
  const params = await searchParams;
  const rawPage = typeof params?.page === 'string' ? parseInt(params.page, 10) : 1;
  const currentPage = Number.isSafeInteger(rawPage) && rawPage >= 1 ? rawPage : 1;
  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;
  const search = typeof params?.q === 'string' ? params.q.trim() : undefined;

  const result = await getCategoriesAction(itemsPerPage, offset, search);
  
  // getCategoriesAction now returns { data: { categories: [], total: 0 } }
  const categories = result.data?.categories || [];
  const total = result.data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  if (total > 0 && currentPage > totalPages) {
    const redirectParams = new URLSearchParams();
    if (search) redirectParams.set("q", search);
    redirectParams.set("page", totalPages.toString());
    redirect(`/admin/categories?${redirectParams.toString()}`);
  }

  return (
    <div className="container mx-auto">
      <CategoryList initialCategories={categories} total={total} currentPage={currentPage} totalPages={totalPages} search={search} />
      <PaginationControls 
        currentPage={currentPage} 
        totalPages={totalPages} 
        totalItems={total}
        itemsPerPage={itemsPerPage}
        itemName={{ vi: "danh mục", en: "categories" }}
        layoutId="admin-categories-pagination"
        className="mt-8 mb-12"
      />
    </div>
  );
}
