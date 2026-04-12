"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera, Plus, X } from "lucide-react";

interface Photo {
  id: string;
  imageUrl: string;
  week: number | null;
  note: string;
  date: string;
}

export default function BumpDiaryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [week, setWeek] = useState("");
  const [note, setNote] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  function addPhoto() {
    if (!previewUrl) return;
    const newPhoto: Photo = {
      id: Date.now().toString(),
      imageUrl: previewUrl,
      week: week ? parseInt(week) : null,
      note,
      date: new Date().toLocaleDateString("en-GB"),
    };
    setPhotos(prev => [newPhoto, ...prev]);
    setShowForm(false);
    setWeek("");
    setNote("");
    setPreviewUrl(null);
  }

  function removePhoto(id: string) {
    setPhotos(prev => prev.filter(p => p.id !== id));
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Bump diary</h1>
          <p className="text-muted-foreground">Document your pregnancy week by week</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add photo
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="border border-border rounded-xl p-6 bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">New bump photo</h2>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <Label>Photo</Label>
            <label className="block">
              {previewUrl ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview" className="w-full h-56 object-cover rounded-xl" />
                  <button
                    onClick={() => setPreviewUrl(null)}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors">
                  <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Click to upload a photo</span>
                  <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                </div>
              )}
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="week">Week of pregnancy</Label>
              <Input
                id="week"
                type="number"
                min="1"
                max="42"
                placeholder="e.g. 20"
                value={week}
                onChange={e => setWeek(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="How are you feeling? Any milestones?"
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={addPhoto} disabled={!previewUrl} className="flex-1">
              Save photo
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Gallery */}
      {photos.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
          <Camera className="w-16 h-16 mx-auto mb-4 text-primary/30" />
          <p className="text-lg font-medium mb-1">Start your bump diary</p>
          <p className="text-sm mb-6">Capture your bump week by week — a beautiful memory to look back on</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add your first photo
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative rounded-xl overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.imageUrl} alt={`Week ${photo.week}`} className="w-full h-64 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                {photo.week && (
                  <span className="text-sm font-bold">Week {photo.week}</span>
                )}
                {photo.note && (
                  <p className="text-xs text-white/80 mt-0.5 line-clamp-2">{photo.note}</p>
                )}
                <p className="text-xs text-white/60 mt-1">{photo.date}</p>
              </div>
              <button
                onClick={() => removePhoto(photo.id)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
