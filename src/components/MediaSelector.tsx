import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { db } from "@/services/db";
import type { Media } from "@/types";
import { useEffect, useState } from "react";

interface MediaSelectorProps {
  onSelect: (media: Media) => void;
  trigger?: React.ReactNode;
}

export default function MediaSelector({ onSelect, trigger }: MediaSelectorProps) {
  const [open, setOpen] = useState(false);
  const [mediaList, setMediaList] = useState<Media[]>([]);

  useEffect(() => {
    if (open) {
      setMediaList(db.media.getAll());
    }
  }, [open]);

  const handleSelect = (item: Media) => {
    onSelect(item);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <button className="ts-button is-secondary is-small">選擇媒體</button>}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>選擇媒體</DialogTitle>
        </DialogHeader>
        
        {mediaList.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
                尚無媒體，請先至「媒體庫」上傳。
            </div>
        ) : (
            <div className="grid grid-cols-4 gap-4 p-4">
            {mediaList.map((item) => (
                <div 
                    key={item.id} 
                    className="border rounded p-2 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    onClick={() => handleSelect(item)}
                >
                    <div className="aspect-square bg-gray-100 mb-2 overflow-hidden flex items-center justify-center">
                        <img src={item.data} alt={item.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="text-xs truncate text-center">{item.name}</div>
                </div>
            ))}
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
