export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  bio: string;
  phone: string;
  email: string | null;
  specialties: string[];
  photo: string;
  remotePhoto: string;
}

// Photos: `remotePhoto` points at the legacy REapp/Bailey-Wright CDN.
// `photo` is the local path under `public/images/team/`. Until those
// images are downloaded, components fall back to remotePhoto.

export const team: TeamMember[] = [
  {
    slug: 'julie-wright',
    name: 'Julie Wright',
    role: 'Broker-in-Charge / Owner',
    bio: 'Julie brings 35 years of experience in Triangle-area land transactions, with deep expertise helping rural landowners subdivide parcels in what evolved into North Raleigh. She serves clients across Wake, Durham, Granville, Franklin, Vance, Harnett, Nash, and Chatham counties, advising on soil and topography, zoning, access, and tax and estate considerations. Active in Rotary International and the Tar River Conservancy.',
    phone: '(919) 632-8264',
    email: 'juliannawright@gmail.com',
    specialties: ['Land Sales', 'Subdivisions', 'Waterfront', 'Estate & Tax Consultation', 'Zoning'],
    photo: '/images/team/julie-wright.jpg',
    remotePhoto:
      'https://reappdata.global.ssl.fastly.net/site_data/baileywrightrealty/staff_pictures/pic-5610-4f4627_md.jpeg',
  },
  {
    slug: 'mahnaz-valipour',
    name: 'Mahnaz Valipour',
    role: 'Broker',
    bio: "Mahnaz brings 10 years of Triangle real estate experience with particular expertise in new construction through her family's custom building company. Originally from Tabriz, Iran, she relocated to Raleigh in 1989 and is fluent in Farsi, Azari, and English. She works primarily in Wake County, helping buyers find their dream homes.",
    phone: '(919) 805-2088',
    email: 'mah_gav@yahoo.com',
    specialties: ['New Construction', 'Wake County', 'Land & Home Sales', 'Multilingual'],
    photo: '/images/team/mahnaz-valipour.jpg',
    remotePhoto:
      'https://reappdata.global.ssl.fastly.net/site_data/baileywrightrealty/staff_pictures/pic-5613_md.jpg',
  },
  {
    slug: 'phyllis-howard',
    name: 'Phyllis Howard',
    role: 'Broker',
    bio: 'Phyllis transitioned from a 24-year career at Nortel Networks to real estate, bringing 15 years of experience in Wake, Granville, and Franklin County residential markets. She grew up on a tobacco farm in southern Granville County and remains rooted in the community through Pleasant Grove Baptist Church, where she serves as organist. She believes in balancing the needs of all parties in a transaction.',
    phone: '(919) 280-6321',
    email: 'phyllisphoward@gmail.com',
    specialties: ['Residential', 'Rural Property', 'First-Time Buyers', 'Granville County'],
    photo: '/images/team/phyllis-howard.jpg',
    remotePhoto:
      'https://reappdata.global.ssl.fastly.net/site_data/baileywrightrealty/staff_pictures/pic-5615-5d925e_md.jpg',
  },
  {
    slug: 'janice-coleman',
    name: 'Janice Coleman',
    role: 'Broker',
    bio: "Janice is a broker with Julie Wright Realty Group, serving clients across the Triangle area. She brings the firm's four decades of regional expertise to every transaction.",
    phone: '(919) 219-3625',
    email: 'janicecoleman@gmail.com',
    specialties: [],
    photo: '/images/team/janice-coleman.jpg',
    remotePhoto:
      'https://reappdata.global.ssl.fastly.net/site_data/baileywrightrealty/staff_pictures/pic-5858-57a949_md.jpg',
  },
  {
    slug: 'donna-saldo',
    name: 'Donna Saldo',
    role: 'Broker',
    bio: 'Donna has been active in North Raleigh real estate since 2003, with expertise spanning new home sales, rental investments, and corporate administration. Her hospitality background informs the customer service standard she applies to every transaction. Her professional reputation for integrity and results is her trademark.',
    phone: '(919) 749-2473',
    email: 'dmsaldo@gmail.com',
    specialties: ['Residential', 'New Homes', 'Rental Investments', 'North Raleigh'],
    photo: '/images/team/donna-saldo.jpg',
    remotePhoto:
      'https://reappdata.global.ssl.fastly.net/site_data/baileywrightrealty/staff_pictures/pic-32368-5c3bbd_md.jpg',
  },
  {
    slug: 'ali-watts',
    name: 'Ali Watts',
    role: 'Broker',
    bio: 'Ali is a career real estate agent with a track record of closing residential, new construction, equestrian farm, and land transactions. A lifelong horse enthusiast, she raises, breeds, and shows Paso Fino horses and previously served as president of the Paso Fino Piedmont Horse Association. That background gives her specialized insight when evaluating farm and equestrian properties.',
    phone: '(919) 880-2153',
    email: 'Aliwcasey@aol.com',
    specialties: ['Equestrian Properties', 'Horse Farms', 'Residential', 'New Construction', 'Land'],
    photo: '/images/team/ali-watts.jpg',
    remotePhoto:
      'https://reappdata.global.ssl.fastly.net/site_data/baileywrightrealty/staff_pictures/pic-32372-7384e6_md.jpg',
  },
  {
    slug: 'lisa-branch',
    name: 'Lisa Branch',
    role: 'Broker',
    bio: 'Lisa is a broker with Julie Wright Realty Group, working with buyers and sellers throughout the Triangle area.',
    phone: '(919) 744-9933',
    email: 'lisabranchhomes@gmail.com',
    specialties: [],
    photo: '/images/team/lisa-branch.jpg',
    remotePhoto:
      'https://reappdata.global.ssl.fastly.net/site_data/baileywrightrealty/staff_pictures/pic-33379-5b0042_md.jpg',
  },
  {
    slug: 'shelley-mitchiner',
    name: 'Shelley Caldwell Mitchiner',
    role: 'Broker, MIRM — Manager, New Homes Division',
    bio: 'Shelley brings over four decades of real estate experience, having launched her career as a residential builder and broker in 1976. She co-founded appleTREE New Homes & Land in 1993, focused on new home and land sales and marketing, and now manages the New Homes Division at Julie Wright Realty Group. She holds the MIRM designation and her honors include Wake County HBA Associate of the Year, multiple Presidential Awards, and 25+ MAME marketing awards.',
    phone: '(919) 306-4662',
    email: 'scmitchiner@gmail.com',
    specialties: ['New Homes', 'Land Sales', 'New Construction Marketing', 'MIRM'],
    photo: '/images/team/shelley-mitchiner.jpg',
    remotePhoto:
      'https://reappdata.global.ssl.fastly.net/site_data/baileywrightrealty/staff_pictures/pic-44505-74ada0_md.jpg',
  },
  {
    slug: 'mary-ammons',
    name: 'Mary Ammons',
    role: 'Broker',
    bio: "Mary relocated to Raleigh from Long Island in 1985, starting in property management before earning her broker's license 25 years ago. She joined Julie Wright Realty Group in 2018 and handles both residential and land transactions. Her approach pairs geographical knowledge with technological tools and established relationships to deliver consistent client outcomes.",
    phone: '(919) 270-2101',
    email: 'maryammons5508@gmail.com',
    specialties: ['Residential', 'Land Sales', 'Property Management'],
    photo: '/images/team/mary-ammons.jpg',
    remotePhoto:
      'https://reappdata.global.ssl.fastly.net/site_data/baileywrightrealty/staff_pictures/pic-46081-d12916_md.jpg',
  },
  {
    slug: 'janelle-clark',
    name: 'Janelle Clark',
    role: 'Broker',
    bio: 'Janelle is a broker with Julie Wright Realty Group, serving buyers and sellers throughout the Triangle area.',
    phone: '(919) 771-4093',
    email: 'janelleclark6@gmail.com',
    specialties: [],
    photo: '/images/team/janelle-clark.jpg',
    remotePhoto:
      'https://reappdata.global.ssl.fastly.net/site_data/baileywrightrealty/staff_pictures/pic-49289-369259_md.jpg',
  },
  {
    slug: 'alex-bailey',
    name: 'Alex Bailey',
    role: 'Broker',
    bio: 'Alex is a broker with Julie Wright Realty Group, serving clients throughout the Triangle area.',
    phone: '(919) 741-7575',
    email: 'alextbailey@icloud.com',
    specialties: [],
    photo: '/images/team/alex-bailey.jpg',
    remotePhoto:
      'https://reappdata.global.ssl.fastly.net/site_data/baileywrightrealty/staff_pictures/pic-50049-265d5c_md.jpeg',
  },
  {
    slug: 'lindsey-ewing',
    name: 'Lindsey Ewing',
    role: 'Real Estate Agent',
    bio: 'Lindsey is a broker with Julie Wright Realty Group, working with buyers and sellers across the Triangle.',
    phone: '(828) 439-3782',
    email: 'lindseyewinghomes@gmail.com',
    specialties: [],
    photo: '/images/team/lindsey-ewing.jpg',
    remotePhoto:
      'https://reappdata.global.ssl.fastly.net/site_data/baileywrightrealty/staff_pictures/pic-52594-fc4ba9_md.jpeg',
  },
  {
    slug: 'paul-short',
    name: 'Paul Short',
    role: 'Real Estate Agent',
    bio: 'Paul is a broker with Julie Wright Realty Group, serving buyers and sellers across the Triangle area.',
    phone: '(704) 340-2506',
    email: 'ptshort10@gmail.com',
    specialties: [],
    photo: '/images/team/paul-short.jpg',
    remotePhoto:
      'https://reappdata.global.ssl.fastly.net/site_data/baileywrightrealty/staff_pictures/pic-56237-34695a_md.jpg',
  },
  {
    slug: 'meri-ashlen-bailey',
    name: 'Meri-Ashlen Bailey',
    role: 'Real Estate Agent',
    bio: 'Meri-Ashlen is a broker with Julie Wright Realty Group, serving clients across the Triangle area.',
    phone: '(919) 453-4633',
    email: null,
    specialties: [],
    photo: '/images/team/meri-ashlen-bailey.jpg',
    remotePhoto:
      'https://reappdata.global.ssl.fastly.net/lib/realestate_solution/front_images/no-photo-person_sm.png',
  },
  {
    slug: 'robert-powell',
    name: 'Robert Powell',
    role: 'Real Estate Agent',
    bio: 'Robert brings two decades of real estate and mortgage lending experience to his work as a North Carolina broker, having previously served as a Managing Partner at Southern States Mortgage. His finance background sharpens his approach to structuring offers and pricing properties. He works with first-time buyers and portfolio investors across the Triangle and points north, and is active with the Boys and Girls Club of North Central North Carolina, the Kiwanis Club, and the Diocese of North Carolina.',
    phone: '(919) 691-1663',
    email: null,
    specialties: ['First-Time Buyers', 'Investment Portfolios', 'Mortgage Background', 'Triangle & North'],
    photo: '/images/team/robert-powell.jpg',
    remotePhoto:
      'https://reappdata.global.ssl.fastly.net/site_data/baileywrightrealty/staff_pictures/pic-58634-92b9a3_md.jpg',
  },
  {
    slug: 'karen-mcqueen',
    name: 'Karen McQueen',
    role: 'Realtor',
    bio: 'Karen is a native of Oxford, NC, where she lives with her husband Michael and is raising four daughters and two grandchildren. She describes herself as a passionate, dedicated realtor committed to matching clients with the right home, whether a forever home or the next sale. Her familiarity with growth and development across the surrounding counties anchors her local expertise.',
    phone: '(919) 280-1866',
    email: 'kbmcqueen37@gmail.com',
    specialties: ['Buyer Representation', 'Seller Representation', 'Relocation', 'Oxford / Granville County'],
    photo: '/images/team/karen-mcqueen.jpg',
    remotePhoto:
      'https://reappdata.global.ssl.fastly.net/site_data/baileywrightrealty/staff_pictures/pic-58632-240833_md.jpg',
  },
  {
    slug: 'jeff-hunter',
    name: 'Jeff Hunter',
    role: 'Broker — Developer',
    bio: 'An NC State graduate with over 40 years of business experience, Jeff developed the acclaimed Colvard Farms community near Jordan Lake. Named CFO of the Year by the Triangle Business Journal in 2013, he has been a licensed broker since 2021.',
    phone: '(919) 730-9420',
    email: 'jeffnhunter@aol.com',
    specialties: ['Community Development', 'Financial Strategy', 'Land Development'],
    photo: '/images/team/jeff-hunter.jpg',
    remotePhoto: '',
  },
];
