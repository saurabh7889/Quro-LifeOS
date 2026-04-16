interface SectionEmptyStateProps {
  message: string;
  className?: string;
}

export function SectionEmptyState({ message, className = "" }: SectionEmptyStateProps) {
  return (
    <p className={`text-sm text-muted-foreground text-center py-10 ${className}`}>
      {message}
    </p>
  );
}
