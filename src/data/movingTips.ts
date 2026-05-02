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
      'Start a moving binder or shared note. Track moving-company quotes, school registration deadlines, utility transfers, and forwarding addresses in one place.',
      'Order moving supplies in bulk online — boxes, tape, packing paper, and labels. Buying piecemeal at hardware stores is more expensive and slower.',
    ],
  },
  {
    heading: 'Declutter aggressively',
    body: [
      'Don\'t pay to move what you won\'t keep. Walk room by room and sort items into Keep, Sell, Donate, and Discard piles before any boxes are packed.',
      'Sell what has resale value through Facebook Marketplace, Nextdoor, or a yard sale. The proceeds offset moving costs.',
      'Donate the rest. Local charities — Salvation Army, Goodwill, and Habitat for Humanity ReStore — accept furniture, clothing, kitchenware, and building materials. Several offer free pickup for larger items.',
    ],
  },
  {
    heading: 'Pack smart',
    body: [
      'Label each box with its destination room and a brief contents summary. "Kitchen — Pantry" beats "Kitchen 4 of 12."',
      'Pack a "first night" box for each family member: pajamas, toothbrush, phone charger, change of clothes, and a few favorites for the kids.',
      'Photograph the back of your TV and electronics before unplugging anything — reassembly is dramatically faster.',
    ],
  },
  {
    heading: 'Take care of those you love',
    body: [
      'Bring kids into the planning early. Walk them through the new neighborhood, schools, and parks before the move. Give them a role on moving day.',
      'Pets feel the disruption acutely. Arrange a sitter or boarding for the moving day itself, and keep their food, bowls, and bedding in an easy-to-reach box at the new home.',
      'Update your driver\'s license, voter registration, and all subscriptions. The USPS forwarding service catches what you miss for the first year.',
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
