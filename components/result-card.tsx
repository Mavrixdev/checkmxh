'use client';

import { LookupResult } from '@/types';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  AtSign,
  BadgeCheck,
  CheckCircle,
  Clock,
  DollarSign,
  ExternalLink,
  Landmark,
  MessageSquare,
  Phone,
  SearchX,
  ShieldCheck,
  Smartphone,
  User,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';

interface ResultCardProps {
  result: LookupResult;
}

const cardClass =
  'group relative h-full overflow-hidden border border-cyan-500/25 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-slate-950 p-4 shadow-lg shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/45 hover:shadow-cyan-500/20';

const StatusBadge = ({ status, label }: { status: string; label: string }) => {
  let bgColor = 'bg-yellow-500/20 text-yellow-300 ring-yellow-400/20';
  let icon = <Clock className="h-3 w-3" />;

  if (status.includes('scam') || status.includes('fraud') || status === 'true') {
    bgColor = 'bg-red-500/20 text-red-300 ring-red-400/20';
    icon = <AlertCircle className="h-3 w-3" />;
  } else if (status.includes('verified') || status.includes('safe') || status === 'false') {
    bgColor = 'bg-emerald-500/20 text-emerald-300 ring-emerald-400/20';
    icon = <CheckCircle className="h-3 w-3" />;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${bgColor}`}>
      {icon}
      {label}
    </div>
  );
};

const InfoSection = ({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: React.ComponentType<{ className: string }>;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="relative z-10 space-y-3">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      </div>
      {action}
    </div>
    {children}
  </div>
);

const DetailRow = ({ label, value }: { label: string; value?: React.ReactNode }) => {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-950/55 px-3 py-2 text-xs ring-1 ring-slate-800/70">
      <span className="text-slate-500">{label}</span>
      <span className="min-w-0 truncate text-right font-medium text-slate-200">{value || t('unknown')}</span>
    </div>
  );
};

const EmptyState = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-slate-950/55 px-3 py-2.5">
    <SearchX className="h-4 w-4 flex-shrink-0 text-slate-500" />
    <p className="text-xs font-medium text-slate-500">{text}</p>
  </div>
);

const getInitials = (name?: string) =>
  name
    ?.split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?';

const ProfileAvatar = ({ src, name, accent }: { src?: string; name?: string; accent: string }) => (
  <div className={`grid h-12 w-12 flex-shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-900 ${accent}`}>
    {src ? (
      <img
        src={src}
        alt={name || 'Avatar'}
        className="h-full w-full object-cover"
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
    ) : (
      <span className="text-sm font-bold text-slate-300">{getInitials(name)}</span>
    )}
  </div>
);

export function ResultCard({ result }: ResultCardProps) {
  const { t } = useLanguage();
  const banks = Array.isArray(result.banks)
    ? result.banks.filter((bank) => bank.bank_name || bank.account_holder || bank.account_number)
    : [];
  const reportCount = result.checkscam?.reports ?? 0;
  const isScammer = Boolean(result.checkscam?.is_scammer);
  const hasScamData = Boolean(result.checkscam);
  const riskLabel = !hasScamData ? 'Chưa xác minh' : isScammer ? 'Rủi ro cao' : 'An toàn';
  const riskClass = !hasScamData
    ? 'from-yellow-500/15 to-slate-950/60 text-yellow-200 ring-yellow-400/20'
    : isScammer
      ? 'from-red-500/20 to-slate-950/60 text-red-200 ring-red-400/25'
      : 'from-emerald-500/20 to-slate-950/60 text-emerald-200 ring-emerald-400/25';
  const RiskIcon = isScammer ? AlertCircle : hasScamData ? ShieldCheck : Clock;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
    >
      <motion.div variants={item}>
        <Card className={cardClass}>
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/10 blur-2xl" />
          <InfoSection icon={Smartphone} title={t('phone_info')}>
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-xl bg-cyan-400/10 px-3 py-3 ring-1 ring-cyan-400/20">
                <Phone className="h-4 w-4 text-cyan-300" />
                <p className="font-mono text-base font-semibold text-white">{result.phone}</p>
              </div>
              <DetailRow label={t('carrier_type')} value={result.carrier?.type || 'Mobile'} />
              <DetailRow
                label={t('carrier_network')}
                value={<span className="text-cyan-300">{result.carrier?.network || result.phoneInfo?.carrier?.name}</span>}
              />
            </div>
          </InfoSection>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className={cardClass}>
          <InfoSection
            icon={User}
            title={t('facebook')}
            action={result.facebook?.verified ? <BadgeCheck className="h-4 w-4 text-emerald-300" /> : null}
          >
            <div className="space-y-4">
              {result.facebook?.accounts && result.facebook.accounts.length > 0 ? (
                result.facebook.accounts.map((acc, idx) => (
                  <div key={idx} className="flex items-center gap-3 border-b border-slate-800/30 pb-3 last:border-0 last:pb-0">
                    <ProfileAvatar 
                      src={acc.avatar || acc.profile_pic_url} 
                      name={acc.name} 
                      accent="ring-1 ring-sky-400/30" 
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate text-sm font-semibold text-white">{acc.name}</p>
                      {acc.uid && <p className="text-[10px] font-mono text-slate-500">UID: {acc.uid}</p>}
                      {acc.link && (
                        <a
                          href={acc.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-cyan-400 hover:text-cyan-300"
                        >
                          {t('view_profile')} <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : result.facebook?.name ? (
                <div className="flex items-center gap-3">
                  <ProfileAvatar src={result.facebook?.avatar} name={result.facebook?.name} accent="ring-1 ring-sky-400/30" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm font-semibold text-white">{result.facebook.name}</p>
                    {result.facebook?.verified && <StatusBadge status="verified" label={t('verified_account')} />}
                    {result.facebook?.uid && <p className="text-[10px] font-mono text-slate-500">UID: {result.facebook.uid}</p>}
                  </div>
                </div>
              ) : (
                <EmptyState text={t('no_facebook')} />
              )}
            </div>
          </InfoSection>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className={cardClass}>
          <InfoSection icon={AtSign} title={t('instagram')}>
            <div className="space-y-2">
              {result.instagram?.found ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-400/10 px-3 py-2.5 ring-1 ring-emerald-400/20">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <p className="text-sm font-semibold text-emerald-200">
                      {result.instagram.message || t('active_account')}
                    </p>
                  </div>
                  <StatusBadge status="verified" label={t('active_account')} />
                </div>
              ) : (
                <EmptyState text={t('no_instagram')} />
              )}
            </div>
          </InfoSection>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className={cardClass}>
          {result.zalo?.cover && (
            <div className="absolute top-0 left-0 right-0 h-20 opacity-20 overflow-hidden pointer-events-none">
              <img src={result.zalo.cover} className="w-full h-full object-cover blur-sm" alt="Zalo Cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950" />
            </div>
          )}
          <InfoSection icon={MessageSquare} title={t('zalo')}>
            <div className="flex items-center gap-3">
              <ProfileAvatar src={result.zalo?.avatar} name={result.zalo?.name} accent="ring-1 ring-blue-400/30" />
              <div className="min-w-0 flex-1 space-y-1">
                {result.zalo?.name ? (
                  <p className="truncate text-sm font-semibold text-white">{result.zalo.name}</p>
                ) : (
                  <p className="text-xs text-slate-500">{t('no_zalo')}</p>
                )}
                {result.zalo?.status && (
                  <p className="w-fit rounded-full bg-blue-400/10 px-2 py-0.5 text-[10px] font-medium text-blue-200">
                    {result.zalo.status}
                  </p>
                )}
              </div>
            </div>
            {(result.zalo?.zalo_id || result.zalo?.uid) && (
              <div className="mt-3 space-y-1">
                <DetailRow label="UID" value={result.zalo.uid || result.zalo.zalo_id} />
                {result.zalo.gender && <DetailRow label="Giới tính" value={result.zalo.gender} />}
                {result.zalo.dob && <DetailRow label="Ngày sinh" value={result.zalo.dob} />}
              </div>
            )}
          </InfoSection>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className={cardClass}>
          <InfoSection icon={MessageSquare} title={t('telegram')}>
            <div className="space-y-2">
              {result.telegram?.username ? (
                <div className="flex items-center gap-2 rounded-xl bg-cyan-400/10 px-3 py-2.5 ring-1 ring-cyan-400/20">
                  <AtSign className="h-4 w-4 text-cyan-300" />
                  <p className="truncate text-sm font-semibold text-cyan-200">{result.telegram.username}</p>
                </div>
              ) : result.telegram?.found ? (
                <StatusBadge status="verified" label={t('verified_account')} />
              ) : (
                <EmptyState text={t('no_telegram')} />
              )}
              {result.telegram?.first_name && <DetailRow label="Name" value={result.telegram.first_name} />}
              {result.telegram?.user_id && <DetailRow label="User ID" value={result.telegram.user_id} />}
            </div>
          </InfoSection>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className={cardClass}>
          <InfoSection icon={DollarSign} title={t('banking')} action={<Landmark className="h-4 w-4 text-cyan-300" />}>
            <div className="space-y-2">
              {banks.length > 0 ? (
                <>
                  {banks.slice(0, 3).map((bank, idx) => (
                    <div key={idx} className="rounded-lg border border-slate-800/70 bg-slate-950/55 p-2.5 text-xs">
                      {bank.bank_name && <p className="font-semibold text-cyan-300">{bank.bank_name}</p>}
                      {bank.account_holder && <p className="mt-1 text-slate-400">Holder: {bank.account_holder}</p>}
                      {bank.account_number && <p className="mt-1 font-mono text-[11px] text-slate-500">{bank.account_number}</p>}
                    </div>
                  ))}
                  {banks.length > 3 && <p className="px-1 text-[10px] text-slate-500">+{banks.length - 3} more banks</p>}
                </>
              ) : (
                <EmptyState text={t('no_banking')} />
              )}
            </div>
          </InfoSection>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className={cardClass}>
          <InfoSection icon={AlertCircle} title={t('scam_check')}>
            <div className="space-y-3">
              <div className={`rounded-xl bg-gradient-to-br px-3 py-3 ring-1 ${riskClass}`}>
                <div className="flex items-center gap-2">
                  <RiskIcon className="h-4 w-4" />
                  <p className="text-sm font-bold">{riskLabel}</p>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  {hasScamData
                    ? result.checkscam?.verdict || (isScammer ? 'Reported as Scammer' : 'No Reports')
                    : 'Hệ thống chưa trả về kết quả scam cho số này.'}
                </p>
              </div>
              {hasScamData ? (
                <>
                  <DetailRow label="Reports" value={reportCount} />
                  {reportCount > 0 && <StatusBadge status="scam" label={`${reportCount} report(s) found`} />}
                </>
              ) : (
                <DetailRow label="Reports" value="Chưa có dữ liệu" />
              )}
            </div>
          </InfoSection>
        </Card>
      </motion.div>

      {result.credit && (
        <motion.div variants={item} className="col-span-1 sm:col-span-2 lg:col-span-3">
          <div className="mx-auto w-fit rounded-lg border border-cyan-500/10 bg-cyan-500/5 px-4 py-2 text-center">
            <p className="text-xs font-medium text-cyan-400/80 italic">{result.credit}</p>
          </div>
        </motion.div>
      )}

      {result.cached && (
        <motion.div variants={item} className="col-span-1 sm:col-span-2 lg:col-span-3">
          <div className="mx-auto w-fit rounded-full border border-slate-800/50 bg-slate-900/50 px-3 py-1.5 text-[10px] text-slate-500">
            Cached result from {new Date(result.createdAt).toLocaleString()}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
