import type { Company, Lead, SearchFilters } from '@/data';

export type ParsedSearch = {
  industry: string;
  location: string;
  companyType: string;
  roles: string[];
  seniority: string;
  keywords: string[];
};

export type GeneratedSearchResults = {
  peopleResults: Lead[];
  companyResults: Company[];
  interpretation: ParsedSearch;
};

type AliasGroup = {
  canonical: string;
  aliases: string[];
};

type RoleProfile = {
  canonical: string;
  aliases: string[];
  titles: string[];
  department: string;
  seniority: string;
};

const industryGroups: AliasGroup[] = [
  { canonical: 'Technology', aliases: ['technology', 'tech', 'software', 'saas', 'cloud', 'ai', 'artificial intelligence', 'cybersecurity', 'cyber security', 'developer tools', 'information technology'] },
  { canonical: 'Financial Services', aliases: ['financial services', 'finance', 'banking', 'bank', 'fintech', 'payments', 'lending', 'investment', 'insurance'] },
  { canonical: 'Healthcare', aliases: ['healthcare', 'health care', 'healthtech', 'health tech', 'medical', 'hospital', 'biotech', 'pharma', 'pharmaceutical'] },
  { canonical: 'Real Estate', aliases: ['real estate', 'property', 'proptech', 'construction', 'architecture'] },
  { canonical: 'Education', aliases: ['education', 'edtech', 'school', 'university', 'learning'] },
  { canonical: 'Logistics & Supply Chain', aliases: ['logistics', 'supply chain', 'shipping', 'freight', 'warehouse', 'delivery', 'transportation'] },
  { canonical: 'Food & Beverage', aliases: ['food', 'beverage', 'restaurant', 'restaurants', 'grocery', 'foodtech', 'hospitality'] },
  { canonical: 'Apparel & Fashion', aliases: ['apparel', 'fashion', 'clothing', 'garment', 'textile', 'textiles', 'womenswear', 'menswear', 'beauty'] },
  { canonical: 'Marketing & Advertising', aliases: ['marketing', 'advertising', 'branding', 'creative agency', 'public relations', 'pr agency'] },
  { canonical: 'Consumer Goods', aliases: ['consumer goods', 'consumer brand', 'consumer brands', 'retail', 'ecommerce', 'e-commerce', 'direct to consumer', 'dtc'] },
  { canonical: 'Packaging & Manufacturing', aliases: ['packaging', 'packaging industry', 'sustainable packaging', 'industrial goods'] },
  { canonical: 'Energy & Climate', aliases: ['energy', 'solar', 'renewable', 'renewables', 'climate', 'cleantech', 'oil and gas'] },
  { canonical: 'Professional Services', aliases: ['professional services', 'consulting', 'consultancy', 'legal', 'accounting', 'recruitment'] },
];

const locationGroups: AliasGroup[] = [
  { canonical: 'Pakistan', aliases: ['pakistan', 'pakistani'] },
  { canonical: 'Lahore, Pakistan', aliases: ['lahore'] },
  { canonical: 'Karachi, Pakistan', aliases: ['karachi'] },
  { canonical: 'Islamabad, Pakistan', aliases: ['islamabad'] },
  { canonical: 'Sialkot, Pakistan', aliases: ['sialkot'] },
  { canonical: 'Rawalpindi, Pakistan', aliases: ['rawalpindi'] },
  { canonical: 'Dubai, UAE', aliases: ['dubai', 'uae', 'united arab emirates'] },
  { canonical: 'Abu Dhabi, UAE', aliases: ['abu dhabi'] },
  { canonical: 'London, United Kingdom', aliases: ['london', 'uk', 'united kingdom', 'england'] },
  { canonical: 'New York, United States', aliases: ['new york', 'nyc', 'united states', 'usa', 'us'] },
  { canonical: 'San Francisco, United States', aliases: ['san francisco', 'bay area', 'silicon valley'] },
  { canonical: 'Toronto, Canada', aliases: ['toronto', 'canada'] },
  { canonical: 'Singapore', aliases: ['singapore'] },
  { canonical: 'Berlin, Germany', aliases: ['berlin', 'germany'] },
  { canonical: 'Sydney, Australia', aliases: ['sydney', 'australia'] },
  { canonical: 'Bengaluru, India', aliases: ['bengaluru', 'bangalore', 'india'] },
];

const companyTypeGroups: AliasGroup[] = [
  { canonical: 'Startup', aliases: ['startup', 'start-up', 'startups', 'scaleup', 'scale-up', 'venture-backed'] },
  { canonical: 'SaaS', aliases: ['saas', 'software as a service'] },
  { canonical: 'Agency', aliases: ['agency', 'agencies', 'studio', 'creative studio', 'consultancy'] },
  { canonical: 'E-commerce', aliases: ['ecommerce', 'e-commerce', 'online store', 'online retail', 'marketplace'] },
  { canonical: 'Manufacturer', aliases: ['manufacturer', 'manufacturing', 'factory', 'factories', 'producer'] },
  { canonical: 'Enterprise', aliases: ['enterprise', 'corporation', 'corporate', 'multinational', 'fortune 500'] },
  { canonical: 'Nonprofit', aliases: ['nonprofit', 'non-profit', 'ngo', 'charity', 'foundation'] },
  { canonical: 'Marketplace', aliases: ['marketplace', 'platform business'] },
];

