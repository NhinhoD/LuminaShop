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
  const currentPage = parseInt(params.page || "1", 10);
  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;
  const search = typeof params.q === 'string' ? params.q : undefined;

  const result = await getCategoriesAction(itemsPerPage, offset, search);
  
  // getCategoriesAction now returns { data: { categories: [], total: 0 } }
  const categories = result.data?.categories || [];
  const total = result.data?.total || 0;
  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className="container mx-auto">
      <CategoryList initialCategories={categories} total={total} currentPage={currentPage} totalPages={totalPages} search={search} />
      {totalPages > 1 && (
        <div className="mt-8 mb-12 flex justify-center">
          <PaginationControls currentPage={currentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
