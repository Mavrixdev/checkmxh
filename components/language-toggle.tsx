'use client';

import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 px-0">
          <Languages className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLang('vi')} className={lang === 'vi' ? 'bg-accent' : ''}>
          Tiếng Việt
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLang('en')} className={lang === 'en' ? 'bg-accent' : ''}>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
