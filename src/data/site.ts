// Single source of truth for office contact info, used in header,
// footer, contact page, etc.

export const site = {
  name: 'Julie Wright Realty Group',
  shortName: 'Julie Wright Realty Group',
  description:
    'Four decades specializing in Triangle Area properties. Your comprehensive real estate resource for Wake, Granville, Franklin, Johnston, Harnett, and Durham Counties.',
  phone: '(919) 847-7140',
  phoneRaw: '9198477140',
  fax: '(919) 847-7182',
  email: 'info@juliewrightrealtygroup.com',
  address: {
    street1: '10931 Strickland Rd',
    street2: 'Ste 111',
    city: 'Raleigh',
    state: 'NC',
    zip: '27615',
  },
  counties: ['Wake', 'Granville', 'Franklin', 'Johnston', 'Harnett', 'Durham'],
  logoUrl: '/images/jwrg-logo.png',
  // Office embed-form tokens — paste from office.jwrgnc.com admin (Marketing →
  // Embed Forms). Empty strings mean "not yet wired"; pages render a phone/email
  // fallback instead of the embed script.
  formTokens: {
    contact: 'RRbsRCXeygIpq0Zxnhn6xfCFaD7wu0Pi',
    miniContact: '',
    testimonial: '',
    relocation: '',
    buyingGuide: '',
    cma: '',
    listYourHome: '',
    soldReport: '',
    listingInquiry: 'F7h6VKTWpW8J3GiytA38RsMuCXxJoHwD',
  },
};
