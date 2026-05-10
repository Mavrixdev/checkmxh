'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Copy, KeyRound, RefreshCw, Save, Settings, ShieldCheck, Wand2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useAdminSettings } from '@/hooks/useAdminData';
import { setLookupApiBaseUrl, updateAdminSettings } from '@/lib/api';
import { AppSettings } from '@/types';

const emptySettings: AppSettings = {
  site: {
    title: '',
    description: '',
    keywords: '',
    iconUrl: '',
  },
  api: {
    baseUrl: '',
    privateKey: '',
    requirePrivateKey: false,
  },
};

const randomKey = () => {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

export function SettingsPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, refetch } = useAdminSettings();
  const [form, setForm] = useState<AppSettings>(emptySettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const updateSite = (field: keyof AppSettings['site'], value: string) => {
    setForm((current) => ({
      ...current,
      site: { ...current.site, [field]: value },
    }));
  };

  const updateApi = <K extends keyof AppSettings['api']>(field: K, value: AppSettings['api'][K]) => {
    setForm((current) => ({
      ...current,
      api: { ...current.api, [field]: value },
    }));
  };

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(form.api.privateKey);
      toast.success('Đã copy private key');
    } catch (error) {
      toast.error('Không copy được private key');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAdminSettings(form);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-settings'] }),
        queryClient.invalidateQueries({ queryKey: ['public-settings'] }),
      ]);
      setLookupApiBaseUrl(form.api.baseUrl);
      toast.success('Đã lưu settings');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Không lưu được settings');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-md border border-slate-800/80 bg-slate-950/55 p-5 py-5 shadow-none">
        <div className="mb-4 flex items-center gap-2 text-white">
          <Settings className="h-5 w-5 text-cyan-300" />
          <h3 className="text-lg font-semibold">Settings</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-12 bg-slate-800/60" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-md border border-slate-800/80 bg-slate-950/55 p-0 shadow-none">
      <div className="border-b border-slate-800/80 bg-slate-900/35 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-white">
              <Settings className="h-5 w-5 text-cyan-300" />
              <h3 className="text-lg font-semibold">Website & API Settings</h3>
              {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-slate-500" />}
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Đổi tiêu đề, mô tả SEO, endpoint API và private key tra cứu.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-slate-700/70 bg-slate-950/40 text-slate-200 hover:border-cyan-500 hover:bg-cyan-500/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tải lại
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-cyan-500 text-white hover:bg-cyan-600"
            >
              {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Lưu cài đặt
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-md border border-slate-800 bg-slate-950/40 p-4">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            <h4 className="font-medium text-white">Website info</h4>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Title</Label>
              <Input
                value={form.site.title}
                onChange={(event) => updateSite('title', event.target.value)}
                className="border-slate-700 bg-slate-950/70 text-slate-100"
                placeholder="Tiêu đề website"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Description</Label>
              <Textarea
                value={form.site.description}
                onChange={(event) => updateSite('description', event.target.value)}
                className="min-h-24 border-slate-700 bg-slate-950/70 text-slate-100"
                placeholder="Mô tả ngắn về website"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Keywords</Label>
              <Textarea
                value={form.site.keywords}
                onChange={(event) => updateSite('keywords', event.target.value)}
                className="min-h-20 border-slate-700 bg-slate-950/70 text-slate-100"
                placeholder="từ khóa SEO, cách nhau bằng dấu phẩy"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Website Favicon/Icon URL</Label>
              <div className="flex gap-3 items-center">
                <Input
                  value={form.site.iconUrl}
                  onChange={(event) => updateSite('iconUrl', event.target.value)}
                  className="border-slate-700 bg-slate-950/70 text-slate-100 font-mono text-xs"
                  placeholder="https://link-to-icon.png"
                />
                {form.site.iconUrl && (
                  <div className="h-10 w-10 flex-shrink-0 rounded bg-slate-800 p-1 border border-slate-700">
                    <img src={form.site.iconUrl} alt="Preview" className="h-full w-full object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-md border border-slate-800 bg-slate-950/40 p-4">
          <div className="mb-4 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-amber-300" />
            <h4 className="font-medium text-white">API access</h4>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">API Base URL</Label>
              <Input
                value={form.api.baseUrl}
                onChange={(event) => updateApi('baseUrl', event.target.value)}
                className="border-slate-700 bg-slate-950/70 font-mono text-slate-100"
                placeholder="https://api.domain.com"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Private key</Label>
              <div className="flex gap-2">
                <Input
                  value={form.api.privateKey}
                  onChange={(event) => updateApi('privateKey', event.target.value)}
                  className="border-slate-700 bg-slate-950/70 font-mono text-slate-100"
                  placeholder="Nhap private key server"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => updateApi('privateKey', randomKey())}
                  className="border-slate-700/70 bg-slate-950/40 text-slate-300 hover:border-amber-500 hover:bg-amber-500/10"
                  title="Tao key"
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyKey}
                  disabled={!form.api.privateKey}
                  className="border-slate-700/70 bg-slate-950/40 text-slate-300 hover:border-cyan-500 hover:bg-cyan-500/10"
                  title="Copy key"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-md border border-slate-800 bg-slate-900/40 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-200">Require private key</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Bật lên thì /api/check-all và /api/check-bank cần x-private-key đúng.
                  </p>
                </div>
                <Switch
                  checked={form.api.requirePrivateKey}
                  onCheckedChange={(checked) => updateApi('requirePrivateKey', checked)}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </Card>
  );
}
