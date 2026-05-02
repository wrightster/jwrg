// Form IDs from the office Filament admin (Forms resource).
// When a form is created in office, paste its UUID here.
// Pages should still render even when the ID is null — submitForm()
// returns an "unavailable" message if it's missing.

export const formIds = {
  contact: null as string | null,
  cma: null as string | null,
  listYourHome: null as string | null,
  buyingGuide: null as string | null,
  soldReport: null as string | null,
  relocation: null as string | null,
  testimonial: null as string | null,
};

export type FormKey = keyof typeof formIds;
