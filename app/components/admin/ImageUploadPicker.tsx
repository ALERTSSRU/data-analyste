'use client';

import { uploadPortfolioImage } from '@/lib/upload';
import { FileImage, Link as LinkIcon, Loader2, Plus, Trash2, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';

interface SingleImagePickerProps {
  multiple?: false;
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
}

interface MultiImagePickerProps {
  multiple: true;
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  helperText?: string;
}

type ImageUploadPickerProps = SingleImagePickerProps | MultiImagePickerProps;

export function ImageUploadPicker(props: ImageUploadPickerProps) {
  const { multiple, label = 'Image', helperText } = props;
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      if (multiple) {
        const currentUrls = [...props.value];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file.type.startsWith('image/')) continue;
          const url = await uploadPortfolioImage(file);
          currentUrls.push(url);
        }
        props.onChange(currentUrls);
      } else {
        const file = files[0];
        if (file && file.type.startsWith('image/')) {
          const url = await uploadPortfolioImage(file);
          props.onChange(url);
        }
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const removeSingleImage = () => {
    if (!multiple) {
      props.onChange('');
    }
  };

  const removeMultiImage = (index: number) => {
    if (multiple) {
      const updated = props.value.filter((_, i) => i !== index);
      props.onChange(updated);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
          <FileImage className="w-3.5 h-3.5 text-cyan-400" />
          <span>{label}</span>
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 font-medium"
        >
          {showUrlInput ? (
            <>
              <UploadCloud className="w-3 h-3" />
              <span>Parcourir mes fichiers</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-3 h-3" />
              <span>Saisir une URL</span>
            </>
          )}
        </button>
      </div>

      {helperText && <p className="text-[11px] text-slate-400 font-normal">{helperText}</p>}

      {/* Manual URL input fallback if toggled */}
      {showUrlInput && (
        <div className="p-3 rounded-2xl border border-slate-800 bg-[#090d1a] space-y-2">
          {!multiple ? (
            <input
              type="text"
              value={props.value || ''}
              onChange={(e) => props.onChange(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          ) : (
            <div className="space-y-2">
              {props.value.map((url, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => {
                      const updated = [...props.value];
                      updated[idx] = e.target.value;
                      props.onChange(updated);
                    }}
                    placeholder="https://..."
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeMultiImage(idx)}
                    className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => props.onChange([...props.value, ''])}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une URL de capture</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* File Dropzone & Explorer */}
      {!showUrlInput && (
        <div className="space-y-3">
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-2xl cursor-pointer transition ${
              dragActive
                ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
                : 'border-slate-800 bg-[#090d1a] hover:border-cyan-500/40 hover:bg-slate-900/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple={multiple}
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />

            {uploading ? (
              <div className="flex items-center gap-2.5 py-3 text-cyan-400 text-xs font-semibold">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Téléversement du fichier en cours...</span>
              </div>
            ) : (
              <div className="text-center space-y-1.5">
                <div className="w-10 h-10 mx-auto rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-sm">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">
                    Sélectionner un fichier <span className="text-cyan-400 font-semibold">sur votre appareil</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Format accepté : PNG, JPG, WEBP (Glisser-déposer disponible)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Previews display */}
          {!multiple && props.value && (
            <div className="relative rounded-2xl border border-slate-800 bg-[#090d1a] p-2.5 flex items-center gap-4">
              <img
                src={props.value}
                alt="Aperçu"
                className="w-16 h-14 object-cover rounded-xl border border-slate-800 bg-slate-950"
              />
              <div className="flex-1 truncate">
                <p className="text-xs font-bold text-slate-200 truncate">Fichier prêt</p>
                <p className="text-[10px] font-mono text-slate-400 truncate">{props.value}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSingleImage();
                }}
                className="px-3 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer</span>
              </button>
            </div>
          )}

          {multiple && props.value && props.value.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {props.value.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl border border-slate-800 bg-slate-900 p-1.5 overflow-hidden"
                >
                  <img
                    src={url}
                    alt={`Capture ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-slate-800"
                  />
                  <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 backdrop-blur-xs">
                    <button
                      type="button"
                      onClick={() => removeMultiImage(idx)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 flex items-center gap-1 shadow-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Retirer</span>
                    </button>
                  </div>
                  <span className="absolute bottom-2 left-2 bg-slate-900/90 text-[10px] text-cyan-400 font-mono font-bold px-1.5 py-0.5 rounded border border-slate-800">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
