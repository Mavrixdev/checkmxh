'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useLatestLookups } from '@/hooks/useAdminData';
import { formatDate } from '@/lib/utils-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/hooks/use-language';
import { deleteLookup, updateLookup } from '@/lib/api';
import { toast } from 'sonner';
import { Copy, Trash2, Edit2, Save, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LookupResult } from '@/types';

export function LatestLookups() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { data: lookups, isLoading } = useLatestLookups(20);
  
  const [editingLookup, setEditingLookup] = useState<LookupResult | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('copy_phone') + ': ' + text);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('confirm_delete'))) return;
    try {
      await deleteLookup(id);
      toast.success(t('delete') + ' thành công');
      queryClient.invalidateQueries({ queryKey: ['latest'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    } catch (e) {
      toast.error(t('error_occurred'));
    }
  };

  const handleEditClick = (lookup: LookupResult) => {
    setEditingLookup({ ...lookup });
    setIsEditOpen(true);
  };

  const handleSave = async () => {
    if (!editingLookup?._id) return;
    setIsSaving(true);
    try {
      await updateLookup(editingLookup._id, editingLookup);
      toast.success('Đã cập nhật thông tin');
      setIsEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ['latest'] });
    } catch (e) {
      toast.error('Lỗi khi cập nhật');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="glass border-glow p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{t('latest_lookups')}</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass border-glow p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{t('latest_lookups')}</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50 text-slate-400">
              <th className="text-left py-2 px-2">{t('phone')}</th>
              <th className="text-left py-2 px-2">{t('results')}</th>
              <th className="text-left py-2 px-2">{t('time')}</th>
              <th className="text-right py-2 px-2">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {lookups && lookups.length > 0 ? (
              lookups.map((lookup, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-slate-700/30 hover:bg-slate-900/30 transition-colors"
                >
                  <td className="py-3 px-2 text-cyan-400 font-mono">{lookup.phone}</td>
                  <td className="py-3 px-2 text-slate-300">
                    <span className="inline-flex items-center gap-1">
                      {lookup.facebook && <span className="text-blue-400">FB</span>}
                      {lookup.telegram && <span className="text-blue-400">TG</span>}
                      {lookup.banks && lookup.banks.length > 0 && <span className="text-green-400">Bank</span>}
                      {lookup.checkscam && <span className="text-yellow-400">Scam</span>}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-slate-500 text-xs">
                    {lookup.createdAt ? formatDate(lookup.createdAt) : t('unknown')}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleCopy(lookup.phone)}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded transition-colors"
                        title={t('copy_phone')}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEditClick(lookup)}
                        className="p-1.5 text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded transition-colors"
                        title={t('edit')}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => lookup._id && handleDelete(lookup._id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                        title={t('delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  {t('no_results')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="glass border-glow max-w-2xl max-h-[80vh] overflow-y-auto text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-yellow-400" />
              {t('edit')}: {editingLookup?.phone}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Zalo Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Zalo</h4>
              <div className="space-y-2">
                <Label>Họ tên</Label>
                <Input 
                  value={editingLookup?.zalo?.name || ''} 
                  onChange={(e) => setEditingLookup(prev => prev ? ({ ...prev, zalo: { ...prev.zalo, name: e.target.value } }) : null)}
                  className="bg-slate-900/50 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Zalo ID</Label>
                <Input 
                  value={editingLookup?.zalo?.user_id || ''} 
                  onChange={(e) => setEditingLookup(prev => prev ? ({ ...prev, zalo: { ...prev.zalo, user_id: e.target.value } }) : null)}
                  className="bg-slate-900/50 border-slate-700"
                />
              </div>
            </div>

            {/* Facebook Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Facebook</h4>
              <div className="space-y-2">
                <Label>Tên FB</Label>
                <Input 
                  value={editingLookup?.facebook?.name || ''} 
                  onChange={(e) => setEditingLookup(prev => prev ? ({ ...prev, facebook: { ...prev.facebook, name: e.target.value } }) : null)}
                  className="bg-slate-900/50 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>UID</Label>
                <Input 
                  value={editingLookup?.facebook?.uid || ''} 
                  onChange={(e) => setEditingLookup(prev => prev ? ({ ...prev, facebook: { ...prev.facebook, uid: e.target.value } }) : null)}
                  className="bg-slate-900/50 border-slate-700"
                />
              </div>
            </div>

            {/* Telegram Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-sky-400 uppercase tracking-wider">Telegram</h4>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input 
                  value={editingLookup?.telegram?.username || ''} 
                  onChange={(e) => setEditingLookup(prev => prev ? ({ ...prev, telegram: { ...prev.telegram, username: e.target.value } }) : null)}
                  className="bg-slate-900/50 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Tiểu sử (About)</Label>
                <Input 
                  value={editingLookup?.telegram?.about || ''} 
                  onChange={(e) => setEditingLookup(prev => prev ? ({ ...prev, telegram: { ...prev.telegram, about: e.target.value } }) : null)}
                  className="bg-slate-900/50 border-slate-700"
                />
              </div>
            </div>

            {/* Scam Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider">CheckScam</h4>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Input 
                  value={editingLookup?.checkscam?.verdict || ''} 
                  onChange={(e) => setEditingLookup(prev => prev ? ({ ...prev, checkscam: { ...prev.checkscam, verdict: e.target.value } }) : null)}
                  className="bg-slate-900/50 border-slate-700"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              className="border-slate-700 text-slate-300"
            >
              <X className="w-4 h-4 mr-2" /> {t('refresh')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? '...' : t('edit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
