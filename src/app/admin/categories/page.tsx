import { CategoryList } from "@/presentation/components/category/CategoryList";

export const metadata = {
  title: "Quản lý danh mục - Admin LuminaShop",
};

export default function AdminCategoriesPage() {
  return (
    <div className="container mx-auto">
      <CategoryList />
    </div>
  );
}
