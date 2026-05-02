export type Field =
  | { type: 'text' | 'email' | 'tel' | 'number' | 'date'; name: string; label: string; required?: boolean; placeholder?: string; cols?: 1 | 2 }
  | { type: 'textarea'; name: string; label: string; required?: boolean; placeholder?: string; rows?: number; cols?: 1 | 2 }
  | { type: 'select'; name: string; label: string; required?: boolean; options: string[]; cols?: 1 | 2 }
  | { type: 'checkbox'; name: string; label: string; cols?: 1 | 2 };
