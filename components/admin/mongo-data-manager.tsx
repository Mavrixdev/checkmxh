'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Braces,
  Copy,
  Database,
  Download,
  Edit3,
  FileJson,
  Filter,
  Layers,
  Plus,
  RefreshCw,
  Rows3,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMongoCollections, useMongoDocuments } from '@/hooks/useAdminData';
import {
  createMongoDocument,
  deleteMongoDocument,
  exportMongoDocuments,
  updateMongoDocument,
} from '@/lib/api';
import { formatDate } from '@/lib/utils-dashboard';
import { MongoDocument } from '@/types';

const toPrettyJson = (value: unknown) => JSON.stringify(value, null, 2);

const getDocumentId = (document: MongoDocument | null) => {
  if (!document || document._id === undefined || document._id === null) return '';
  return String(document._id);
};

const getDocumentLabel = (document: MongoDocument) => {
  return String(
    document.phone ||
      document.name ||
      document.username ||
      document._id ||
      'document',
  );
};

const summarizeValue = (value: unknown) => {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (typeof value === 'object') return `Object(${Object.keys(value as object).length})`;
  const text = String(value);
  return text.length > 42 ? `${text.slice(0, 42)}...` : text;
};

const getSummaryFields = (document: MongoDocument) => {
  return Object.entries(document)
    .filter(([key]) => key !== '_id')
    .slice(0, 5);
};

