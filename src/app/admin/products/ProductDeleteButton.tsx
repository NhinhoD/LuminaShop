"use client";

import { deleteProductAction } from "@/presentation/actions/product";
import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "@/presentation/hooks/useToastStore";

export function ProductDeleteButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    
    setIsDeleting(true);
    const result = await deleteProductAction(id);
    setIsDeleting(false);

    if (result.success) {
      toast.success("Đã xóa sản phẩm thành công!");
    } else {
      toast.error("Không thể xóa sản phẩm", result.error || "Vui lòng thử lại sau.");
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      type="button"
      className="inline-flex p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50 cursor-pointer"
      title="Xóa sản phẩm"
    >
      {isDeleting ? (
        <Loader2 size={18} className="animate-spin text-slate-400" />
      ) : (
        <Trash2 size={18} />
      )}
    </button>
  );
}
