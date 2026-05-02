export interface Neighborhood {
  slug: string;
  name: string;
  county: string;
  city?: string;
  priceFrom?: string;
  description: string;
  status: 'available' | 'coming_soon';
  photo?: string;
  features?: string[];
}

export const neighborhoods: Neighborhood[] = [
  {
    slug: 'bragg-farm',
    name: 'Bragg Farm',
    county: 'Wake',
    city: 'Wake Forest',
    description:
      'A close-knit Wake Forest neighborhood with custom homes on generous lots, mature trees, and easy access to Triangle commuting routes.',
    status: 'available',
  },
  {
    slug: 'cedar-knolls',
    name: 'Cedar Knolls',
    county: 'Wake',
    city: 'Raleigh',
    priceFrom: '$750,000',
    description:
      'An established North Raleigh community of executive homes set among cedar-lined streets, blending privacy with convenience to schools, dining, and I-540.',
    status: 'available',
  },
  {
    slug: 'colvard-farms',
    name: 'Colvard Farms',
    county: 'Durham',
    city: 'Durham',
    priceFrom: '$1,800,000',
    description:
      'A signature gated community near Jordan Lake featuring estate homesites, swim and tennis amenities, and award-winning architectural standards.',
    status: 'available',
  },
  {
    slug: 'cannady-mill-rd-lots',
    name: 'New Homes by Blackwell Builders',
    county: 'Franklin',
    city: 'Zebulon',
    priceFrom: '$469,900',
    description:
      'A coming-soon collection of new construction homes by Blackwell Builders on Cannady Mill Road, ranging from $469,900 to $615,900.',
    status: 'coming_soon',
  },
  {
    slug: 'land',
    name: 'Land',
    county: 'Multiple',
    description:
      'Acreage tracts and homesites curated by Julie Wright Realty Group across the Triangle and surrounding counties — from buildable wooded lots to large rural parcels.',
    status: 'available',
  },
  {
    slug: 'preserve-west',
    name: 'Preserve West',
    county: 'Wake',
    description:
      'A coming-soon natural-feel community of single-family homesites with thoughtful site planning and protected greenspace.',
    status: 'coming_soon',
  },
  {
    slug: 'woodland-park',
    name: 'Woodland Park',
    county: 'Granville',
    city: 'Oxford',
    priceFrom: '$400,000',
    description:
      'Wooded homesites in Oxford offering quiet rural privacy with quick access to downtown Oxford and US-15 South toward Durham.',
    status: 'available',
  },
];
