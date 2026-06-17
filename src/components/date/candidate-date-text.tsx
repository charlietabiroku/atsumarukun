import { AppLocale } from "@/lib/i18n/routing";
import {
  cn,
  formatCandidateDate,
  getCandidateDateParts,
  getWeekdayColorClass,
} from "@/lib/utils";

type CandidateDateTextProps = {
  value: string;
  locale: AppLocale;
  className?: string;
  weekdayClassName?: string;
};

export function CandidateDateText({
  value,
  locale,
  className,
  weekdayClassName,
}: CandidateDateTextProps) {
  const parts = getCandidateDateParts(value, locale);

  return (
    <span className={cn("inline", className)}>
      <span>{parts.dateText}</span>
      <span className={cn(getWeekdayColorClass(value), weekdayClassName)}>
        {parts.weekdayText}
      </span>
      <span>{parts.timeText}</span>
    </span>
  );
}

export function CandidateDatePlainText({
  value,
  locale,
}: {
  value: string;
  locale: AppLocale;
}) {
  return formatCandidateDate(value, locale);
}
