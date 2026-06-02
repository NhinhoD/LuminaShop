"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createProductAction, updateProductAction } from "@/presentation/actions/product";
import { Category } from "@/domain/entities/Category";
import { CreateProductDTO, UpdateProductDTO, Product } from "@/domain/entities/Product";
import { createClient } from "@/infrastructure/supabase/client";
import { UploadCloud, CheckCircle, FileArchive, ImageIcon, Loader2 } from "lucide-react";

interface ProductFormProps {
  categories: Category[];
  initialData?: Product; // For editing
}

interface ProductFormData {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  isActive: boolean;
  demoUrl: string;
  sourceCodeUrl: string;
  techStack: string; // Comma separated for form input
}

function sanitizeName(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface FileToUpload {
  file: File;
  path: string;
}

interface MockFileSystemEntry {
  name: string;
  isFile: boolean;
  isDirectory: boolean;
}

interface MockFileSystemFileEntry extends MockFileSystemEntry {
  file: (successCallback: (file: File) => void, errorCallback: (err: unknown) => void) => void;
}

interface MockFileSystemDirectoryEntry extends MockFileSystemEntry {
  createReader: () => MockFileSystemDirectoryReader;
}

interface MockFileSystemDirectoryReader {
  readEntries: (successCallback: (entries: MockFileSystemEntry[]) => void, errorCallback: (err: unknown) => void) => void;
}


const getFilesFromDirectoryEntry = async (entry: MockFileSystemEntry, currentPath = ""): Promise<FileToUpload[]> => {
  const files: FileToUpload[] = [];
  if (entry.isFile) {
    const fileEntry = entry as unknown as MockFileSystemFileEntry;
    const file = await new Promise<File>((resolve, reject) => {
      fileEntry.file(resolve, reject);
    });
    files.push({ file, path: currentPath + entry.name });
  } else if (entry.isDirectory) {
    const dirEntry = entry as unknown as MockFileSystemDirectoryEntry;
    const dirReader = dirEntry.createReader();
    
    const readAllEntries = async (): Promise<MockFileSystemEntry[]> => {
      let allEntries: MockFileSystemEntry[] = [];
      const readEntries = async (): Promise<MockFileSystemEntry[]> => {
        return new Promise((resolve, reject) => {
          dirReader.readEntries(resolve, reject);
        });
      };
      let result = await readEntries();
      while (result.length > 0) {
        allEntries = allEntries.concat(result);
        result = await readEntries();
      }
      return allEntries;
    };

    const entries = await readAllEntries();
    for (const subEntry of entries) {
      const subFiles = await getFilesFromDirectoryEntry(subEntry, currentPath + entry.name + "/");
      files.push(...subFiles);
    }
  }
  return files;
};

const getDroppedFiles = async (dataTransfer: DataTransfer): Promise<FileToUpload[]> => {
  const files: FileToUpload[] = [];
  const items = dataTransfer.items;
  if (!items) {
    for (let i = 0; i < dataTransfer.files.length; i++) {
      const file = dataTransfer.files[i];
      files.push({ file, path: file.name });
    }
    return files;
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === "file") {
      const entry = item.webkitGetAsEntry() as unknown as MockFileSystemEntry;
      if (entry) {
        const subFiles = await getFilesFromDirectoryEntry(entry, "");
        files.push(...subFiles);
      }
    }
  }
  return files;
};

const normalizePaths = (files: FileToUpload[]): FileToUpload[] => {
  if (files.length === 0) return files;
  const firstPath = files[0].path;
  const parts = firstPath.split('/');
  if (parts.length <= 1) return files;

  const topLevel = parts[0];
  const allShare = files.every(f => f.path.startsWith(topLevel + '/'));
  if (allShare) {
    return files.map(f => ({
      file: f.file,
      path: f.path.substring(topLevel.length + 1)
    }));
  }
  return files;
};

