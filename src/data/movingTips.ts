export interface MovingSection {
  heading: string;
  body: string[];
}

export interface DonationLink {
  name: string;
  description: string;
  url: string;
}

export const movingSections: MovingSection[] = [
  {
    heading: 'Plan eight weeks out',
    body: [
      'Keep one list, wherever you will actually look at it. Mover quotes, school registration deadlines, utility transfer dates, and who still has your old address all belong in the same place.',
      'Order supplies in bulk online rather than buying boxes and tape by the armful at the hardware store. It is cheaper, and you stop losing evenings to supply runs.',
    ],
  },
  {
    heading: 'Declutter aggressively',
    body: [
      'You are paying by weight and by hour to move things you do not want. Go room by room and sort into keep, sell, donate, and discard before a single box gets packed.',
      'Sell what has real resale value on Facebook Marketplace or Nextdoor, or in a yard sale, and put the proceeds toward the movers.',
      'Donate the rest. Salvation Army, Goodwill, and Habitat for Humanity ReStore take furniture, clothing, kitchenware, and building materials, and several will pick up the large pieces at no charge.',
    ],
  },
  {
    heading: 'Pack smart',
    body: [
      'Label every box with the room it lands in and roughly what is inside. "Kitchen, pantry" is worth something on the far end. "Kitchen 4 of 12" is not.',
      'Pack a first-night box for each person: pajamas, toothbrush, phone charger, a change of clothes, and whatever a small child will ask for at bedtime.',
      'Photograph the back of the TV and anything else with more than two cables before you unplug it. Reassembly stops being a puzzle.',
    ],
  },
  {
    heading: 'Take care of those you love',
    body: [
      'Bring kids in early. Walk the new neighborhood, the school, and the park before moving day, and give them an actual job when it arrives.',
      'Pets take it harder than anyone. Board them or hand them to a sitter for the day itself, and unpack their food, bowls, and bed first at the other end.',
      'Change your address at the source: driver\'s license, voter registration, bank, insurance, subscriptions. USPS forwarding is a backstop, not a fix. It moves First-Class mail for twelve months, stops forwarding magazines after 60 days, and does not forward most advertising mail at all.',
    ],
  },
];

export const donationLinks: DonationLink[] = [
  {
    name: 'The Salvation Army',
    description: 'Accepts clothing, furniture, household goods. Free pickup available.',
    url: 'https://satruck.org/',
  },
  {
    name: 'Goodwill',
    description: 'Accepts clothing, books, electronics, and small household items at local drop-off centers.',
    url: 'https://www.goodwill.org/donate/',
  },
  {
    name: 'Habitat for Humanity ReStore',
    description: 'Accepts furniture, appliances, building materials, and home goods. Proceeds fund Habitat builds.',
    url: 'https://www.habitat.org/restores',
  },
];
