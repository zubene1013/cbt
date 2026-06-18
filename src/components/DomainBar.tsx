import type { Domain } from '../types';
import { DOMAIN_LABELS } from '../types';

interface Props {
  byDomain: Record<Domain, number>;
}

const COLORS: Record<Domain, string> = {
  secure: 'bg-blue-500',
  resilient: 'bg-green-500',
  performance: 'bg-purple-500',
  cost: 'bg-orange-500',
};

export default function DomainBar({ byDomain }: Props) {
  const domains: Domain[] = ['secure', 'resilient', 'performance', 'cost'];
  return (
    <div className="flex flex-col gap-3">
      {domains.map(d => {
        const pct = Math.round(byDomain[d] * 100);
        return (
          <div key={d}>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{DOMAIN_LABELS[d]}</span>
              <span className="font-bold">{pct}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className={`${COLORS[d]} h-2.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