const uploadPreviewFilesAsync = async (
  filesToUpload: FileToUpload[],
  title: string,
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>,
  setPreviewFolderUploading: (v: boolean) => void,
  setPreviewFolderUploadSuccess: (v: boolean) => void,
  setError: (v: string | null) => void,
  setPreviewFolderFileCount: (v: number) => void
) => {
  if (filesToUpload.length === 0) return;
  setPreviewFolderUploading(true);
  setPreviewFolderUploadSuccess(false);
  setError(null);
  setPreviewFolderFileCount(filesToUpload.length);

  try {
    const supabase = createClient();
    const cleanTitle = sanitizeName(title || "preview");
    const basePath = `previews/${cleanTitle}-${Date.now()}`;
    
    let indexFileUploaded = false;
    let indexUrl = "";

    for (const fileObj of filesToUpload) {
      const filePath = `${basePath}/${fileObj.path}`;
      const fileNameLower = fileObj.file.name.toLowerCase();
      let resolvedContentType = 'application/octet-stream';

      if (fileNameLower.endsWith('.html') || fileNameLower.endsWith('.htm')) {
        resolvedContentType = 'text/html';
      } else if (fileNameLower.endsWith('.css')) {
        resolvedContentType = 'text/css';
      } else if (fileNameLower.endsWith('.js')) {
        resolvedContentType = 'application/javascript';
      } else if (fileNameLower.endsWith('.png')) {
        resolvedContentType = 'image/png';
      } else if (fileNameLower.endsWith('.jpg') || fileNameLower.endsWith('.jpeg')) {
        resolvedContentType = 'image/jpeg';
      } else if (fileNameLower.endsWith('.svg')) {
        resolvedContentType = 'image/svg+xml';
      } else if (fileNameLower.endsWith('.webp')) {
        resolvedContentType = 'image/webp';
      } else if (fileNameLower.endsWith('.gif')) {
        resolvedContentType = 'image/gif';
      } else if (fileNameLower.endsWith('.woff')) {
        resolvedContentType = 'font/woff';
      } else if (fileNameLower.endsWith('.woff2')) {
        resolvedContentType = 'font/woff2';
      } else if (fileNameLower.endsWith('.ttf')) {
        resolvedContentType = 'font/ttf';
      } else if (fileNameLower.endsWith('.otf')) {
        resolvedContentType = 'font/otf';
      } else if (fileNameLower.endsWith('.json')) {
        resolvedContentType = 'application/json';
      }

      const { error: uploadError } = await supabase.storage
        .from('template-previews')
        .upload(filePath, fileObj.file, {
          contentType: resolvedContentType,
          cacheControl: '0',
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Lỗi upload file ${fileObj.path}: ${uploadError.message}`);
      }

      if (fileObj.path === "index.html") {
        indexFileUploaded = true;
        const { data: { publicUrl } } = supabase.storage
          .from('template-previews')
          .getPublicUrl(filePath);
        indexUrl = publicUrl;
      }
    }

    if (!indexFileUploaded) {
      const rootHtml = filesToUpload.find(f => f.path.endsWith('.html') && !f.path.includes('/'));
      if (rootHtml) {
        const filePath = `${basePath}/${rootHtml.path}`;
        const { data: { publicUrl } } = supabase.storage
          .from('template-previews')
          .getPublicUrl(filePath);
        indexUrl = publicUrl;
      } else {
        const anyHtml = filesToUpload.find(f => f.path.endsWith('.html'));
        if (anyHtml) {
          const filePath = `${basePath}/${anyHtml.path}`;
          const { data: { publicUrl } } = supabase.storage
            .from('template-previews')
            .getPublicUrl(filePath);
            indexUrl = publicUrl;
        }
      }
    }

    if (indexUrl) {
      setFormData(prev => ({ ...prev, demoUrl: indexUrl }));
      setPreviewFolderUploadSuccess(true);
    } else {
      throw new Error("Không tìm thấy tệp tin HTML chính (index.html) trong thư mục tải lên.");
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    setError(`Lỗi upload thư mục preview: ${msg}`);
  } finally {
    setPreviewFolderUploading(false);
  }
};

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload progress and loading states
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadSuccess, setImageUploadSuccess] = useState(false);
  const [zipUploading, setZipUploading] = useState(false);
  const [zipUploadSuccess, setZipUploadSuccess] = useState(false);
  const [previewFolderUploading, setPreviewFolderUploading] = useState(false);
  const [previewFolderUploadSuccess, setPreviewFolderUploadSuccess] = useState(false);

  // Dragging states
  const [isImageDragging, setIsImageDragging] = useState(false);
  const [isZipDragging, setIsZipDragging] = useState(false);
  const [isPreviewFolderDragging, setIsPreviewFolderDragging] = useState(false);
  const [previewFolderFileCount, setPreviewFolderFileCount] = useState(0);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const previewFolderInputRef = useRef<HTMLInputElement>(null);

  const handlePreviewFolderDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsPreviewFolderDragging(true);
  };

  const handlePreviewFolderDragLeave = () => {
    setIsPreviewFolderDragging(false);
  };

  const handlePreviewFolderDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsPreviewFolderDragging(false);
    try {
      const files = await getDroppedFiles(e.dataTransfer);
      const normalized = normalizePaths(files);
      if (normalized.length > 0) {
        await uploadPreviewFilesAsync(
          normalized,
          formData.title,
          setFormData,
          setPreviewFolderUploading,
          setPreviewFolderUploadSuccess,
          setError,
          setPreviewFolderFileCount
        );
      } else {
        setError("Thư mục trống hoặc không hợp lệ.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Lỗi đọc tập tin: ${msg}`);
    }
  };

  const handlePreviewFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const filesToUpload: FileToUpload[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const path = file.webkitRelativePath || file.name;
      filesToUpload.push({ file, path });
    }

    const normalized = normalizePaths(filesToUpload);
    uploadPreviewFilesAsync(
      normalized,
      formData.title,
      setFormData,
      setPreviewFolderUploading,
      setPreviewFolderUploadSuccess,
      setError,
      setPreviewFolderFileCount
    );
  };

  const handleImageDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsImageDragging(true);
  };

  const handleImageDragLeave = () => {
    setIsImageDragging(false);
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsImageDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext && ['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
        handleImageFileChange(file);
      } else {
        setError("Chỉ chấp nhận ảnh dạng .png, .jpg, .jpeg, .webp");
      }
    }
  };

  const handleZipDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsZipDragging(true);
  };

  const handleZipDragLeave = () => {
    setIsZipDragging(false);
  };

  const handleZipDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsZipDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.name.endsWith(".zip")) {
        handleZipFileChange(file);
      } else {
        setError("Chỉ chấp nhận tệp tin dạng .zip");
      }
    }
  };

  const [formData, setFormData] = useState<ProductFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    categoryId: initialData?.categoryId || categories[0]?.id || "",
    imageUrl: initialData?.imageUrl || "",
    isActive: initialData?.isActive ?? true,
    demoUrl: initialData?.demoUrl || "",
    sourceCodeUrl: initialData?.sourceCodeUrl || "",
    techStack: initialData?.techStack?.join(", ") || "Next.js 15, Tailwind 4, GSAP",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Image Drag-and-Drop / File Upload
  const handleImageFileChange = async (file: File) => {
    if (!file) return;
    setImageUploading(true);
    setImageUploadSuccess(false);
    setError(null);

    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() || 'jpg';
      const cleanTitle = sanitizeName(formData.title || "preview");
      const filePath = `previews/${cleanTitle}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('template-assets')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('template-assets')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
      setImageUploadSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Lỗi upload ảnh bìa: ${msg}`);
    } finally {
      setImageUploading(false);
    }
  };

  // Source Code Zip File Upload
  const handleZipFileChange = async (file: File) => {
    if (!file) return;
    setZipUploading(true);
    setZipUploadSuccess(false);
    setError(null);

    try {
      const supabase = createClient();
      const cleanTitle = sanitizeName(formData.title || "template");
      const fileName = `lumina-${cleanTitle}-${Date.now()}.zip`;

      const { error: uploadError } = await supabase.storage
        .from('template-assets')
        .upload(fileName, file, {
          upsert: true,
          contentType: 'application/zip'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('template-assets')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, sourceCodeUrl: publicUrl }));
      setZipUploadSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Lỗi upload file mã nguồn: ${msg}`);
    } finally {
      setZipUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Transform comma-separated tech stack tags into string[] array
    const parsedTechStack = formData.techStack
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const payload: CreateProductDTO | UpdateProductDTO = {
      title: formData.title,
      description: formData.description,
      price: formData.price,
      categoryId: formData.categoryId,
      imageUrl: formData.imageUrl,
      isActive: formData.isActive,
      demoUrl: formData.demoUrl,
      sourceCodeUrl: formData.sourceCodeUrl,
      techStack: parsedTechStack,
      stock: 999999, // Enforce infinite digital stock
    };

    let result;
    if (initialData?.id) {
      result = await updateProductAction(initialData.id, payload as UpdateProductDTO);
    } else {
      result = await createProductAction(payload as CreateProductDTO);
    }
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/admin/products");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-manrope">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Title */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Tên Template *</label>
          <input
            required
            name="title"
            disabled={loading}
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 focus:border-[#0051d5] rounded-xl outline-none text-xs font-semibold bg-white disabled:bg-slate-50 disabled:text-slate-400"
            placeholder="Ví dụ: Lumina Creative Editorial Portfolio"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Danh mục *</label>
          <select
            name="categoryId"
            disabled={loading}
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 focus:border-[#0051d5] rounded-xl outline-none text-xs font-semibold bg-white disabled:bg-slate-50 disabled:text-slate-400"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Basic Price */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Đơn giá bản quyền (VND) *</label>
          <input
            required
            type="number"
            name="price"
            disabled={loading}
            value={formData.price}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 focus:border-[#0051d5] rounded-xl outline-none text-xs font-semibold bg-white disabled:bg-slate-50 disabled:text-slate-400"
            placeholder="Ví dụ: 250000"
          />
        </div>

        {/* Tech Stack Tags */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Công nghệ tích hợp (Cách nhau bằng dấu phẩy) *</label>
          <input
            required
            name="techStack"
            disabled={loading}
            value={formData.techStack}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 focus:border-[#0051d5] rounded-xl outline-none text-xs font-semibold bg-white disabled:bg-slate-50 disabled:text-slate-400"
            placeholder="Next.js 15, Tailwind 4, GSAP, Framer Motion"
          />
        </div>

        {/* Demo URL */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Link Live Demo URL *</label>
          <input
            required
            name="demoUrl"
            disabled={loading}
            value={formData.demoUrl}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 focus:border-[#0051d5] rounded-xl outline-none text-xs font-semibold bg-white disabled:bg-slate-50 disabled:text-slate-400"
            placeholder="Ví dụ: https://demo.luminashop.vn/my-template hoặc link Stitch public preview"
          />
        </div>

        {/* Static Preview Folder Drag-and-Drop */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Tải lên thư mục Preview tĩnh (HTML/CSS/JS) *</label>
          <input
            type="file"
            ref={previewFolderInputRef}
            multiple
            className="hidden"
            onChange={handlePreviewFolderSelect}
            {...{ webkitdirectory: "true", directory: "" }}
          />
          <div
            onClick={() => previewFolderInputRef.current?.click()}
            onDragOver={handlePreviewFolderDragOver}
            onDragLeave={handlePreviewFolderDragLeave}
            onDrop={handlePreviewFolderDrop}
            className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[96px] text-center ${
              isPreviewFolderDragging
                ? "border-[#0051d5] bg-blue-50/50"
                : "border-slate-200 hover:border-[#0051d5] bg-white"
            }`}
          >
            {previewFolderUploading ? (
              <div className="flex flex-col items-center gap-1">
                <Loader2 className="h-6 w-6 text-[#0051d5] animate-spin" />
                <span className="text-[10px] font-bold text-slate-500">Đang tải lên thư mục ({previewFolderFileCount} files)...</span>
              </div>
            ) : previewFolderUploadSuccess || formData.demoUrl ? (
              <div className="flex flex-col items-center gap-1">
                <CheckCircle className="h-6 w-6 text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-800">Thư mục preview đã tải lên</span>
                <span className="text-[9px] text-[#999] break-all max-w-[200px] overflow-hidden whitespace-nowrap text-ellipsis">{formData.demoUrl}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <UploadCloud className="h-6 w-6 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-600">Chọn hoặc kéo thả thư mục chứa index.html</span>
                <span className="text-[9px] text-slate-400">Tự động cấu hình MIME-types tĩnh</span>
              </div>
            )}
          </div>
        </div>

        {/* Source Code File Drag-and-Drop */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Mã nguồn dạng nén (.zip) *</label>
          <input
            type="file"
            ref={zipInputRef}
            accept=".zip"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleZipFileChange(file);
            }}
          />
          <div
            onClick={() => zipInputRef.current?.click()}
            onDragOver={handleZipDragOver}
            onDragLeave={handleZipDragLeave}
            onDrop={handleZipDrop}
            className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[96px] text-center ${
              isZipDragging
                ? "border-[#0051d5] bg-blue-50/50"
                : "border-slate-200 hover:border-[#0051d5] bg-white"
            }`}
          >
            {zipUploading ? (
              <div className="flex flex-col items-center gap-1">
                <Loader2 className="h-6 w-6 text-[#0051d5] animate-spin" />
                <span className="text-[10px] font-bold text-slate-500">Đang truyền tải tệp tin .zip...</span>
              </div>
            ) : zipUploadSuccess || formData.sourceCodeUrl ? (
              <div className="flex flex-col items-center gap-1">
                <CheckCircle className="h-6 w-6 text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-800">Tệp zip đã được kết nối</span>
                <span className="text-[9px] text-[#999] break-all max-w-[200px] overflow-hidden whitespace-nowrap text-ellipsis">{formData.sourceCodeUrl}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <FileArchive className="h-6 w-6 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-600">Chọn hoặc kéo thả tệp mã nguồn (.zip)</span>
                <span className="text-[9px] text-slate-400">Đặt tên: lumina-[name]-[timestamp].zip</span>
              </div>
            )}
          </div>
        </div>

        {/* Image Drag-and-Drop Dropzone & Preview URL */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Hình ảnh ảnh bìa preview *</label>
          <input
            type="file"
            ref={imageInputRef}
            accept=".png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageFileChange(file);
            }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div
              onClick={() => imageInputRef.current?.click()}
              onDragOver={handleImageDragOver}
              onDragLeave={handleImageDragLeave}
              onDrop={handleImageDrop}
              className={`sm:col-span-8 border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[120px] text-center ${
                isImageDragging
                  ? "border-[#0051d5] bg-blue-50/50"
                  : "border-slate-200 hover:border-[#0051d5] bg-white"
              }`}
            >
              {imageUploading ? (
                <div className="flex flex-col items-center gap-1">
                  <Loader2 className="h-8 w-8 text-[#0051d5] animate-spin" />
                  <span className="text-[10px] font-bold text-slate-500">Đang truyền tải ảnh bìa lên đám mây...</span>
                </div>
              ) : imageUploadSuccess || formData.imageUrl ? (
                <div className="flex flex-col items-center gap-1">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-800">Ảnh bìa đã tải lên thành công</span>
                  <span className="text-[9px] text-[#999] break-all max-w-[300px] overflow-hidden whitespace-nowrap text-ellipsis">{formData.imageUrl}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <UploadCloud className="h-8 w-8 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-600">Chọn hoặc thả ảnh preview (.png, .jpg, .webp)</span>
                  <span className="text-[9px] text-slate-400">File dung lượng tối đa 10MB</span>
                </div>
              )}
            </div>

            {/* Live Thumbnail Preview */}
            <div className="sm:col-span-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden min-h-[120px] relative shadow-inner">
              {formData.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formData.imageUrl}
                  alt="Ảnh bìa preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1 text-[#bbb]">
                  <ImageIcon size={28} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">No Preview</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Mô tả tính năng chi tiết *</label>
          <textarea
            required
            name="description"
            disabled={loading}
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-3 border border-slate-200 focus:border-[#0051d5] rounded-xl outline-none text-xs font-semibold bg-white resize-none disabled:bg-slate-50 disabled:text-slate-400"
            placeholder="Mô tả các tính năng chính, hiệu ứng GSAP nổi bật, hướng dẫn cấu hình môi trường..."
          />
        </div>

        {/* Status Toggle */}
        <div className="md:col-span-2 flex items-center gap-3 py-2">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            disabled={loading}
            checked={formData.isActive}
            onChange={handleCheckboxChange}
            className="h-4 w-4 rounded border-slate-300 text-[#0051d5] focus:ring-[#0051d5] cursor-pointer disabled:cursor-not-allowed"
          />
          <label htmlFor="isActive" className="text-xs font-bold text-slate-700 select-none cursor-pointer disabled:text-slate-400">
            Cho phép hiển thị bán công khai trên chợ giao diện (Active)
          </label>
        </div>

      </div>

      <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => router.back()}
          className="px-6 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-xs font-bold text-slate-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-[#0051d5] hover:bg-[#0041ac] text-white rounded-xl transition-all shadow-md shadow-blue-900/10 text-xs font-bold active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : "Lưu Template số"}
        </button>
      </div>
    </form>
  );
}