const downloadJson = (filename: string, data: unknown) => {
  const blob = new Blob([toPrettyJson(data)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export function MongoDataManager() {
  const queryClient = useQueryClient();
  const { data: collectionsData, isLoading: collectionsLoading, refetch: refetchCollections } = useMongoCollections();
  const collections = collectionsData?.collections ?? [];

  const [collection, setCollection] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [quickSearch, setQuickSearch] = useState('');
  const [filterDraft, setFilterDraft] = useState('');
  const [filterApplied, setFilterApplied] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<MongoDocument | null>(null);
  const [editorText, setEditorText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (collection || collections.length === 0) return;
    const preferred = collections.find((item) => item.name === 'lookups') || collections[0];
    setCollection(preferred.name);
  }, [collection, collections]);

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      q: quickSearch.trim() || undefined,
      filter: filterApplied || undefined,
    }),
    [filterApplied, limit, page, quickSearch],
  );

  const {
    data: documentsData,
    isLoading: documentsLoading,
    isFetching: documentsFetching,
    refetch: refetchDocuments,
  } = useMongoDocuments(collection, queryParams);

  const documents = documentsData?.documents ?? [];
  const selectedId = getDocumentId(selectedDocument);

  useEffect(() => {
    if (isEditing || isCreating) return;
    if (documents.length === 0) {
      setSelectedDocument(null);
      setEditorText('');
      return;
    }

    const stillVisible = selectedId
      ? documents.find((document) => getDocumentId(document) === selectedId)
      : null;
    const next = stillVisible || documents[0];
    setSelectedDocument(next);
    setEditorText(toPrettyJson(next));
  }, [documents, isCreating, isEditing, selectedId]);

  const resetPaging = () => setPage(1);

  const handleCollectionChange = (nextCollection: string) => {
    setCollection(nextCollection);
    setSelectedDocument(null);
    setEditorText('');
    setIsEditing(false);
    setIsCreating(false);
    resetPaging();
  };

  const handleApplyFilter = () => {
    const trimmed = filterDraft.trim();
    if (!trimmed) {
      setFilterApplied('');
      resetPaging();
      return;
    }

    try {
      JSON.parse(trimmed);
      setFilterApplied(trimmed);
      resetPaging();
    } catch (error) {
      toast.error('JSON filter không hợp lệ');
    }
  };

  const handleCopy = async (text: string, label = 'Đã copy') => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(label);
    } catch (error) {
      toast.error('Không copy được vào clipboard');
    }
  };

  const handleSelectDocument = (document: MongoDocument) => {
    setSelectedDocument(document);
    setEditorText(toPrettyJson(document));
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleCreate = () => {
    const blank = collection === 'lookups'
      ? { phone: '', createdAt: new Date().toISOString() }
      : {};
    setSelectedDocument(null);
    setEditorText(toPrettyJson(blank));
    setIsEditing(true);
    setIsCreating(true);
  };

  const handleDuplicate = (document: MongoDocument) => {
    const clone = { ...document };
    delete clone._id;
    setSelectedDocument(null);
    setEditorText(toPrettyJson(clone));
    setIsEditing(true);
    setIsCreating(true);
  };

  const invalidateDocuments = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['mongo-documents'] }),
      queryClient.invalidateQueries({ queryKey: ['mongo-collections'] }),
      queryClient.invalidateQueries({ queryKey: ['latest'] }),
      queryClient.invalidateQueries({ queryKey: ['stats'] }),
    ]);
  };

  const handleSave = async () => {
    if (!collection) return;
    setIsSaving(true);

    try {
      const parsed = JSON.parse(editorText);
      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
        throw new Error('Document phai la JSON object');
      }

      const result = isCreating
        ? await createMongoDocument(collection, parsed)
        : await updateMongoDocument(collection, selectedId, parsed);

      setSelectedDocument(result.data);
      setEditorText(toPrettyJson(result.data));
      setIsEditing(false);
      setIsCreating(false);
      await invalidateDocuments();
      toast.success(isCreating ? 'Đã tạo' : 'Đã lưu');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || error?.message || 'Không lưu được');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (document: MongoDocument) => {
    const id = getDocumentId(document);
    if (!collection || !id) return;
    if (!window.confirm(`Bạn có chắc muốn xóa bản ghi này?`)) return;

    setIsDeleting(true);
    try {
      await deleteMongoDocument(collection, id);
      setSelectedDocument(null);
      setEditorText('');
      setIsEditing(false);
      setIsCreating(false);
      await invalidateDocuments();
      toast.success('Đã xóa');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Không xóa được');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async () => {
    if (!collection) return;
    try {
      const data = await exportMongoDocuments(collection, queryParams);
      downloadJson(`${collection}_export.json`, data);
      toast.success(`Đã xuất ${data.length} document`);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Không xuất được dữ liệu');
    }
  };

  const totalPages = documentsData?.totalPages ?? 1;
  const total = documentsData?.total ?? 0;
  const activeCollection = collections.find((item) => item.name === collection);
  const hasActiveFilters = Boolean(quickSearch.trim() || filterApplied);
  const visibleStart = (Math.max(page - 1, 0) * limit) + (documents.length ? 1 : 0);
  const visibleEnd = Math.max((page - 1) * limit + documents.length, 0);

  return (
    <Card className="overflow-hidden rounded-md border border-slate-800/80 bg-slate-950/55 p-0 shadow-none">
      <div className="border-b border-slate-800/80 bg-slate-900/35 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-white">
              <Database className="h-5 w-5 text-cyan-400" />
              <h3 className="text-lg font-semibold">MongoDB Data Manager</h3>
              {documentsFetching && <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline" className="border-slate-700 bg-slate-950/50 text-slate-300">
                DB: {collectionsData?.database || 'Không xác định'}
              </Badge>
              {activeCollection ? (
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-200">
                  {activeCollection.name}: {activeCollection.count} docs
                </Badge>
              ) : null}
              {hasActiveFilters ? (
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-200">
                  filter active
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchCollections();
                refetchDocuments();
              }}
              className="h-9 border-slate-700/70 bg-slate-950/40 text-slate-200 hover:border-cyan-500 hover:bg-cyan-500/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tải lại
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={!collection || documentsLoading}
              className="h-9 border-slate-700/70 bg-slate-950/40 text-slate-200 hover:border-emerald-500 hover:bg-emerald-500/10"
            >
              <Download className="mr-2 h-4 w-4" />
              Xuất JSON
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={!collection}
              className="h-9 bg-cyan-500 text-white hover:bg-cyan-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tạo mới
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-b border-slate-800/80 p-4 sm:p-5 xl:grid-cols-[minmax(220px,280px)_minmax(0,1fr)]">
        <div className="rounded-md border border-slate-800 bg-slate-950/40 p-3">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-200">
            <Layers className="h-4 w-4 text-emerald-300" />
            Collections
          </div>
          <div className="space-y-2">
            {collectionsLoading ? (
              <>
                <Skeleton className="h-9 bg-slate-800/60" />
                <Skeleton className="h-9 bg-slate-800/60" />
              </>
            ) : (
              collections.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleCollectionChange(item.name)}
                  className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition ${
                    collection === item.name
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
                      : 'border-slate-800 bg-slate-900/35 text-slate-300 hover:border-slate-700 hover:bg-slate-900/70'
                  }`}
                >
                  <span className="truncate">{item.name}</span>
                  <span className="ml-3 rounded bg-slate-950/60 px-2 py-0.5 font-mono text-xs text-slate-400">
                    {item.count}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_120px]">
            <div className="space-y-2">
              <Label className="text-slate-300">Tìm nhanh</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  value={quickSearch}
                  onChange={(event) => {
                    setQuickSearch(event.target.value);
                    resetPaging();
                  }}
                  placeholder="Phone, _id, tên, username..."
                  className="border-slate-700 bg-slate-950/70 pl-9 text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Mỗi trang</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={limit}
                onChange={(event) => {
                  setLimit(Math.max(1, Math.min(100, Number(event.target.value) || 20)));
                  resetPaging();
                }}
                className="border-slate-700 bg-slate-950/70 text-slate-100"
              />
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-300">
                <Filter className="h-4 w-4 text-amber-300" />
                JSON filter
              </Label>
              <Textarea
                value={filterDraft}
                onChange={(event) => setFilterDraft(event.target.value)}
                placeholder='{"phone":"0987654321"}'
                className="min-h-20 border-slate-700 bg-slate-950/70 font-mono text-xs text-slate-100"
              />
            </div>
            <div className="flex gap-2 lg:flex-col lg:justify-end">
              <Button
                variant="outline"
                onClick={handleApplyFilter}
                className="flex-1 border-slate-700/70 bg-slate-950/40 text-slate-200 hover:border-cyan-500 hover:bg-cyan-500/10 lg:flex-none"
              >
                Áp dụng
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFilterDraft('');
                  setFilterApplied('');
                  resetPaging();
                }}
                className="flex-1 border-slate-700/70 bg-slate-950/40 text-slate-200 hover:border-red-500 hover:bg-red-500/10 lg:flex-none"
              >
                Xóa lọc 
              </Button>
            </div>
          </div>

          {activeCollection?.sampleFields?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {activeCollection.sampleFields.slice(0, 12).map((field) => (
                <Badge key={field} variant="outline" className="border-slate-700 bg-slate-900/45 text-slate-400">
                  {field}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_520px]">
        <div className="min-w-0 overflow-hidden rounded-md border border-slate-800/80">
          <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40 px-3 py-2 text-sm">
            <span className="flex items-center gap-2 text-slate-300">
              <Rows3 className="h-4 w-4 text-cyan-300" />
              {total} documents
            </span>
            <span className="text-slate-500">
              Page {documentsData?.page || page}/{totalPages}
            </span>
          </div>

          <div className="max-h-[640px] overflow-auto">
            {documentsLoading || collectionsLoading ? (
              <div className="space-y-3 p-3">
                {[1, 2, 3, 4].map((item) => (
                  <Skeleton key={item} className="h-20 bg-slate-800/60" />
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="flex min-h-48 items-center justify-center text-sm text-slate-500">
                Không có document
              </div>
            ) : (
              <table className="w-full min-w-[760px] text-sm">
                <thead className="sticky top-0 z-10 bg-slate-950">
                  <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2 font-medium">Document</th>
                    <th className="px-3 py-2 font-medium">Thông số</th>
                    <th className="px-3 py-2 font-medium">Thời gian</th>
                    <th className="px-3 py-2 text-right font-medium">Công cụ</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((document, index) => {
                    const id = getDocumentId(document);
                    const isSelected = id && id === selectedId;

                    return (
                      <tr
                        key={id || `${collection}-${page}-${index}`}
                        className={`border-b border-slate-800/80 transition-colors ${
                          isSelected ? 'bg-cyan-500/10 shadow-[inset_3px_0_0_rgba(34,211,238,0.9)]' : 'hover:bg-slate-900/45'
                        }`}
                      >
                        <td className="max-w-[260px] px-3 py-3 align-top">
                          <button
                            type="button"
                            onClick={() => handleSelectDocument(document)}
                            className="block w-full text-left"
                          >
                            <div className="truncate font-medium text-cyan-300">{getDocumentLabel(document)}</div>
                            <div className="mt-1 truncate font-mono text-xs text-slate-500">{id || 'no _id'}</div>
                          </button>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <div className="flex max-w-[360px] flex-wrap gap-1.5">
                            {getSummaryFields(document).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="border-slate-700 bg-slate-950/35 text-slate-300">
                                {key}: {summarizeValue(value)}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 align-top text-xs text-slate-500">
                          {document.createdAt ? formatDate(String(document.createdAt)) : 'Không xác định'}
                        </td>
                        <td className="px-3 py-3 align-top">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopy(toPrettyJson(document), 'Da copy full JSON')}
                              className="h-8 w-8 text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-300"
                              title="Copy full JSON"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDuplicate(document)}
                              className="h-8 w-8 text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                              title="Nhan ban"
                            >
                              <FileJson className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(document)}
                              disabled={isDeleting}
                              className="h-8 w-8 text-slate-400 hover:bg-red-500/10 hover:text-red-300"
                              title="Xoa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-950/40 px-3 py-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || documentsLoading}
              className="border-slate-700/70 bg-slate-950/40 text-slate-200"
            >
              Trước
            </Button>
            <span className="text-xs text-slate-500">
              {visibleStart} - {visibleEnd}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages || documentsLoading}
              className="border-slate-700/70 bg-slate-950/40 text-slate-200"
            >
              Sau
            </Button>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-md border border-slate-800/80 bg-slate-950/35">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 px-3 py-3">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <Braces className="h-4 w-4 shrink-0 text-emerald-300" />
                <div className="truncate text-sm font-medium text-white">
                  {isCreating ? 'Document mới' : selectedDocument ? getDocumentLabel(selectedDocument) : 'Chưa chọn document'}
                </div>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="truncate font-mono text-xs text-slate-500">
                  {isCreating ? collection : selectedId || 'Không xác định'}
                </span>
                <Badge variant="outline" className={`border-slate-700 text-xs ${isEditing ? 'bg-amber-500/10 text-amber-200' : 'bg-emerald-500/10 text-emerald-200'}`}>
                  {isEditing ? 'editing' : 'readonly'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                disabled={!editorText}
                onClick={() => handleCopy(editorText, 'Da copy full JSON')}
                className="h-8 w-8 text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-300"
                title="Copy full JSON"
              >
                <Copy className="h-4 w-4" />
              </Button>
              {isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsEditing(false);
                      setIsCreating(false);
                      setEditorText(selectedDocument ? toPrettyJson(selectedDocument) : '');
                    }}
                    className="h-8 w-8 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                    title="Huy"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-8 w-8 text-cyan-300 hover:bg-cyan-500/10"
                    title="Luu"
                  >
                    {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!selectedDocument}
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 text-slate-400 hover:bg-yellow-500/10 hover:text-yellow-300"
                  title="Sua"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {isEditing ? (
            <Textarea
              value={editorText}
              onChange={(event) => setEditorText(event.target.value)}
              spellCheck={false}
              className="h-[640px] resize-none rounded-none border-0 bg-transparent font-mono text-xs leading-5 text-slate-100 focus-visible:ring-0"
            />
          ) : (
            <pre className="h-[640px] overflow-auto p-3 text-xs leading-5 text-slate-200">
              {editorText || 'Chọn một document để xem đầy đủ JSON'}
            </pre>
          )}
        </div>
      </div>
    </Card>
  );
}
