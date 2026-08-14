'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProductCategory, ProductStatus } from '@/types';
import { saveProduct, uploadFileToStorage } from '@/lib/storageService';
import { ArrowLeft, Save, Upload, FileText, Loader2, Image as ImageIcon, Check, FolderArchive } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProductCategory>('templates');
  const [price, setPrice] = useState<number>(49);
  const [tagsInput, setTagsInput] = useState('React, Tailwind, Next.js');
  const [status, setStatus] = useState<ProductStatus>('published');
  const [thumbnailUrl, setThumbnailUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');
  const [fileUrl, setFileUrl] = useState('');
  const [promptContent, setPromptContent] = useState('');

  // THUMBNAIL FILE UPLOAD HANDLER
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    const url = await uploadFileToStorage(file, 'thumbnails');
    setThumbnailUrl(url);
    setUploadingThumbnail(false);
  };

  // ZIP FILE UPLOAD HANDLER
  const handleProductFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const url = await uploadFileToStorage(file, 'products');
    setFileUrl(url);
    setUploadingFile(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    await saveProduct({
      title,
      description,
      category,
      price: Number(price),
      tags: tagsArray,
      thumbnailUrl,
      fileUrl: fileUrl.trim().length > 0 ? fileUrl : undefined,
      promptContent: promptContent.trim().length > 0 ? promptContent : undefined,
      status
    });

    setLoading(false);
    router.push('/admin/products');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/products" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Products Catalog
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Upload New Digital Product</h1>
          <p className="text-slate-400 text-xs mt-0.5">Attach a downloadable ZIP and/or Master Prompt text to this asset</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0e121e] border border-white/10 rounded-2xl p-6 space-y-6">
        
        {/* TITLE & CATEGORY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">Product Title *</label>
            <input 
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Solaris 3D Digital Agency Template"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400"
            >
              <option value="prompts">Master AI Prompts</option>
              <option value="templates">Website Templates</option>
              <option value="dashboards">Dashboard UI Kits</option>
              <option value="3d-heroes">3D Hero Animations</option>
            </select>
          </div>
        </div>

        {/* PRICE, STATUS & TAGS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">Price ($ USD) *</label>
            <input 
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400"
            >
              <option value="published">Published (Live on store)</option>
              <option value="draft">Draft (Private admin only)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">Tags (Comma-separated)</label>
            <input 
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="React, Three.js, Next.js"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">Product Description *</label>
          <textarea 
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed features, tech stack specs, and included files list..."
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400 resize-none"
          />
        </div>

        {/* THUMBNAIL IMAGE UPLOAD */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
          <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider">
            Thumbnail / Preview Image
          </label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-14 rounded-lg bg-slate-900 overflow-hidden border border-white/10 flex-shrink-0">
              {thumbnailUrl ? (
                <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono text-[9px]">NO PREVIEW</div>
              )}
            </div>
            
            <div className="flex-1 space-y-2">
              <input 
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="Image URL or upload file below..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-400"
              />
              <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 border border-white/10 text-slate-300 text-xs cursor-pointer">
                {uploadingThumbnail ? <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <Upload className="w-3.5 h-3.5" />}
                <span>{uploadingThumbnail ? 'Uploading Image...' : 'Upload Image File'}</span>
                <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* MASTER PROMPT MARKDOWN TEXT CONTENT */}
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-mono text-purple-300 uppercase tracking-wider">
              Master Prompt Markdown Text Content (Optional)
            </label>
            <span className="text-[10px] font-mono text-slate-400">Enables &ldquo;Copy Prompt&rdquo; on card</span>
          </div>
          <textarea 
            rows={5}
            value={promptContent}
            onChange={(e) => setPromptContent(e.target.value)}
            placeholder="Paste system instructions, prompt parameters, and prompt markdown here..."
            className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 font-mono text-xs text-purple-200 outline-none focus:border-purple-400"
          />
        </div>

        {/* ATTACHED SOURCE CODE ZIP PACKAGE (OPTIONAL) */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-mono text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <FolderArchive className="w-3.5 h-3.5" /> Downloadable Source Code ZIP Package (Optional)
            </label>
            <span className="text-[10px] font-mono text-slate-400">Enables &ldquo;ZIP Download&rdquo; on card</span>
          </div>
          <div className="space-y-2">
            <input 
              type="text"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="e.g. /downloads/my-template.zip or upload below..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400"
            />
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 text-xs cursor-pointer">
              {uploadingFile ? <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <Upload className="w-3.5 h-3.5" />}
              <span>{uploadingFile ? 'Uploading ZIP File...' : 'Upload Asset ZIP Package'}</span>
              <input type="file" accept=".zip,.tar,.gz,.json,.txt,.md" onChange={handleProductFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
          <Link href="/admin/products" className="px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 text-xs font-semibold">
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-400/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Product...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Publish Product Asset
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
