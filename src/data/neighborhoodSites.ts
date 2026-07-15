// Neighborhoods that have a dedicated, JWRG-built microsite (a full standalone
// community site, separate from this listing on jwrg). slug → live URL. The
// neighborhood detail page surfaces this as a "Full Neighborhood Site" button.
// Add a row when a new community site launches.
//
// These are our own `*.jwrgnc.com` microsites — distinct from the office
// `website_url` field, which is meant for a community's own/legacy site.
export const neighborhoodSites: Record<string, string> = {
  'yancey-farms': 'https://yanceyfarms.jwrgnc.com',
  'preserve-west': 'https://preservewest.jwrgnc.com',
  'tennyson': 'https://tennyson.jwrgnc.com',
};
