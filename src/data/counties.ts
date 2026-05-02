export interface County {
  slug: string;
  name: string;
  description: string;
  municipalities: string[];
}

export const counties: County[] = [
  {
    slug: 'chatham',
    name: 'Chatham County',
    description:
      'Rolling hills, vibrant farms, and quick access to Chapel Hill and the Triangle. Pittsboro is the county seat, with growing communities along US-64.',
    municipalities: ['Pittsboro', 'Siler City', 'Goldston', 'Bynum'],
  },
  {
    slug: 'durham',
    name: 'Durham County',
    description:
      'Home to Duke University, the Durham Bulls, and Research Triangle Park, Durham combines historic neighborhoods with a thriving food, tech, and arts scene.',
    municipalities: ['Durham', 'Bahama', 'Rougemont', 'Gorman'],
  },
  {
    slug: 'franklin',
    name: 'Franklin County',
    description:
      'A short drive northeast of Raleigh, Franklin County offers small-town charm, lake living at Lake Royale, and affordable acreage for buyers seeking space.',
    municipalities: ['Louisburg', 'Franklinton', 'Youngsville', 'Bunn', 'Centerville'],
  },
  {
    slug: 'granville',
    name: 'Granville County',
    description:
      'North of Wake County, Granville County is a rural retreat anchored by Oxford, with rolling farmland, equestrian properties, and timberland tracts.',
    municipalities: ['Oxford', 'Creedmoor', 'Butner', 'Stem', 'Stovall'],
  },
  {
    slug: 'harnett',
    name: 'Harnett County',
    description:
      'South of Wake along US-401, Harnett County offers a balance of rural living and proximity to Fort Liberty (formerly Fort Bragg) and the Sandhills.',
    municipalities: ['Lillington', 'Angier', 'Coats', 'Erwin', 'Dunn'],
  },
  {
    slug: 'johnston',
    name: 'Johnston County',
    description:
      'East of Raleigh, Johnston County combines fast-growing Smithfield, Clayton, and Garner-adjacent communities with established farmland and equestrian acreage.',
    municipalities: ['Smithfield', 'Clayton', 'Selma', 'Benson', 'Four Oaks', 'Princeton'],
  },
  {
    slug: 'orange',
    name: 'Orange County',
    description:
      'Anchored by Chapel Hill and Hillsborough, Orange County offers walkable downtowns, top-ranked schools, and protected open space across the western Triangle.',
    municipalities: ['Chapel Hill', 'Carrboro', 'Hillsborough'],
  },
  {
    slug: 'rtp',
    name: 'Research Triangle Park',
    description:
      'The largest research park in the United States, RTP straddles Durham and Wake Counties and is home to Fortune 500 employers, life-science campuses, and tech innovators.',
    municipalities: ['Durham', 'Cary', 'Morrisville'],
  },
  {
    slug: 'vance',
    name: 'Vance County',
    description:
      'North of Granville, Vance County is centered on Henderson and Kerr Lake, offering lakefront living, established neighborhoods, and value-priced acreage.',
    municipalities: ['Henderson', 'Kittrell', 'Middleburg'],
  },
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
  },
  {
    slug: 'warren',
    name: 'Warren County',
    description:
      'A historic, rural county along the Virginia border with deep-water access on Lake Gaston, Kerr Lake, and the Roanoke River — known for its preserved heritage and value-priced land.',
    municipalities: ['Warrenton', 'Macon', 'Norlina', 'Littleton'],
  },
];
