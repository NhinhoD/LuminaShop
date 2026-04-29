"use client";

import { deleteProductAction } from "@/presentation/actions/product";
import { useState } from "react";

export function ProductDeleteButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    
    setIsDeleting(true);
    const result = await deleteProductAction(id);
    setIsDeleting(false);

    if (result.error) {
      alert(result.error);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex p-1.5 text-on-surface-variant hover:text-error transition-colors rounded-md hover:bg-error-container/50 disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-[20px]">
        {isDeleting ? "sync" : "delete"}
      </span>
    </button>
  );
}
