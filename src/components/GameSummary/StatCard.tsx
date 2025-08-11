import { motion } from "framer-motion";
import { Tooltip } from "../ui/CustomTooltip";
import CountUp from "../../TextAnimations/CountUp/CountUp";

function StatValue({ value }: { value: string }) {
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const match = value.match(/^([+\-]?(?:\d+)?(?:\.\d+)?)(.*)$/);
  const numericPart = match && match[1] ? match[1] : null;
  const suffix = match && match[2] ? match[2] : '';

  const num = numericPart !== null && numericPart !== '' && !isNaN(Number(numericPart)) ? Number(numericPart) : null;

  if (num === null || prefersReducedMotion) {
    return <p className="text-lg font-semibold text-white">{value}</p>;
  }

  return (
    <p className="text-lg font-semibold text-white tabular-nums">
      <CountUp to={num} from={0} delay={0.2} duration={0.25} />{suffix}
    </p>
  );
}

const StatCard = ({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: string;
  tooltip?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-neutral-800/50 backdrop-blur-sm p-4 rounded-lg border border-white/5 tooltip-container"
  >
    {tooltip ? (
      <Tooltip text={tooltip}>
        <div className="space-y-1 cursor-help">
          <p className="text-sm text-neutral-400 truncate">{label}</p>
          <StatValue value={value} />
        </div>
      </Tooltip>
    ) : (
      <div className="space-y-1">
        <p className="text-sm text-neutral-400 truncate">{label}</p>
        <StatValue value={value} />
      </div>
    )}
  </motion.div>
);

export default StatCard;
