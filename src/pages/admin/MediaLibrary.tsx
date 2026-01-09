import AdminLayout from "@/layouts/AdminLayout";
import { db } from "@/services/db";
import type { Media } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import JSZip from "jszip";

export default function MediaLibrary() {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, image, other

  const loadMedia = () => {
    setMediaList(db.media.getAll());
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const file = files[0];

    if (file.size > 500 * 1024) {
      toast.error("檔案過大，請上傳 500KB 以下的圖片");
      setIsUploading(false);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      try {
        db.media.create({
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64
        });
        toast.success("上傳成功");
        loadMedia();
      } catch (err) {
        toast.error("儲存失敗 (可能空間不足)");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (id: string) => {
    if (confirm("確定要刪除此檔案嗎？")) {
      db.media.delete(id);
      loadMedia();
      if (selectedIds.has(id)) {
          const newSet = new Set(selectedIds);
          newSet.delete(id);
          setSelectedIds(newSet);
      }
      toast.success("已刪除");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const toggleSelect = (id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedIds(newSet);
  };

  const selectAll = () => {
      // Select visible items only
      const allIds = filteredMedia.map(m => m.id);
      setSelectedIds(new Set(allIds));
  };

  const deselectAll = () => {
      setSelectedIds(new Set());
  };

  const handleBatchDelete = () => {
      if (confirm(`確定要刪除選取的 ${selectedIds.size} 個檔案嗎？`)) {
          db.media.deleteMany(Array.from(selectedIds));
          loadMedia();
          setSelectedIds(new Set());
          toast.success("批次刪除完成");
      }
  };

  const handleBatchDownload = async () => {
      const zip = new JSZip();
      const selectedMedia = mediaList.filter(m => selectedIds.has(m.id));
      
      selectedMedia.forEach(m => {
          const base64Data = m.data.split(',')[1];
          if (base64Data) {
              zip.file(m.name, base64Data, { base64: true });
          }
      });

      try {
          const content = await zip.generateAsync({ type: "blob" });
          const url = URL.createObjectURL(content);
          const a = document.createElement('a');
          a.href = url;
          a.download = `media-export-${new Date().toISOString().split('T')[0]}.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success("打包下載完成");
      } catch (e) {
          console.error(e);
          toast.error("打包失敗");
      }
  };

  // Filter Logic
  const filteredMedia = mediaList.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = filterType === "all" 
          ? true 
          : filterType === "image" 
              ? item.type.startsWith("image/") 
              : !item.type.startsWith("image/");
      return matchSearch && matchType;
  });

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div className="ts-header is-big">媒體庫</div>
        <div className="flex gap-2">
            <div className="ts-file is-primary">
                <input type="file" accept="image/*" onChange={handleUpload} disabled={isUploading} />
                {isUploading ? "上傳中..." : "上傳圖片"}
            </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="ts-box mb-6">
          <div className="ts-content">
              <div className="ts-grid is-2-columns is-relaxed">
                  <div className="column">
                      <div className="ts-input is-start-icon is-fluid">
                          <span className="ts-icon fa-solid fa-magnifying-glass"></span>
                          <input 
                              type="text" 
                              placeholder="搜尋檔名..." 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                          />
                      </div>
                  </div>
                  <div className="column">
                      <div className="ts-select is-fluid">
                          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                              <option value="all">所有類型</option>
                              <option value="image">圖片 (Images)</option>
                              <option value="other">其他 (Others)</option>
                          </select>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Batch Action Toolbar */}
      {selectedIds.size > 0 && (
          <div className="ts-box is-horizontal is-fitted mb-6 sticky top-4 z-10 shadow-md">
              <div className="ts-content is-dense">
                  <div className="ts-text is-bold">已選取 {selectedIds.size} 個項目</div>
              </div>
              <div className="ts-content is-dense flex gap-2">
                  <button className="ts-button is-secondary is-small" onClick={deselectAll}>取消全選</button>
                  <button className="ts-button is-info is-small" onClick={handleBatchDownload}>
                      <span className="ts-icon fa-solid fa-download mr-1"></span> 下載
                  </button>
                  <button className="ts-button is-negative is-small" onClick={handleBatchDelete}>
                      <span className="ts-icon fa-solid fa-trash mr-1"></span> 刪除
                  </button>
              </div>
          </div>
      )}

      {/* Select All Helper */}
      <div className="mb-4 flex justify-end">
          {filteredMedia.length > 0 && (
              <button className="ts-text is-link is-small" onClick={selectAll}>
                  選取目前顯示的 {filteredMedia.length} 個檔案
              </button>
          )}
      </div>

      {filteredMedia.length === 0 ? (
        <div className="ts-placeholder is-secondary is-dashed p-12">
          <div className="header">沒有符合條件的檔案</div>
          <div className="description">請嘗試變更搜尋條件或上傳新檔案。</div>
        </div>
      ) : (
        <div className="ts-grid is-4-columns is-relaxed is-stackable">
          {filteredMedia.map((item) => (
            <div className="column" key={item.id}>
              <div 
                className={`ts-card h-full ${selectedIds.has(item.id) ? 'is-primary' : ''}`}
                onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button')) return;
                    toggleSelect(item.id);
                }}
                style={{ cursor: 'pointer', border: selectedIds.has(item.id) ? '2px solid var(--ts-primary-500)' : '' }}
              >
                <div className="relative image is-covered" style={{ height: '150px', background: '#f0f0f0' }}>
                  <img src={item.data} alt={item.name} className="object-contain w-full h-full" />
                  <div className="absolute top-2 left-2">
                      <label className="ts-checkbox">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.has(item.id)} 
                            onChange={() => toggleSelect(item.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                      </label>
                  </div>
                </div>
                <div className="content">
                  <div className="header is-truncated" title={item.name}>{item.name}</div>
                  <div className="meta">
                    <div>{formatSize(item.size)}</div>
                    <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="actions is-fitted">
                    <button className="ts-button is-secondary is-fluid" onClick={() => {
                        navigator.clipboard.writeText(item.data);
                        toast.success("已複製 Base64 代碼");
                    }}>
                        複製
                    </button>
                    <button className="ts-button is-negative is-fluid" onClick={() => handleDelete(item.id)}>
                        刪除
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
