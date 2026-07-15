import { AlertCircle } from 'lucide-react';

interface Props {
  errors: string[];
}

/** Accessible validation summary for product mutations. */
export default function ProductEditorValidationSummary({ errors }: Props) {
  if (errors.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-xl px-4 py-3 text-sm"
      style={{ background: 'var(--color-accent-soft)', color: 'var(--color-destructive)' }}
    >
      <div className="flex items-center gap-2 font-semibold">
        <AlertCircle size={16} aria-hidden="true" />
        Fix {errors.length} issue{errors.length === 1 ? '' : 's'} before saving
      </div>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {errors.map((error) => <li key={error}>{error}</li>)}
      </ul>
    </div>
  );
}