const roleProfiles: RoleProfile[] = [
  { canonical: 'Founder', aliases: ['founder', 'founders', 'co-founder', 'co-founders', 'cofounder', 'cofounders', 'owner', 'owners', 'entrepreneur', 'entrepreneurs'], titles: ['Founder & CEO', 'Co-founder', 'Founder'], department: 'Executive', seniority: 'Founder' },
  { canonical: 'Chief Executive Officer', aliases: ['ceo', 'ceos', 'chief executive', 'chief executives', 'chief executive officer'], titles: ['Chief Executive Officer', 'CEO', 'Managing Director'], department: 'Executive', seniority: 'Executive' },
  { canonical: 'Chief Technology Officer', aliases: ['cto', 'chief technology', 'chief technology officer'], titles: ['Chief Technology Officer', 'CTO', 'VP Engineering'], department: 'Engineering', seniority: 'Executive' },
  { canonical: 'Chief Marketing Officer', aliases: ['cmo', 'chief marketing', 'chief marketing officer'], titles: ['Chief Marketing Officer', 'CMO', 'VP Marketing'], department: 'Marketing', seniority: 'Executive' },
  { canonical: 'Head of Sales', aliases: ['head of sales', 'sales leader', 'sales leaders', 'sales leadership', 'sales director', 'sales directors'], titles: ['Head of Sales', 'Sales Director', 'VP Sales'], department: 'Sales', seniority: 'Director' },
  { canonical: 'Account Executive', aliases: ['account executive', 'account executives', 'ae', 'sales executive', 'sales executives'], titles: ['Account Executive', 'Enterprise Account Executive', 'Senior Account Executive'], department: 'Sales', seniority: 'Mid-level' },
  { canonical: 'Head of Marketing', aliases: ['head of marketing', 'marketing leader', 'marketing leaders', 'marketing leadership', 'marketing director', 'marketing directors'], titles: ['Head of Marketing', 'Marketing Director', 'VP Marketing'], department: 'Marketing', seniority: 'Director' },
  { canonical: 'Growth Lead', aliases: ['growth', 'growth lead', 'growth leads', 'growth manager', 'growth managers', 'demand generation', 'demand gen'], titles: ['Growth Lead', 'Head of Growth', 'Growth Marketing Manager'], department: 'Growth', seniority: 'Lead' },
  { canonical: 'Brand Manager', aliases: ['brand manager', 'brand managers', 'brand lead', 'brand leads', 'brand director', 'brand directors', 'branding'], titles: ['Brand Manager', 'Senior Brand Manager', 'Brand Director'], department: 'Marketing', seniority: 'Senior' },
  { canonical: 'Product Manager', aliases: ['product manager', 'product managers', 'product leader', 'product lead'], titles: ['Product Manager', 'Senior Product Manager', 'Head of Product'], department: 'Product', seniority: 'Senior' },
  { canonical: 'Software Engineer', aliases: ['software engineer', 'software engineers', 'developer', 'developers', 'engineering manager', 'engineer'], titles: ['Software Engineer', 'Senior Software Engineer', 'Engineering Manager'], department: 'Engineering', seniority: 'Senior' },
  { canonical: 'Data & AI Leader', aliases: ['data scientist', 'data science', 'machine learning', 'ai leader', 'analytics leader', 'data leader'], titles: ['Head of Data', 'Machine Learning Lead', 'Analytics Director'], department: 'Data & AI', seniority: 'Lead' },
  { canonical: 'People & Talent Leader', aliases: ['hr', 'human resources', 'people operations', 'talent', 'recruiting', 'recruitment'], titles: ['Head of People', 'Talent Acquisition Lead', 'People Operations Manager'], department: 'People', seniority: 'Lead' },
  { canonical: 'Operations Leader', aliases: ['operations', 'operations manager', 'operations director', 'chief operating officer', 'coo'], titles: ['Head of Operations', 'Operations Director', 'COO'], department: 'Operations', seniority: 'Director' },
  { canonical: 'Procurement Leader', aliases: ['procurement', 'purchasing', 'sourcing', 'supply chain manager'], titles: ['Head of Procurement', 'Procurement Director', 'Sourcing Manager'], department: 'Operations', seniority: 'Director' },
];

const seniorityAliases: AliasGroup[] = [
  { canonical: 'Entry-level', aliases: ['junior', 'entry level', 'entry-level', 'associate'] },
  { canonical: 'Mid-level', aliases: ['mid-level', 'mid level', 'manager'] },
  { canonical: 'Senior', aliases: ['senior', 'lead', 'principal'] },
  { canonical: 'Director', aliases: ['director', 'head of', 'vp', 'vice president'] },
  { canonical: 'Executive', aliases: ['executive', 'c-suite', 'c suite', 'chief'] },
];

