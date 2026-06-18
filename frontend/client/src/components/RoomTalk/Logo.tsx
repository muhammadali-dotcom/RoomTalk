import { MessageSquare } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const configs = {
  sm: { iconSize: 13, iconBox: 'w-7 h-7 rounded-lg', text: 'text-sm' },
  md: { iconSize: 15, iconBox: 'w-8 h-8 rounded-xl', text: 'text-[15px]' },
  lg: { iconSize: 17, iconBox: 'w-9 h-9 rounded-xl', text: 'text-lg' },
};

export default function Logo({ size = 'md' }: LogoProps) {
  const c = configs[size];
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${c.iconBox} flex items-center justify-center bg-emerald-500/10 border border-emerald-500/25 flex-shrink-0`}
        style={{ boxShadow: '0 0 14px rgba(52,211,153,0.18)' }}
      >
        <MessageSquare size={c.iconSize} className="text-emerald-400" />
      </div>
      <span className={`font-bold text-white ${c.text} tracking-tight leading-none`}>
        RoomTalk
      </span>
    </div>
  );
}
