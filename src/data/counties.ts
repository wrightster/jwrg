export interface County {
  slug: string;
  name: string;
  description: string;
  municipalities: string[];
  /** 2024 ACS 5-year population estimate (US Census). Drives display order. */
  population: number;
}

// Listed here in descending population; the `counties` export re-sorts by
// `population` regardless, so new entries land in the right place automatically.
const all: County[] = [
  {
    slug: 'wake',
    name: 'Wake County',
    description:
      'Home to Raleigh, the state capital, Wake County is the heart of the Triangle — a fast-growing region with top schools, professional sports, museums, and 14 distinctive municipalities.',
    municipalities: [
      'Raleigh',
      'Cary',
      'Apex',
      'Holly Springs',
      'Fuquay-Varina',
      'Wake Forest',
      'Garner',
      'Knightdale',
      'Wendell',
      'Zebulon',
      'Morrisville',
      'Rolesville',
    ],
    population: 1178653,
  },
  {
    slug: 'durham',
    name: 'Durham County',
    description:
      'Home to Duke University, the Durham Bulls, and Research Triangle Park, Durham combines historic neighborhoods with a thriving food, tech, and arts scene.',
    municipalities: ['Durham', 'Bahama', 'Rougemont', 'Gorman'],
    population: 332353,
  },
  {
    slug: 'johnston',
    name: 'Johnston County',
    description:
      'East of Raleigh, Johnston County combines fast-growing Smithfield, Clayton, and Garner-adjacent communities with established farmland and equestrian acreage.',
    municipalities: ['Smithfield', 'Clayton', 'Selma', 'Benson', 'Four Oaks', 'Princeton'],
    population: 234263,
  },
  {
    slug: 'orange',
    name: 'Orange County',
    description:
      'Anchored by Chapel Hill and Hillsborough, Orange County offers walkable downtowns, top-ranked schools, and protected open space across the western Triangle.',
    municipalities: ['Chapel Hill', 'Carrboro', 'Hillsborough'],
    population: 149678,
  },
  {
    slug: 'harnett',
    name: 'Harnett County',
    description:
      'South of Wake along US-401, Harnett County offers a balance of rural living and proximity to Fort Liberty (formerly Fort Bragg) and the Sandhills.',
    municipalities: ['Lillington', 'Angier', 'Coats', 'Erwin', 'Dunn'],
    population: 139150,
  },
  {
    slug: 'chatham',
    name: 'Chatham County',
    description:
      'Rolling hills, vibrant farms, and quick access to Chapel Hill and the Triangle. Pittsboro is the county seat, with growing communities along US-64.',
    municipalities: ['Pittsboro', 'Siler City', 'Goldston', 'Bynum'],
    population: 80151,
  },
  {
    slug: 'franklin',
    name: 'Franklin County',
    description:
      'A short drive northeast of Raleigh, Franklin County offers small-town charm, lake living at Lake Royale, and affordable acreage for buyers seeking space.',
    municipalities: ['Louisburg', 'Franklinton', 'Youngsville', 'Bunn', 'Centerville'],
    population: 74386,
  },
  {
    slug: 'granville',
    name: 'Granville County',
    description:
      'North of Wake County, Granville County is a rural retreat anchored by Oxford, with rolling farmland, equestrian properties, and timberland tracts.',
    municipalities: ['Oxford', 'Creedmoor', 'Butner', 'Stem', 'Stovall'],
    population: 60877,
  },
  {
    slug: 'vance',
    name: 'Vance County',
    description:
      'North of Granville, Vance County is centered on Henderson and Kerr Lake, offering lakefront living, established neighborhoods, and value-priced acreage.',
    municipalities: ['Henderson', 'Kittrell', 'Middleburg'],
    population: 42322,
  },
  {
    slug: 'warren',
    name: 'Warren County',
    description:
      'A historic, rural county along the Virginia border with deep-water access on Lake Gaston, Kerr Lake, and the Roanoke River — known for its preserved heritage and value-priced land.',
    municipalities: ['Warrenton', 'Macon', 'Norlina', 'Littleton'],
    population: 18795,
  },
];

export const counties: County[] = [...all].sort((a, b) => b.population - a.population);
