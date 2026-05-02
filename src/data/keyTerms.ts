export interface KeyTermSection {
  title: string;
  terms: { term: string; definition: string }[];
}

export const keyTermSections: KeyTermSection[] = [
  {
    title: 'Financing & Mortgages',
    terms: [
      {
        term: 'Adjustable-Rate Mortgage (ARM)',
        definition:
          'A mortgage with an interest rate that may change periodically based on a financial index. Initial rates are typically lower than fixed-rate mortgages.',
      },
      {
        term: 'Annual Percentage Rate (APR)',
        definition:
          'The yearly cost of a loan including interest and fees, expressed as a percentage. APR gives a more complete picture than the interest rate alone.',
      },
      {
        term: 'Fixed-Rate Mortgage',
        definition:
          'A mortgage with the same interest rate for the entire loan term. Predictable payments are ideal for buyers who plan to stay long-term.',
      },
      {
        term: 'Construction Loan',
        definition:
          'A short-term loan used to finance the construction of a new home, typically converted to a permanent mortgage upon completion.',
      },
      {
        term: 'Balloon Mortgage',
        definition:
          'A mortgage with smaller monthly payments and a large lump-sum payment due at the end of the term.',
      },
      {
        term: 'Pre-Approval',
        definition:
          'A lender\'s commitment to lend up to a specified amount based on a thorough review of your finances. Sellers take pre-approved offers more seriously.',
      },
    ],
  },
  {
    title: 'Property Valuation',
    terms: [
      {
        term: 'Appraisal',
        definition:
          'A professional opinion of a property\'s market value, usually required by lenders before approving a mortgage.',
      },
      {
        term: 'Assessment',
        definition:
          'The taxable value of a property determined by the local government for property tax purposes.',
      },
      {
        term: 'Comparable Sales (Comps)',
        definition:
          'Recently sold properties similar in size, location, and features used to estimate the value of a home.',
      },
      {
        term: 'Fair Market Value',
        definition:
          'The price a willing buyer and willing seller would agree on with full knowledge of the property and no pressure to act.',
      },
    ],
  },
  {
    title: 'Legal & Documents',
    terms: [
      {
        term: 'Deed',
        definition:
          'The legal document that transfers ownership of real property from seller to buyer.',
      },
      {
        term: 'Title',
        definition:
          'The legal right to own and use a property. A clean title is one without liens or other encumbrances.',
      },
      {
        term: 'Survey',
        definition:
          'A professional measurement of a property\'s boundaries and structures, often required to verify lot lines.',
      },
      {
        term: 'Lien',
        definition:
          'A legal claim against a property, often by a lender or contractor, that must be paid off before the property can be sold.',
      },
      {
        term: 'Easement',
        definition:
          'A right granted to others to use part of your property for a specific purpose, such as utility access.',
      },
    ],
  },
  {
    title: 'The Transaction',
    terms: [
      {
        term: 'Purchase Contract',
        definition:
          'The binding agreement between buyer and seller specifying price, terms, and conditions of the sale.',
      },
      {
        term: 'Contingency',
        definition:
          'A condition in the contract that must be met for the sale to proceed — for example, financing, inspection, or appraisal contingencies.',
      },
      {
        term: 'Earnest Money',
        definition:
          'A good-faith deposit a buyer makes to show serious intent. It is typically applied toward the down payment at closing.',
      },
      {
        term: 'Due Diligence',
        definition:
          'In North Carolina, the period after contract signing during which the buyer can investigate the property and terminate without penalty (forfeiting only the due diligence fee).',
      },
      {
        term: 'Closing',
        definition:
          'The final step of the transaction when ownership officially transfers, documents are signed, and funds are disbursed.',
      },
      {
        term: 'Escrow',
        definition:
          'A neutral third-party account that holds funds or documents until contractual conditions are satisfied.',
      },
    ],
  },
  {
    title: 'Insurance & Protections',
    terms: [
      {
        term: 'Hazard Insurance',
        definition:
          'Homeowner\'s insurance covering damage from fire, storms, and similar perils. Required by lenders.',
      },
      {
        term: 'Title Insurance',
        definition:
          'A policy protecting buyers and lenders against losses from disputes over property ownership.',
      },
      {
        term: 'Flood Insurance',
        definition:
          'Separate coverage for flood damage, required for homes in designated flood zones.',
      },
      {
        term: 'Mortgage Insurance (PMI)',
        definition:
          'Insurance protecting the lender if a borrower defaults; typically required when the down payment is less than 20%.',
      },
      {
        term: 'Home Warranty',
        definition:
          'A service contract covering repairs or replacement of major home systems and appliances during the first year of ownership.',
      },
    ],
  },
  {
    title: 'Other Terms',
    terms: [
      {
        term: 'HELOC (Home Equity Line of Credit)',
        definition:
          'A revolving line of credit secured by the equity in your home, often used for renovations or major expenses.',
      },
      {
        term: 'HOA Dues',
        definition:
          'Fees paid to a homeowners association to fund community amenities, maintenance, and reserves.',
      },
      {
        term: 'PITI',
        definition:
          'The four components of a typical mortgage payment: Principal, Interest, Taxes, and Insurance.',
      },
    ],
  },
];