const stopWords = new Set([
  'a', 'an', 'and', 'at', 'around', 'based', 'businesses', 'business', 'by', 'companies', 'company',
  'find', 'firms', 'for', 'from', 'in', 'looking', 'me', 'near', 'of', 'on', 'people', 'please',
  'prospects', 'that', 'the', 'to', 'who', 'with', 'within', 'working', 'organizations', 'leads',
  'lead', 'decision', 'makers', 'professionals', 'teams', 'team', 'hiring', 'seeking', 'show',
]);

function normalize(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s&-]/gu, ' ').replace(/\s+/g, ' ').trim();
}

function hasAlias(text: string, alias: string) {
  const tokens = normalize(alias).split(' ');
  const pattern = tokens.map((token, index) => `${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${index === tokens.length - 1 ? 's?' : ''}`).join('\\s+');
  return new RegExp(`(^|\\s)${pattern}(?=\\s|$)`).test(text);
}

function findGroup(text: string, groups: AliasGroup[]) {
  return [...groups].sort((a, b) => Math.max(...b.aliases.map(alias => alias.length)) - Math.max(...a.aliases.map(alias => alias.length))
    ).find(group => group.aliases.some(alias => hasAlias(text, alias)));
}

function extractFallbackLocation(text: string) {
  const match = text.match(/\b(?:in|near|around|based in|located in|from)\s+([a-z][a-z\s-]{2,36}?)(?=\s+(?:who|with|for|looking|seeking|hiring|that|and|or|at|as)\b|$)/i);
  if (!match) return '';
  const candidate = match[1].trim().replace(/\s+(?:companies|businesses|firms|startups?)$/i, '').trim();
  if (!candidate || candidate.split(' ').some(word => industryGroups.some(group => group.aliases.includes(word)))) return '';
  return candidate.replace(/\b\w/g, char => char.toUpperCase());
}

function findRoles(text: string, explicitTitle: string) {
  if (explicitTitle) {
    const match = roleProfiles.find(profile => explicitTitle.toLowerCase().includes(profile.canonical.toLowerCase()) || profile.aliases.some(alias => hasAlias(normalize(explicitTitle), alias)));
    return [match?.canonical ?? explicitTitle];
  }
  const matches = roleProfiles.filter(profile => profile.aliases.some(alias => hasAlias(text, alias))).map(profile => profile.canonical);
  if (matches.length) return matches.slice(0, 4);
  if (/\b(decision makers?|leaders?|executives?|buyers?)\b/.test(text)) return ['Founder', 'Chief Executive Officer', 'Head of Marketing'];
  return ['Founder', 'Head of Sales', 'Head of Marketing'];
}

function wordsForKeywords(text: string) {
  const recognized = new Set(
    [...industryGroups, ...locationGroups, ...companyTypeGroups, ...roleProfiles, ...seniorityAliases]
      .flatMap(group => 'aliases' in group ? group.aliases : [])
      .flatMap(alias => normalize(alias).split(' ')),
  );
  return [...new Set(text.split(' ').filter(word => word.length > 2 && !stopWords.has(word) && !recognized.has(word) && !recognized.has(word.replace(/s$/, ''))))].slice(0, 4);
}

export function interpretSearch(query: string, filters: SearchFilters): ParsedSearch {
  const text = normalize(query);
  const industry = (Array.isArray(filters.industry) ? filters.industry : [filters.industry]).filter(Boolean).join(', ') || findGroup(text, industryGroups)?.canonical || '';
  const location = filters.location || findGroup(text, locationGroups)?.canonical || extractFallbackLocation(text);
  const companyType = findGroup(text, companyTypeGroups)?.canonical || '';
  const seniority = findGroup(text, seniorityAliases)?.canonical || '';
  const roles = findRoles(text, (Array.isArray(filters.title) ? filters.title : [filters.title]).filter(Boolean).join(', '));
  const locationWords = new Set(normalize(location).split(' '));
  return {
    industry,
    location,
    companyType,
    roles,
    seniority,
    keywords: wordsForKeywords(text).filter(word => !locationWords.has(word)),
  };
}

export function generateSearchResults(query: string, filters: SearchFilters): GeneratedSearchResults {
  const interpretation = interpretSearch(query, filters);
  const company: Company = {
    id: `generated-company-${normalize(query).replace(/[^a-z0-9]+/g, '-') || 'result'}`,
    name: `${interpretation.industry || 'Target'} Company`,
    initials: 'TC',
    industry: interpretation.industry || 'Company',
    location: interpretation.location || 'Unknown',
    size: 'Unknown',
    companyType: interpretation.companyType || 'Company',
    website: 'example.com',
    linkedin: 'linkedin.com',
    description: 'Generated search result.',
    founded: 0,
    peopleCount: 0,
    relevanceScore: 80,
  };
  return { peopleResults: [], companyResults: [company], interpretation };
}

