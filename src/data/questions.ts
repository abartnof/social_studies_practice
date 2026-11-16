/// <reference types="vite/client" />
import type { Domain, Question } from '../types/quiz';

/**
 * Praxis 5581 (Social Studies: Content Knowledge) question bank.
 * 50 questions total (10 per domain: US, World, Civics, Geo, Econ):
 * - 10 'mc' (2/domain)
 * - 5  'ordering' (1/domain, chronological)
 * - 5  'causal' (1/domain, cause-and-effect)
 * - 10 'deduction' (2/domain, 3 short clues)
 * - 5  'map' (1/domain, physical-geography SVG pins)
 * - 5  'compare' (1/domain, 2-bucket sorting)
 * - 5  'data' (1/domain, 3x3 table stimulus)
 * - 5  'synthesis' (1/domain, Final Wager Question)
 */
const BASE_QUESTIONS: Question[] = [
  // =========================================================================
  // US HISTORY (10)
  // =========================================================================
  {
    id: 'us-mc-1',
    type: 'mc',
    domain: 'US',
    subdomain: 'Colonial Regionalism',
    era: '1620–1750',
    skill_tag: 'primary_source',
    trap_type: 'era_bleed',
    geo: { lat: 42.3601, lng: -71.0589, label: 'Boston, Massachusetts' },
    stimulus: {
      kind: 'excerpt',
      title: 'A Model of Christian Charity (1630)',
      text: 'We must consider that we shall be as a city upon a hill. The eyes of all people are upon us.',
      attribution: 'John Winthrop, aboard the Arbella',
    },
    prompt: 'Which colonial region does this 1630 sermon reflect?',
    options: [
      {
        id: 'a',
        text: 'New England, built around Puritan towns and church covenants',
      },
      {
        id: 'b',
        text: 'The Chesapeake, built on scattered tobacco plantations',
      },
      {
        id: 'c',
        text: 'The Middle Colonies, known for Quaker and Dutch settlements',
      },
      {
        id: 'd',
        text: 'The Carolina Lowcountry, built on rice farms and slave labor',
      },
    ],
    answer: 'a',
    explanation:
      'John Winthrop gave this 1630 speech to Massachusetts Puritans who built tight-knit church towns.',
    fun_fact:
      "Winthrop's sermon wasn't printed until 1838—it sat in manuscript for over 200 years.",
    trap_notes: {
      b: 'Virginia and Maryland focused on large tobacco farms, not Puritan towns.',
      c: 'Pennsylvania (1681) and New York were Middle Colonies, not 1630 Massachusetts.',
      d: "Carolina's rice plantations began after 1670, decades after 1630.",
      default: '"City upon a hill" (1630) was a Puritan speech in New England.',
    },
  },
  {
    id: 'us-mc-2',
    type: 'mc',
    domain: 'US',
    subdomain: 'New Deal',
    era: '1933–1939',
    skill_tag: 'conceptual',
    trap_type: 'policy_lever_swap',
    geo: { lat: 38.9072, lng: -77.0369, label: 'Washington, D.C.' },
    prompt: 'How did the 1935 Wagner Act change U.S. labor rules?',
    options: [
      {
        id: 'a',
        text: "It protected workers' right to unionize and created the NLRB",
      },
      {
        id: 'b',
        text: 'It created old-age pensions paid by payroll taxes',
      },
      {
        id: 'c',
        text: 'It insured bank deposits to stop Great Depression bank runs',
      },
      {
        id: 'd',
        text: 'It paid farmers to grow fewer crops and lift farm prices',
      },
    ],
    answer: 'a',
    explanation:
      'The 1935 Wagner Act protected the right to join unions and set up the NLRB to enforce fair rules.',
    fun_fact:
      'Union membership jumped from 3.7 million in 1935 to over 14 million within ten years.',
    trap_notes: {
      b: 'Retirement pensions came from the Social Security Act (1935).',
      c: 'Bank deposit insurance came from the 1933 Glass-Steagall Act (FDIC).',
      d: 'Paying farmers to plant less was part of the 1933 Agricultural Adjustment Act.',
      default: 'Wagner Act = unions and the NLRB. Social Security = pensions.',
    },
  },
  {
    id: 'us-ord-1',
    type: 'ordering',
    domain: 'US',
    subdomain: 'Constitutional Compromises',
    era: '1786–1791',
    ordering_mode: 'chronological',
    skill_tag: 'chronology',
    trap_type: 'era_bleed',
    geo: { lat: 39.9489, lng: -75.15, label: 'Independence Hall, Philadelphia' },
    prompt: 'Order these constitutional milestones earliest to latest:',
    options: [
      { id: 'a', text: 'Bill of Rights ratified (First Ten Amendments)' },
      { id: 'b', text: "Shays' Rebellion exposes Articles' weakness" },
      { id: 'c', text: 'Great Compromise creates a two-house Congress' },
      { id: 'd', text: 'Federalist No. 10 backs NY ratification' },
    ],
    answer: ['b', 'c', 'd', 'a'],
    explanation:
      "Shays' Rebellion (1786) led to the 1787 Constitution and the 1791 Bill of Rights.",
    fun_fact:
      'Rhode Island skipped the 1787 Convention and ratified only in 1790 after a trade threat.',
    trap_notes: {
      default:
        "Timeline: Shays' Rebellion (1786), Great Compromise (July 1787), Federalist No. 10 (Nov 1787), Bill of Rights (1791).",
    },
  },
  {
    id: 'us-cau-1',
    type: 'causal',
    domain: 'US',
    subdomain: 'Reconstruction & 14th Amendment',
    era: '1865–1877',
    ordering_mode: 'causal',
    skill_tag: 'causation',
    trap_type: 'reverse_causation',
    geo: { lat: 33.749, lng: -84.388, label: 'Atlanta, Georgia' },
    prompt: 'Order how Reconstruction ended in the 1877 Compromise:',
    options: [
      { id: 'a', text: 'Congress passes Reconstruction Acts & 14th Amendment' },
      { id: 'b', text: '1876 election deal withdraws federal troops' },
      { id: 'c', text: 'Southern states enact restrictive Black Codes' },
      { id: 'd', text: 'Panic of 1873 weakens Northern GOP support' },
    ],
    answer: ['c', 'a', 'd', 'b'],
    explanation:
      'Black Codes (1865) sparked the 14th Amendment, while the 1873 crash faded support until troops left in 1877.',
    fun_fact:
      "The 1876 election was so close that a 15-member panel decided it 8–7, giving Hayes the nickname 'Rutherfraud.'",
    trap_notes: {
      default:
        'Black Codes came first and prompted Congress to act; later, the 1873 crash led to the 1877 troop withdrawal.',
    },
  },
  {
    id: 'us-ded-1',
    type: 'deduction',
    domain: 'US',
    subdomain: 'Gilded Age & Populism',
    era: '1890–1896',
    skill_tag: 'primary_source',
    trap_type: 'era_bleed',
    geo: { lat: 41.2565, lng: -95.9345, label: 'Omaha, Nebraska' },
    clues: [
      'This 1892 platform warned that "fruits of the toil of millions are boldly stolen" for a few.',
      'It united Western and Southern farmers against railroad monopolies and the gold standard.',
      'It called for free silver, a graduated income tax, and direct election of U.S. senators.',
    ],
    prompt: 'Which document do these clues identify?',
    options: [
      { id: 'a', text: "The Populist Party's Omaha Platform" },
      { id: 'b', text: 'The Knights of Labor Constitution (1869)' },
      { id: 'c', text: "Theodore Roosevelt's New Nationalism (1910)" },
      { id: 'd', text: 'The Grange Munn v. Illinois Brief (1877)' },
    ],
    answer: 'a',
    explanation:
      "The Populist Party's 1892 Omaha Platform pushed for silver money, an income tax, and direct Senate votes.",
    fun_fact:
      "Populist speaker Mary Elizabeth Lease urged Kansas farmers to 'raise less corn and more hell.'",
    trap_notes: {
      b: 'The Knights of Labor focused on factory workers and an 8-hour workday.',
      c: 'Roosevelt gave his New Nationalism speech in 1910, almost 20 years later.',
      d: 'Munn v. Illinois (1877) was a court case about grain storage rates, not an 1892 platform.',
      default: '1892 + farmers + free silver + income tax = Populist Omaha Platform.',
    },
  },
  {
    id: 'us-ded-2',
    type: 'deduction',
    domain: 'US',
    subdomain: 'Cold War & Civil Rights',
    era: '1947–1954',
    skill_tag: 'conceptual',
    trap_type: 'era_bleed',
    geo: { lat: 39.0473, lng: -95.6752, label: 'Topeka, Kansas' },
    clues: [
      'In 1954, the Justice Department warned that school segregation hurt U.S. standing abroad.',
      'The unanimous ruling declared "separate educational facilities are inherently unequal."',
      'Thurgood Marshall and the NAACP led the combined cases from five states, including Kansas.',
    ],
    prompt: 'Which Supreme Court decision is described?',
    options: [
      { id: 'a', text: 'Brown v. Board of Education of Topeka' },
      { id: 'b', text: 'Loving v. Virginia' },
      { id: 'c', text: 'Sweatt v. Painter' },
      { id: 'd', text: 'Hernandez v. Texas' },
    ],
    answer: 'a',
    explanation:
      'In Brown v. Board (1954), the Supreme Court ruled that segregated public schools violate the 14th Amendment.',
    fun_fact:
      "Kenneth and Mamie Clark's 'doll test' showed segregation's harm and was cited in Footnote 11.",
    trap_notes: {
      b: 'Loving v. Virginia (1967) ended state bans on interracial marriage.',
      c: 'Sweatt v. Painter (1950) opened one Texas law school without ending all school segregation.',
      d: "Hernandez v. Texas (1954) protected Mexican Americans' right to serve on juries.",
      default: '1954 + Thurgood Marshall + Topeka schools = Brown v. Board of Education.',
    },
  },
  {
    id: 'us-map-1',
    type: 'map',
    domain: 'US',
    subdomain: 'Westward Expansion & Waterways',
    era: '1803',
    skill_tag: 'spatial_reasoning',
    trap_type: 'scale_confusion',
    geo: { lat: 29.9511, lng: -90.0715, label: 'New Orleans, Louisiana' },
    mapSpec: {
      region: 'north_america',
      pins: [
        { id: 'a', x: 184, y: 158, label: 'New Orleans' },
        { id: 'b', x: 242, y: 74, label: 'Lake Erie' },
        { id: 'c', x: 240, y: 108, label: 'Cumberland Gap' },
        { id: 'd', x: 48, y: 98, label: 'San Francisco Bay' },
      ],
    },
    prompt: 'Tap the port that made the 1803 Louisiana Purchase vital for western farmers.',
    options: [],
    answer: 'a',
    explanation:
      'New Orleans sits at the mouth of the Mississippi River, letting western farmers ship crops to the ocean.',
    fun_fact:
      'Thomas Jefferson only offered to buy New Orleans at first—Napoleon surprised him by selling all of Louisiana.',
    trap_notes: {
      b: 'The Erie Canal opened in 1825, linking the Great Lakes to New York City.',
      c: 'The Cumberland Gap was a mountain pass for wagons, not an ocean port.',
      d: 'San Francisco Bay was part of Spanish and Mexican California until 1848.',
      default: 'Western farmers floated crops down the Mississippi River to New Orleans.',
    },
  },
  {
    id: 'us-comp-1',
    type: 'compare',
    domain: 'US',
    subdomain: 'Constitutional Ratification',
    era: '1787–1789',
    skill_tag: 'conceptual',
    trap_type: 'jurisdiction_swap',
    geo: { lat: 39.9489, lng: -75.15, label: 'Philadelphia, Pennsylvania' },
    compareSpec: {
      leftLabel: 'Federalists',
      rightLabel: 'Anti-Federalists',
      items: [
        { id: 'a', text: 'Wanted a strong national government', bucket: 'left' },
        { id: 'b', text: 'Demanded a Bill of Rights first', bucket: 'right' },
        { id: 'c', text: 'Backed by Madison and Hamilton', bucket: 'left' },
        { id: 'd', text: 'Feared distant executive power', bucket: 'right' },
      ],
    },
    prompt: 'Sort each view into Federalists or Anti-Federalists.',
    options: [],
    answer: 'all_matched',
    explanation:
      'Federalists wanted a stronger national government, while Anti-Federalists feared tyranny without a Bill of Rights.',
    fun_fact:
      'Madison, Hamilton, and Jay wrote 85 Federalist Papers under the shared pen name "Publius."',
    trap_notes: {
      default:
        'Federalists backed the new Constitution; Anti-Federalists wanted stronger states and a Bill of Rights.',
    },
  },
  {
    id: 'us-data-1',
    type: 'data',
    domain: 'US',
    subdomain: 'Civil War Resources',
    era: '1860–1865',
    skill_tag: 'data_literacy',
    trap_type: 'scale_confusion',
    geo: { lat: 40.4406, lng: -79.9959, label: 'Pittsburgh, Pennsylvania' },
    stimulus: {
      kind: 'table',
      title: 'U.S. Regional Resources (1860)',
      headers: ['Region', 'Population', 'Rail Miles'],
      rows: [
        ['North', '22M', '22,000'],
        ['South', '9M', '9,000'],
        ['Border States', '3M', '1,700'],
      ],
    },
    prompt: 'Which Union advantage does this 1860 table show?',
    options: [
      { id: 'a', text: 'Over twice the people and rail miles to supply armies' },
      { id: 'b', text: 'Shorter supply lines inside Confederate territory' },
      { id: 'c', text: 'More rail miles in Border States than in the North' },
      { id: 'd', text: 'Equal population sizes across all three regions' },
    ],
    answer: 'a',
    explanation:
      'In 1860, the North had 22 million people and 22,000 rail miles—more than double the South in both.',
    fun_fact:
      'Northern railroads used a standard track width more often, while Southern lines had many mismatched gauges.',
    trap_notes: {
      b: 'Fighting on home ground was a Southern advantage, not a Northern one.',
      c: 'Border States had only 1,700 rail miles compared to 22,000 in the North.',
      d: 'The North had 22M people while the South had 9M, which is not equal.',
      default: 'Compare the rows: North had 22M people and 22,000 rail miles vs. 9M and 9,000.',
    },
  },
  {
    id: 'us-syn-1',
    type: 'synthesis',
    domain: 'US',
    secondary_domains: ['World', 'Econ'],
    subdomain: 'Cold War Containment',
    era: '1947–1951',
    skill_tag: 'synthesis',
    trap_type: 'scale_confusion',
    geo: { lat: 38.9072, lng: -77.0369, label: 'Washington, D.C.' },
    secondary_geo: { lat: 52.52, lng: 13.405, label: 'Berlin, Germany' },
    prompt: 'Why did the 1948 Marshall Plan pair $13B in European aid with lower trade barriers?',
    options: [
      {
        id: 'a',
        text: 'To rebuild export markets and stabilize democracies against communism',
      },
      {
        id: 'b',
        text: 'To force European empires to immediately free every colony',
      },
      {
        id: 'c',
        text: 'To replace the U.S. dollar with a single European currency',
      },
      {
        id: 'd',
        text: 'To fund the Soviet Warsaw Pact military alliance',
      },
    ],
    answer: 'a',
    explanation:
      'The 1948 Marshall Plan rebuilt Western Europe so nations could buy U.S. goods and resist communism.',
    fun_fact:
      'The USSR was invited to join the Marshall Plan, but walked out calling it "dollar imperialism."',
    trap_notes: {
      b: 'The U.S. did not require immediate decolonization to receive Marshall Plan aid.',
      c: 'Bretton Woods (1944) kept the U.S. dollar as the anchor currency until 1971.',
      d: 'The Warsaw Pact (1955) was the Soviet military alliance, which opposed the Marshall Plan.',
      default: 'Marshall Plan = rebuild Europe to boost U.S. trade and contain communism.',
    },
  },

  // =========================================================================
  // WORLD HISTORY (10)
  // =========================================================================
  {
    id: 'world-mc-1',
    type: 'mc',
    domain: 'World',
    subdomain: 'River Valley Civilizations',
    era: 'c. 1750 BCE',
    skill_tag: 'primary_source',
    trap_type: 'era_bleed',
    geo: { lat: 32.5422, lng: 44.421, label: 'Babylon, Mesopotamia' },
    stimulus: {
      kind: 'excerpt',
      title: 'Code of Hammurabi (c. 1750 BCE)',
      text: "If a nobleman puts out a nobleman's eye, his eye shall be put out; for a commoner's eye, he pays one mina of silver.",
      attribution: 'Old Babylonian Legal Stele',
    },
    prompt: 'What does this law show about Old Babylonian society?',
    options: [
      {
        id: 'a',
        text: 'Written laws set different punishments based on social class',
      },
      {
        id: 'b',
        text: 'All free people received identical legal punishments',
      },
      {
        id: 'c',
        text: 'Priests banned royal courts from hearing criminal cases',
      },
      {
        id: 'd',
        text: 'Silver fines replaced physical punishments for every crime',
      },
    ],
    answer: 'a',
    explanation:
      "Hammurabi's Code scaled punishments by rank: nobles faced physical harm for equals, but paid fines for commoners.",
    fun_fact:
      "Hammurabi's 7-foot stone stele also punished tavern owners who watered down beer.",
    trap_notes: {
      b: 'The excerpt treats nobles and commoners very differently.',
      c: 'King Hammurabi issued these laws for royal courts.',
      d: 'Physical punishment still applied when both people held the same rank.',
      default: 'Compare the two lines: noble vs. noble loses an eye; noble vs. commoner pays silver.',
    },
  },
  {
    id: 'world-mc-2',
    type: 'mc',
    domain: 'World',
    subdomain: 'Protestant Reformation',
    era: '1517–1687',
    skill_tag: 'conceptual',
    trap_type: 'scale_confusion',
    geo: { lat: 51.8667, lng: 12.65, label: 'Wittenberg, Germany' },
    prompt: "What most helped Luther's 95 Theses spread fast after 1517?",
    options: [
      {
        id: 'a',
        text: 'Movable-type printing presses making cheap local-language pamphlets',
      },
      {
        id: 'b',
        text: 'Ottoman Silk Road rules forcing German princes to teach reading',
      },
      {
        id: 'c',
        text: 'The Catholic Council of Trent endorsing vernacular Bibles',
      },
      {
        id: 'd',
        text: 'Royal Society science journals publishing religious essays',
      },
    ],
    answer: 'a',
    explanation:
      "Gutenberg's printing press let printers make cheap German copies of Luther's ideas within weeks.",
    fun_fact:
      "Luther wrote his 95 Theses in Latin for scholars, but printers translated them into German and flooded Europe.",
    trap_notes: {
      b: 'Ottoman trade routes pushed Europeans to sail oceans, not print German booklets.',
      c: 'The Council of Trent (1545–1563) was a Catholic meeting that kept the Bible in Latin.',
      d: 'The Royal Society began in 1660 for science, over a century after 1517.',
      default: 'Link 1517 to Gutenberg’s printing press and cheap local-language pamphlets.',
    },
  },
  {
    id: 'world-ord-1',
    type: 'ordering',
    domain: 'World',
    subdomain: 'Afro-Eurasian Trade',
    era: '750–1453',
    ordering_mode: 'chronological',
    skill_tag: 'chronology',
    trap_type: 'era_bleed',
    geo: { lat: 33.3152, lng: 44.3661, label: 'Baghdad, Iraq' },
    prompt: 'Order these Afro-Eurasian milestones earliest to latest:',
    options: [
      { id: 'a', text: "Mansa Musa's 1324 hajj showcases Mali's gold" },
      { id: 'b', text: 'Pax Mongolica secures overland Silk Road trade' },
      { id: 'c', text: 'Abbasid Caliphate founds Baghdad & House of Wisdom' },
      { id: 'd', text: 'Ottoman forces conquer Constantinople (1453)' },
    ],
    answer: ['c', 'b', 'a', 'd'],
    explanation:
      "Abbasid Baghdad (762) came first, then Mongol peace (late 1200s), Mansa Musa (1324), and Ottoman Constantinople (1453).",
    fun_fact:
      "Mansa Musa spent so much gold in Cairo in 1324 that he crashed Egypt's gold market for a decade.",
    trap_notes: {
      default:
        'Timeline: Baghdad (762), Pax Mongolica (late 1200s), Mansa Musa (1324), Constantinople (1453).',
    },
  },
  {
    id: 'world-cau-1',
    type: 'causal',
    domain: 'World',
    subdomain: 'Meiji Restoration',
    era: '1853–1905',
    ordering_mode: 'causal',
    skill_tag: 'causation',
    trap_type: 'reverse_causation',
    geo: { lat: 35.6762, lng: 139.6503, label: 'Tokyo, Japan' },
    prompt: "Order the cause-and-effect chain of Japan's Meiji rise:",
    options: [
      { id: 'a', text: 'Meiji state builds rail and textile mills' },
      { id: 'b', text: 'Commodore Perry (1853) forces unequal treaties' },
      { id: 'c', text: 'Industrial power wins Russo-Japanese War (1905)' },
      { id: 'd', text: 'Coalition topples Tokugawa Shogunate (1868)' },
    ],
    answer: ['b', 'd', 'a', 'c'],
    explanation:
      'U.S. warships in 1853 exposed weakness, sparking the 1868 Meiji takeover, rapid factories, and a 1905 war win.',
    fun_fact:
      'Samurai who toppled the shogun in 1868 soon saw their own warrior class abolished.',
    trap_notes: {
      default:
        'Sequence: U.S. ships arrive (1853), Meiji rulers take power (1868), factories grow, Japan wins in 1905.',
    },
  },
  {
    id: 'world-ded-1',
    type: 'deduction',
    domain: 'World',
    subdomain: 'Indian Ocean Trade',
    era: 'c. 1st Century CE',
    skill_tag: 'primary_source',
    trap_type: 'era_bleed',
    geo: { lat: 11.2588, lng: 75.7804, label: 'Malabar Coast, India' },
    clues: [
      'A 1st-century Greek guide noted ships at Indian ports "bringing wine... and exporting silk."',
      'Sailors timed trips between Roman Egypt and western India using seasonal wind reversals.',
      'This sea network linked East Africa, Arabia, India, and Southeast Asia.',
    ],
    prompt: 'Which natural system powered this trade network?',
    options: [
      { id: 'a', text: 'Indian Ocean monsoon wind patterns' },
      { id: 'b', text: 'North Atlantic Westerlies and Gulf Stream' },
      { id: 'c', text: 'Trans-Saharan camel caravan oases' },
      { id: 'd', text: 'Hanseatic League Baltic convoys' },
    ],
    answer: 'a',
    explanation:
      'Indian Ocean monsoon winds reverse between summer and winter, making round-trip sailing to India reliable.',
    fun_fact:
      'Roman writers complained that Indian pepper and silk drained 50 million silver coins a year.',
    trap_notes: {
      b: 'Atlantic winds shaped Europe-to-Americas voyages after 1492.',
      c: 'Saharan camel caravans crossed the West African desert, not the ocean.',
      d: 'The Hanseatic League traded in northern Europe during the late Middle Ages.',
      default: 'Red Sea to India + winds reversing each season = Indian Ocean monsoon winds.',
    },
  },
  {
    id: 'world-ded-2',
    type: 'deduction',
    domain: 'World',
    subdomain: '20th-Century Decolonization',
    era: '1947–1962',
    skill_tag: 'conceptual',
    trap_type: 'era_bleed',
    geo: { lat: 28.6139, lng: 77.209, label: 'New Delhi, India' },
    clues: [
      'After WWII, Britain sped up its exit from its "crown jewel" colony amid mass protests.',
      'Rushed religious-majority borders displaced about 14 million people in August 1947.',
      'The split created two new nations—one Hindu-majority and one Muslim-majority.',
    ],
    prompt: 'Which 20th-century event do these clues describe?',
    options: [
      { id: 'a', text: 'The Partition of British India' },
      { id: 'b', text: 'The Algerian War of Independence' },
      { id: 'c', text: 'The Suez Crisis of 1956' },
      { id: 'd', text: 'The Mau Mau Uprising in Kenya' },
    ],
    answer: 'a',
    explanation:
      'In 1947, Britain ended rule in India by splitting it into India and Pakistan, displacing 14 million people.',
    fun_fact:
      'British lawyer Cyril Radcliffe drew the India–Pakistan border in just five weeks without ever visiting India.',
    trap_notes: {
      b: 'Algeria fought an independence war against France from 1954 to 1962.',
      c: 'The 1956 Suez Crisis began after Egypt took over the Suez Canal.',
      d: 'The Mau Mau Uprising was a 1950s revolt against British rule in Kenya.',
      default: '1947 + British "crown jewel" + 14 million displaced = Partition of India.',
    },
  },
  {
    id: 'world-map-1',
    type: 'map',
    domain: 'World',
    subdomain: 'Mediterranean & Near East Chokepoints',
    era: '1453',
    skill_tag: 'spatial_reasoning',
    trap_type: 'scale_confusion',
    geo: { lat: 41.0082, lng: 28.9784, label: 'Istanbul, Turkey' },
    mapSpec: {
      region: 'mediterranean',
      pins: [
        { id: 'a', x: 330, y: 128, label: 'Tigris–Euphrates' },
        { id: 'b', x: 254, y: 154, label: 'Nile Delta' },
        { id: 'c', x: 242, y: 58, label: 'Bosporus Strait' },
        { id: 'd', x: 26, y: 112, label: 'Strait of Gibraltar' },
      ],
    },
    prompt: 'Tap the waterway linking the Mediterranean and Black Seas that Constantinople guarded.',
    options: [],
    answer: 'c',
    explanation:
      'The Bosporus Strait links the Black Sea to the Mediterranean, making Constantinople a key crossroads.',
    fun_fact:
      'Two suspension bridges and a rail tunnel now cross the Bosporus, linking Europe and Asia.',
    trap_notes: {
      a: 'The Tigris and Euphrates rivers flow through Mesopotamia into the Persian Gulf.',
      b: 'The Nile Delta empties into the southeastern Mediterranean in Egypt.',
      d: 'The Strait of Gibraltar connects the Mediterranean Sea to the Atlantic Ocean.',
      default: 'Look at the narrow strait between the Black Sea and the Aegean/Mediterranean.',
    },
  },
  {
    id: 'world-comp-1',
    type: 'compare',
    domain: 'World',
    subdomain: 'Postclassical Trade Networks',
    era: '600–1450',
    skill_tag: 'conceptual',
    trap_type: 'scale_confusion',
    geo: { lat: 39.6542, lng: 66.9597, label: 'Samarkand, Uzbekistan' },
    compareSpec: {
      leftLabel: 'Silk Road',
      rightLabel: 'Indian Ocean',
      items: [
        { id: 'a', text: 'Camel caravans across Central Asia', bucket: 'left' },
        { id: 'b', text: 'Ships timed to monsoon winds', bucket: 'right' },
        { id: 'c', text: "Linked Chang'an to Mediterranean", bucket: 'left' },
        { id: 'd', text: 'Bulk spices via Swahili Coast ports', bucket: 'right' },
      ],
    },
    prompt: 'Sort each feature into Silk Road or Indian Ocean trade.',
    options: [],
    answer: 'all_matched',
    explanation:
      'The Silk Road moved luxury goods by camel caravan overland, while Indian Ocean ships carried bulk cargo by monsoon.',
    fun_fact:
      'A single ocean dhow could carry as much cargo as hundreds of Silk Road pack camels.',
    trap_notes: {
      default: 'Silk Road = overland camels across Asia. Indian Ocean = monsoon sailing ships.',
    },
  },
  {
    id: 'world-data-1',
    type: 'data',
    domain: 'World',
    subdomain: 'Industrialization & Global Shift',
    era: '1750–1900',
    skill_tag: 'data_literacy',
    trap_type: 'scale_confusion',
    geo: { lat: 51.5074, lng: -0.1278, label: 'London, United Kingdom' },
    stimulus: {
      kind: 'table',
      title: 'Share of World Manufacturing Output',
      headers: ['Region', '1750', '1900'],
      rows: [
        ['Europe', '23%', '62%'],
        ['China', '33%', '6%'],
        ['India', '25%', '2%'],
      ],
    },
    prompt: 'What global shift from 1750 to 1900 does the table show?',
    options: [
      { id: 'a', text: 'Industrialization shifted factory output from Asia to Europe' },
      { id: 'b', text: 'China and India doubled their world factory share' },
      { id: 'c', text: 'Europe produced more than half of world goods in 1750' },
      { id: 'd', text: 'Global trade ended between Europe and Asia by 1900' },
    ],
    answer: 'a',
    explanation:
      'Steam factories pushed Europe from 23% to 62% of world output while China and India fell sharply.',
    fun_fact:
      'In 1750, India and China together made more than half of all manufactured goods on Earth.',
    trap_notes: {
      b: 'China fell from 33% to 6% and India fell from 25% to 2%.',
      c: 'In 1750, Europe made 23%—less than a quarter of world output.',
      d: 'European empires expanded trade with Asia in the 1800s rather than ending it.',
      default: 'Compare 1750 and 1900: Europe surged from 23% to 62% as Asia’s shares fell.',
    },
  },
  {
    id: 'world-syn-1',
    type: 'synthesis',
    domain: 'World',
    secondary_domains: ['Geo', 'Econ'],
    subdomain: 'Industrialization & Global Trade',
    era: '1800–1900',
    skill_tag: 'synthesis',
    trap_type: 'scale_confusion',
    geo: { lat: 53.4808, lng: -2.2426, label: 'Manchester, United Kingdom' },
    secondary_geo: { lat: 30.0444, lng: 31.2357, label: 'Cairo, Egypt' },
    prompt:
      "Why did Manchester's 1800s textile boom reshape farming in Egypt and the U.S. South?",
    options: [
      {
        id: 'a',
        text: 'British mills needed raw cotton, turning distant farms into export growers',
      },
      {
        id: 'b',
        text: 'British tariffs banned raw cotton imports to protect English growers',
      },
      {
        id: 'c',
        text: 'Egypt and the U.S. South lacked rivers to ship out raw crops',
      },
      {
        id: 'd',
        text: 'The Congress of Vienna ordered Ottoman provinces to send free cotton',
      },
    ],
    answer: 'a',
    explanation:
      "Manchester's cloth mills needed huge amounts of raw cotton, pushing Egypt and the U.S. South to grow it for export.",
    fun_fact:
      "During the U.S. Civil War, Egypt's cotton exports quadrupled to feed British mills.",
    trap_notes: {
      b: 'Britain could not grow cotton in its cool climate and bought it from abroad.',
      c: 'Both the Nile and Mississippi rivers were busy cotton shipping highways.',
      d: 'The Congress of Vienna (1815) redrew European borders after Napoleon.',
      default: 'British textile mills needed raw cotton, turning Egypt and the U.S. South into suppliers.',
    },
  },

  // =========================================================================
  // CIVICS & GOVERNMENT (10)
  // =========================================================================
  {
    id: 'civics-mc-1',
    type: 'mc',
    domain: 'Civics',
    subdomain: 'Separation of Powers',
    era: '1788',
    skill_tag: 'primary_source',
    trap_type: 'jurisdiction_swap',
    geo: { lat: 38.8899, lng: -77.0091, label: 'U.S. Capitol, Washington, D.C.' },
    stimulus: {
      kind: 'excerpt',
      title: 'Federalist No. 51 (1788)',
      text: 'Ambition must be made to counteract ambition.',
      attribution: 'James Madison',
    },
    prompt: 'Which constitutional principle does this line defend?',
    options: [
      {
        id: 'a',
        text: 'Separation of powers with checks and balances across branches',
      },
      {
        id: 'b',
        text: 'Direct democracy where citizens vote on every federal law',
      },
      {
        id: 'c',
        text: 'Parliamentary rule where lawmakers pick and fire the president',
      },
      {
        id: 'd',
        text: 'A single national government that abolishes all state powers',
      },
    ],
    answer: 'a',
    explanation:
      'In Federalist No. 51, Madison explains that three separate branches can check and limit each other.',
    fun_fact:
      "Madison also wrote in Federalist No. 51: 'If men were angels, no government would be necessary.'",
    trap_notes: {
      b: 'Madison favored elected representatives, not direct national votes on every law.',
      c: 'In a parliamentary system, lawmakers pick the leader; the U.S. separates them.',
      d: 'Federalist No. 51 also defends dividing power between states and the nation.',
      default: '"Ambition must counteract ambition" means branches check each other.',
    },
  },
  {
    id: 'civics-mc-2',
    type: 'mc',
    domain: 'Civics',
    subdomain: 'Bill of Rights Incorporation',
    era: '1925–1963',
    skill_tag: 'conceptual',
    trap_type: 'jurisdiction_swap',
    geo: { lat: 38.8906, lng: -77.0044, label: 'U.S. Supreme Court' },
    prompt:
      'Which clause applied Bill of Rights protections—like counsel in Gideon (1963)—to states?',
    options: [
      {
        id: 'a',
        text: 'The 14th Amendment Due Process Clause',
      },
      {
        id: 'b',
        text: 'The Necessary and Proper Clause in Article I, Section 8',
      },
      {
        id: 'c',
        text: 'The 10th Amendment reserving powers to the states',
      },
      {
        id: 'd',
        text: 'The Article IV Privileges and Immunities Clause',
      },
    ],
    answer: 'a',
    explanation:
      "Courts used the 14th Amendment's Due Process Clause to make states follow most of the Bill of Rights.",
    fun_fact:
      'Clarence Earl Gideon wrote his Supreme Court appeal in pencil from prison and won 9–0.',
    trap_notes: {
      b: 'The Necessary and Proper Clause gives Congress implied powers, not state rights limits.',
      c: 'The 10th Amendment saves leftover powers for states; it does not apply federal rights to them.',
      d: 'Article IV stops states from mistreating out-of-state visitors.',
      default: 'The 14th Amendment Due Process Clause applied the Bill of Rights to states.',
    },
  },
  {
    id: 'civics-ord-1',
    type: 'ordering',
    domain: 'Civics',
    subdomain: 'Federalism & Voting Rights',
    era: '1819–1965',
    ordering_mode: 'chronological',
    skill_tag: 'chronology',
    trap_type: 'era_bleed',
    geo: { lat: 39.2904, lng: -76.6122, label: 'Baltimore, Maryland' },
    prompt: 'Order these constitutional milestones earliest to latest:',
    options: [
      { id: 'a', text: "19th Amendment guarantees women's suffrage" },
      { id: 'b', text: 'McCulloch v. Maryland upholds implied powers' },
      { id: 'c', text: 'Voting Rights Act enables federal oversight' },
      { id: 'd', text: '17th Amendment mandates direct Senate elections' },
    ],
    answer: ['b', 'd', 'a', 'c'],
    explanation:
      'McCulloch (1819) came first, then the 17th Amendment (1913), 19th Amendment (1920), and Voting Rights Act (1965).',
    fun_fact:
      "Tennessee ratified the 19th Amendment by one vote after Harry Burn read a note from his mother.",
    trap_notes: {
      default:
        'Timeline: McCulloch (1819), 17th Amendment (1913), 19th Amendment (1920), Voting Rights Act (1965).',
    },
  },
  {
    id: 'civics-cau-1',
    type: 'causal',
    domain: 'Civics',
    subdomain: 'Checks & Balances',
    era: 'Constitutional Process',
    ordering_mode: 'causal',
    skill_tag: 'causation',
    trap_type: 'jurisdiction_swap',
    geo: { lat: 38.8977, lng: -77.0365, label: 'White House, Washington, D.C.' },
    prompt: 'Order the steps to override a presidential veto:',
    options: [
      { id: 'a', text: 'President vetoes and returns bill to Congress' },
      { id: 'b', text: "Bill becomes law without President's signature" },
      { id: 'c', text: 'Both chambers override by a 2/3 supermajority' },
      { id: 'd', text: 'House and Senate pass bill by simple majority' },
    ],
    answer: ['d', 'a', 'c', 'b'],
    explanation:
      'Congress passes a bill first; if the President vetoes it, a 2/3 vote in both chambers makes it law.',
    fun_fact:
      'Franklin D. Roosevelt issued 635 vetoes over 12 years, and Congress overrode only 9 of them.',
    trap_notes: {
      default:
        'Process: Congress passes bill, President vetoes, 2/3 of both chambers override, bill becomes law.',
    },
  },
  {
    id: 'civics-ded-1',
    type: 'deduction',
    domain: 'Civics',
    subdomain: 'Parliamentary vs. Presidential Systems',
    era: 'Comparative Government',
    skill_tag: 'conceptual',
    trap_type: 'jurisdiction_swap',
    geo: { lat: 51.4995, lng: -0.1248, label: 'Palace of Westminster, London' },
    clues: [
      'Voters in this system elect the legislature directly, not the chief executive.',
      'The prime minister and cabinet come from and answer to the legislative majority.',
      'A "vote of no confidence" can remove the prime minister or trigger new elections.',
    ],
    prompt: 'Which system of government do these clues describe?',
    options: [
      { id: 'a', text: 'Parliamentary system' },
      { id: 'b', text: 'Presidential system' },
      { id: 'c', text: 'Confederal system' },
      { id: 'd', text: 'Absolute monarchy' },
    ],
    answer: 'a',
    explanation:
      'In a parliamentary system, voters pick lawmakers, who choose the prime minister and can vote them out.',
    fun_fact:
      "In Britain's Parliament, opposing leaders debate just two sword-lengths apart.",
    trap_notes: {
      b: 'In a presidential system, voters elect the president separately for a fixed term.',
      c: 'A confederation is a loose union of states with a weak central government.',
      d: 'An absolute monarch rules without an elected legislature that can vote them out.',
      default: 'Lawmakers pick the prime minister + no-confidence vote = Parliamentary system.',
    },
  },
  {
    id: 'civics-ded-2',
    type: 'deduction',
    domain: 'Civics',
    subdomain: 'Electoral College',
    era: '1804–Present',
    skill_tag: 'conceptual',
    trap_type: 'jurisdiction_swap',
    geo: { lat: 38.9072, lng: -77.0369, label: 'Washington, D.C.' },
    clues: [
      "Each state's tally equals its Senators plus Representatives, with 3 for D.C.",
      'In 48 states and D.C., winner-take-all rules award every vote to the state winner.',
      'If no candidate hits 270 of 538, the 12th Amendment sends the choice to the House.',
    ],
    prompt: 'Which U.S. electoral institution is described?',
    options: [
      { id: 'a', text: 'The Electoral College' },
      { id: 'b', text: 'Open Primary Elections' },
      { id: 'c', text: 'Ranked-Choice Voting' },
      { id: 'd', text: 'Congressional Reapportionment' },
    ],
    answer: 'a',
    explanation:
      'The Electoral College has 538 total votes, and a candidate needs at least 270 to win the presidency.',
    fun_fact:
      'The House has picked the president only twice: in 1801 and in 1825.',
    trap_notes: {
      b: 'Open primaries are party elections to pick nominees, not the 538-vote general election.',
      c: 'Ranked-choice voting is used in some states and cities, not the national 270-vote rule.',
      d: 'Reapportionment updates House seats every 10 years after the Census.',
      default: '538 votes + 270 to win + House tiebreaker = Electoral College.',
    },
  },
  {
    id: 'civics-map-1',
    type: 'map',
    domain: 'Civics',
    subdomain: 'International Institutions',
    era: '1945–Present',
    skill_tag: 'spatial_reasoning',
    trap_type: 'scale_confusion',
    geo: { lat: 40.7489, lng: -73.968, label: 'UN Headquarters, New York' },
    mapSpec: {
      region: 'world',
      pins: [
        { id: 'a', x: 104, y: 74, label: 'New York' },
        { id: 'b', x: 168, y: 58, label: 'The Hague' },
        { id: 'c', x: 220, y: 116, label: 'Addis Ababa' },
        { id: 'd', x: 326, y: 66, label: 'Tokyo' },
      ],
    },
    prompt: 'Tap the city where the United Nations General Assembly and Security Council meet.',
    options: [],
    answer: 'a',
    explanation:
      'The United Nations headquarters opened in New York City in 1952 to host global diplomacy.',
    fun_fact:
      'The UN headquarters site in Manhattan is considered international territory.',
    trap_notes: {
      b: 'The Hague in the Netherlands hosts the International Court of Justice, not the UN Assembly.',
      c: 'Addis Ababa in Ethiopia hosts the African Union headquarters.',
      d: 'Tokyo is Japan’s capital, not the UN headquarters.',
      default: 'The UN General Assembly and Security Council meet in New York City.',
    },
  },
  {
    id: 'civics-comp-1',
    type: 'compare',
    domain: 'Civics',
    subdomain: 'Bicameral Congress',
    era: '1789–Present',
    skill_tag: 'conceptual',
    trap_type: 'jurisdiction_swap',
    geo: { lat: 38.8899, lng: -77.0091, label: 'U.S. Capitol, Washington, D.C.' },
    compareSpec: {
      leftLabel: 'U.S. House',
      rightLabel: 'U.S. Senate',
      items: [
        { id: 'a', text: 'Two-year terms for all members', bucket: 'left' },
        { id: 'b', text: 'Approves treaties by 2/3 vote', bucket: 'right' },
        { id: 'c', text: 'Seats based on state population', bucket: 'left' },
        { id: 'd', text: 'Two members from every state', bucket: 'right' },
      ],
    },
    prompt: 'Sort each constitutional rule into the House or Senate.',
    options: [],
    answer: 'all_matched',
    explanation:
      'The House reflects state population with 2-year terms, while the Senate gives every state two 6-year seats.',
    fun_fact:
      'Only one-third of the Senate is up for election every two years, keeping it a continuous body.',
    trap_notes: {
      default: 'House = population-based, 2-year terms. Senate = 2 per state, approves treaties.',
    },
  },
  {
    id: 'civics-data-1',
    type: 'data',
    domain: 'Civics',
    subdomain: 'Electoral Apportionment',
    era: '2020–Present',
    skill_tag: 'data_literacy',
    trap_type: 'scale_confusion',
    geo: { lat: 41.14, lng: -104.8202, label: 'Cheyenne, Wyoming' },
    stimulus: {
      kind: 'table',
      title: 'State Population vs. Electoral Votes',
      headers: ['State', 'Population', 'Electors'],
      rows: [
        ['Wyoming', '0.6M', '3'],
        ['Iowa', '3.2M', '6'],
        ['California', '39.5M', '54'],
      ],
    },
    prompt: 'Why does Wyoming have more electors per person than California?',
    options: [
      { id: 'a', text: 'Every state gets 2 Senate electors no matter its population' },
      { id: 'b', text: 'Wyoming has more Representatives in the House than Iowa' },
      { id: 'c', text: 'California loses electors for having over 30 million people' },
      { id: 'd', text: 'Electors are split equally among all 50 states' },
    ],
    answer: 'a',
    explanation:
      'Every state gets 2 Senate electors plus at least 1 House seat, boosting small states like Wyoming.',
    fun_fact:
      'A Wyoming vote carries roughly three times the electoral weight per person of a California vote.',
    trap_notes: {
      b: 'Wyoming has 1 House seat, while Iowa has 4 House seats.',
      c: 'California still gets 52 House seats plus 2 Senate seats—it is not penalized.',
      d: 'Electors range from 3 to 54, so they are not split equally.',
      default: 'Every state starts with 2 Senate electors + at least 1 House seat = minimum 3.',
    },
  },
  {
    id: 'civics-syn-1',
    type: 'synthesis',
    domain: 'Civics',
    secondary_domains: ['US', 'Econ'],
    subdomain: 'Federalism & Interstate Commerce',
    era: '1824–Present',
    skill_tag: 'synthesis',
    trap_type: 'jurisdiction_swap',
    geo: { lat: 40.7128, lng: -74.006, label: 'New York Harbor' },
    secondary_geo: { lat: 40.7357, lng: -74.1724, label: 'Newark, New Jersey' },
    prompt:
      'How did Gibbons v. Ogden (1824) tie federalism to national economic growth?',
    options: [
      {
        id: 'a',
        text: 'It gave Congress broad Commerce Clause power, ending state ferry monopolies',
      },
      {
        id: 'b',
        text: 'It let New York tax New Jersey boats on shared waterways',
      },
      {
        id: 'c',
        text: 'It used the 10th Amendment to block federal interstate projects',
      },
      {
        id: 'd',
        text: 'It created the Federal Reserve to unify state bank notes',
      },
    ],
    answer: 'a',
    explanation:
      'Gibbons v. Ogden (1824) ruled that Congress—not states—controls trade across state lines.',
    fun_fact:
      'Young Cornelius Vanderbilt captained steamboats for Gibbons in this famous New York–New Jersey feud.',
    trap_notes: {
      b: 'The Court struck down New York’s monopoly so federal licenses prevailed.',
      c: 'The ruling expanded Congress’s power over interstate trade rather than blocking it.',
      d: 'The Federal Reserve was created in 1913, nearly 90 years later.',
      default: 'Gibbons v. Ogden (1824) put Congress in charge of interstate trade.',
    },
  },

  // =========================================================================
  // GEOGRAPHY (10)
  // =========================================================================
  {
    id: 'geo-mc-1',
    type: 'mc',
    domain: 'Geo',
    subdomain: 'Physical Systems (Rain Shadow)',
    era: 'Physical Geography',
    skill_tag: 'spatial_reasoning',
    trap_type: 'scale_confusion',
    geo: {
      lat: 47.4502,
      lng: -120.3103,
      label: 'Cascade Range / Yakima, Washington',
    },
    prompt:
      'Why is eastern Washington dry while the western Cascade slopes are lush rainforest?',
    options: [
      {
        id: 'a',
        text: 'Moist ocean air drops rain rising up the west side, leaving dry air on the east',
      },
      {
        id: 'b',
        text: 'Cold Arctic ocean currents freeze moisture along the eastern border',
      },
      {
        id: 'c',
        text: 'Dry subtropical high pressure sits permanently at 47°N latitude',
      },
      {
        id: 'd',
        text: 'Earth’s spin pushes all Pacific rain southward toward California',
      },
    ],
    answer: 'a',
    explanation:
      'Wet Pacific air cools and drops rain climbing the west slopes, leaving a dry rain shadow to the east.',
    fun_fact:
      'Sequim, WA sits in a rain shadow and gets less rain per year than Los Angeles.',
    trap_notes: {
      b: 'Eastern Washington is far inland, blocked from the ocean by the Cascades.',
      c: 'Subtropical dry belts sit near 30° latitude, not 47°N.',
      d: 'The Coriolis effect curves winds right in the north, not south to California.',
      default: 'Rain shadow: wet air drops rain on the windward slope, leaving the far side dry.',
    },
  },
  {
    id: 'geo-mc-2',
    type: 'mc',
    domain: 'Geo',
    subdomain: 'Ocean Currents & Climate',
    era: 'Physical Geography',
    skill_tag: 'spatial_reasoning',
    trap_type: 'scale_confusion',
    geo: { lat: 51.5074, lng: -0.1278, label: 'London, United Kingdom' },
    prompt: 'Why is London much milder in winter than Labrador, Canada at the same latitude?',
    options: [
      {
        id: 'a',
        text: 'The warm Gulf Stream / North Atlantic Drift heats air blowing to Europe',
      },
      {
        id: 'b',
        text: 'London sits closer to the equator than Labrador does',
      },
      {
        id: 'c',
        text: 'The Alps block all cold polar air from reaching Britain',
      },
      {
        id: 'd',
        text: 'Labrador sits at higher elevation than the British Isles',
      },
    ],
    answer: 'a',
    explanation:
      'Warm ocean water from the Gulf Stream flows northeast to Europe, keeping London’s winters mild.',
    fun_fact:
      'London (51°N) is farther north than Montreal (45°N), yet palm trees can grow in southwest England.',
    trap_notes: {
      b: 'London and northern Labrador sit at roughly the same 51°N–53°N latitude.',
      c: 'The Alps are far to the southeast in central Europe, not north of Britain.',
      d: 'Both coastal regions sit near sea level; ocean currents make the difference.',
      default: 'Warm Gulf Stream / North Atlantic Drift water keeps Western Europe mild.',
    },
  },
  {
    id: 'geo-ord-1',
    type: 'ordering',
    domain: 'Geo',
    subdomain: 'Strategic Chokepoints',
    era: 'Maritime Geography',
    ordering_mode: 'chronological',
    skill_tag: 'spatial_reasoning',
    trap_type: 'scale_confusion',
    geo: { lat: 30.5852, lng: 32.2654, label: 'Suez Canal, Egypt' },
    prompt: 'Order these waterways sailing east from the Mediterranean to East Asia:',
    options: [
      { id: 'a', text: 'Strait of Malacca (Indian Ocean to South China Sea)' },
      { id: 'b', text: 'Suez Canal (Mediterranean to Red Sea)' },
      { id: 'c', text: 'Taiwan Strait (South to East China Sea)' },
      { id: 'd', text: 'Bab el-Mandeb (Red Sea to Gulf of Aden)' },
    ],
    answer: ['b', 'd', 'a', 'c'],
    explanation:
      'Sailing east passes the Suez Canal (32°E), Bab el-Mandeb (43°E), Malacca (101°E), and the Taiwan Strait (119°E).',
    fun_fact:
      'Unlike the Panama Canal, the Suez Canal has zero locks—it is a straight sea-level cut.',
    trap_notes: {
      default: 'Route east: Suez Canal, Bab el-Mandeb, Strait of Malacca, Taiwan Strait.',
    },
  },
  {
    id: 'geo-cau-1',
    type: 'causal',
    domain: 'Geo',
    subdomain: 'Demographic Transition',
    era: 'Population Geography',
    ordering_mode: 'causal',
    skill_tag: 'causation',
    trap_type: 'reverse_causation',
    geo: { lat: 52.4862, lng: -1.8904, label: 'Birmingham, United Kingdom' },
    prompt: 'Order the Demographic Transition Model (Stage 1 to Stage 4):',
    options: [
      { id: 'a', text: 'Sanitation & vaccines slash infant mortality' },
      { id: 'b', text: 'Urbanization & education lower birth rates' },
      { id: 'c', text: 'High birth rates offset by high death rates' },
      { id: 'd', text: 'Birth & death rates stabilize at low levels' },
    ],
    answer: ['c', 'a', 'b', 'd'],
    explanation:
      'Stage 1 has high births and deaths; Stage 2 lowers deaths first; Stage 3 lowers births; Stage 4 levels off low.',
    fun_fact:
      "France's birth rate dropped early in the 1800s, skipping much of Stage 2's rapid boom.",
    trap_notes: {
      default: 'In the Demographic Transition Model, death rates fall first (Stage 2) before birth rates fall (Stage 3).',
    },
  },
  {
    id: 'geo-ded-1',
    type: 'deduction',
    domain: 'Geo',
    subdomain: 'Map Projections',
    era: 'Cartography',
    skill_tag: 'spatial_reasoning',
    trap_type: 'scale_confusion',
    geo: { lat: 64.1466, lng: -21.9426, label: 'Reykjavik, Iceland' },
    clues: [
      'Designed in 1569 for ocean sailors, this cylindrical map preserves true compass angles.',
      'Parallel meridians never meet at the poles, stretching land size at high latitudes.',
      'Greenland looks roughly as big as Africa, even though Africa is 14 times larger.',
    ],
    prompt: 'Which map projection do these clues identify?',
    options: [
      { id: 'a', text: 'Mercator projection' },
      { id: 'b', text: 'Robinson projection' },
      { id: 'c', text: 'Gall-Peters projection' },
      { id: 'd', text: 'Azimuthal equidistant projection' },
    ],
    answer: 'a',
    explanation:
      'The Mercator map keeps compass directions true for sailors, but stretches land near the poles.',
    fun_fact:
      'Africa is 14 times larger than Greenland, even though they look similar on a Mercator map.',
    trap_notes: {
      b: 'The Robinson map curves its side lines to reduce polar stretching.',
      c: 'The Gall-Peters map shows true land area, but stretches country shapes.',
      d: 'Azimuthal maps are round projections centered on a single point.',
      default: '1569 sailing map + true compass bearings + giant Greenland = Mercator.',
    },
  },
  {
    id: 'geo-ded-2',
    type: 'deduction',
    domain: 'Geo',
    subdomain: 'Site vs. Situation',
    era: 'Urban Geography',
    skill_tag: 'conceptual',
    trap_type: 'scale_confusion',
    geo: { lat: 1.3521, lng: 103.8198, label: 'Singapore' },
    clues: [
      "Geographers contrast a city's physical traits (site) with its trade location (situation).",
      'This island city-state lacks farmland and minerals, yet sits on the Strait of Malacca.',
      'Its deep harbor on the Europe–East Asia shipping lane turned it into a global trade hub.',
    ],
    prompt: 'What does this case best illustrate?',
    options: [
      { id: 'a', text: 'Favorable situation overcoming a resource-poor site' },
      { id: 'b', text: 'Rich farmland driving industrial self-sufficiency' },
      { id: 'c', text: 'Inland isolation protecting against sea trade' },
      { id: 'd', text: 'High-latitude ice limiting year-round ports' },
    ],
    answer: 'a',
    explanation:
      'Singapore has few local resources (site), but its spot on a busy sea lane (situation) made it rich.',
    fun_fact:
      'Singapore has so little freshwater on its island site that it pipes water from Malaysia.',
    trap_notes: {
      b: 'Singapore imports almost all its food and raw materials.',
      c: 'Singapore is an island on a busy ocean crossroads, not isolated inland.',
      d: 'Singapore sits near the equator (1.3°N), so its port is ice-free all year.',
      default: 'Site = physical land traits. Situation = location relative to trade routes.',
    },
  },
  {
    id: 'geo-map-1',
    type: 'map',
    domain: 'Geo',
    subdomain: 'Maritime Chokepoints',
    era: 'Global Trade',
    skill_tag: 'spatial_reasoning',
    trap_type: 'scale_confusion',
    geo: { lat: 2.5, lng: 101.2, label: 'Strait of Malacca' },
    mapSpec: {
      region: 'indian_ocean',
      pins: [
        { id: 'a', x: 30, y: 26, label: 'Suez Canal' },
        { id: 'b', x: 58, y: 96, label: 'Bab el-Mandeb' },
        { id: 'c', x: 118, y: 40, label: 'Strait of Hormuz' },
        { id: 'd', x: 286, y: 138, label: 'Strait of Malacca' },
      ],
    },
    prompt: 'Tap the narrow strait between the Malay Peninsula and Sumatra.',
    options: [],
    answer: 'd',
    explanation:
      'The Strait of Malacca links the Indian Ocean and South China Sea, carrying a third of global sea trade.',
    fun_fact:
      'Over 80,000 ships pass through the Strait of Malacca every year.',
    trap_notes: {
      a: 'The Suez Canal cuts through Egypt between the Mediterranean and Red Seas.',
      b: 'Bab el-Mandeb sits at the southern mouth of the Red Sea.',
      c: 'The Strait of Hormuz connects the Persian Gulf to the Arabian Sea.',
      default: 'Look to the far east of the Indian Ocean between Malaysia and Sumatra.',
    },
  },
  {
    id: 'geo-comp-1',
    type: 'compare',
    domain: 'Geo',
    subdomain: 'Human Migration',
    era: 'Cultural Geography',
    skill_tag: 'conceptual',
    trap_type: 'reverse_causation',
    geo: { lat: 40.7128, lng: -74.006, label: 'New York City, New York' },
    compareSpec: {
      leftLabel: 'Push Factor',
      rightLabel: 'Pull Factor',
      items: [
        { id: 'a', text: 'Crop failure and severe famine', bucket: 'left' },
        { id: 'b', text: 'Higher factory wages in cities', bucket: 'right' },
        { id: 'c', text: 'Civil war and persecution', bucket: 'left' },
        { id: 'd', text: 'Free farmland and family ties', bucket: 'right' },
      ],
    },
    prompt: 'Sort each migration driver into Push Factor or Pull Factor.',
    options: [],
    answer: 'all_matched',
    explanation:
      'Push factors drive people away from home (war, famine), while pull factors attract them to a new place.',
    fun_fact:
      'Chain migration happens when relatives already settled abroad act as a pull factor for family.',
    trap_notes: {
      default: 'Push = problems forcing people out. Pull = opportunities drawing people in.',
    },
  },
  {
    id: 'geo-data-1',
    type: 'data',
    domain: 'Geo',
    subdomain: 'Demographic Transition Model',
    era: 'Population Geography',
    skill_tag: 'data_literacy',
    trap_type: 'reverse_causation',
    geo: { lat: 23.8103, lng: 90.4125, label: 'Dhaka, Bangladesh' },
    stimulus: {
      kind: 'table',
      title: 'Vital Rates (per 1,000 people)',
      headers: ['Country', 'Birth Rate', 'Death Rate'],
      rows: [
        ['Country X', '41', '38'],
        ['Country Y', '34', '11'],
        ['Country Z', '10', '11'],
      ],
    },
    prompt: 'Which country is in DTM Stage 2 (rapid growth)?',
    options: [
      { id: 'a', text: 'Country Y, because death rates fell while birth rates stayed high' },
      { id: 'b', text: 'Country X, because high births and deaths yield fast growth' },
      { id: 'c', text: 'Country Z, because low death rates exceed low birth rates' },
      { id: 'd', text: 'Country X, because cities lowered fertility to 2 kids' },
    ],
    answer: 'a',
    explanation:
      'In Stage 2, clean water and medicine drop death rates (11) while birth rates stay high (34), causing fast growth.',
    fun_fact:
      'No country remains in DTM Stage 1 today—every nation has lowered death rates.',
    trap_notes: {
      b: 'Country X (41 births, 38 deaths) is Stage 1, where high deaths cancel out high births.',
      c: 'Country Z (10 births, 11 deaths) is shrinking slightly in Stage 4/5.',
      d: 'Country X still has 41 births per 1,000 people, which is very high.',
      default: 'Natural growth = Birth Rate minus Death Rate. Stage 2 has high births and low deaths.',
    },
  },
  {
    id: 'geo-syn-1',
    type: 'synthesis',
    domain: 'Geo',
    secondary_domains: ['World', 'US'],
    subdomain: 'Push/Pull Migration',
    era: '1845–1855',
    skill_tag: 'synthesis',
    trap_type: 'reverse_causation',
    geo: { lat: 53.3498, lng: -6.2603, label: 'Dublin, Ireland' },
    secondary_geo: { lat: 42.3601, lng: -71.0589, label: 'Boston, Massachusetts' },
    prompt:
      'How did push and pull factors drive 1 million Irish migrants to U.S. ports (1845–1855)?',
    options: [
      {
        id: 'a',
        text: 'Potato famine pushed families out, while U.S. rail and factory jobs pulled them in',
      },
      {
        id: 'b',
        text: 'Free Homestead Act farms in Boston drew workers from Dublin factories',
      },
      {
        id: 'c',
        text: 'U.S. Congress paid for free steamships for Irish farmers',
      },
      {
        id: 'd',
        text: 'Warming weather dried up Irish fisheries, sending migrants to Florida',
      },
    ],
    answer: 'a',
    explanation:
      'The Irish Potato Famine pushed families out of Ireland, while U.S. factory and rail jobs pulled them to cities.',
    fun_fact:
      "Ireland's population was 8.2 million in 1841 and still has not returned to that peak today.",
    trap_notes: {
      b: 'The Homestead Act passed later (1862) for western U.S. land, not Boston.',
      c: 'The U.S. government did not buy steamship tickets for Irish migrants.',
      d: 'A potato blight fungus ruined crops in cool, wet weather.',
      default: 'Push = 1845–52 Potato Famine. Pull = U.S. East Coast jobs.',
    },
  },

  // =========================================================================
  // ECONOMICS (10)
  // =========================================================================
  {
    id: 'econ-mc-1',
    type: 'mc',
    domain: 'Econ',
    subdomain: 'Price Controls',
    era: 'Microeconomics',
    skill_tag: 'conceptual',
    trap_type: 'policy_lever_swap',
    geo: { lat: 40.7128, lng: -74.006, label: 'New York City, New York' },
    prompt: 'What happens when a rent ceiling is set below the market price?',
    options: [
      {
        id: 'a',
        text: 'A housing shortage, because more people want units than landlords supply',
      },
      {
        id: 'b',
        text: 'A housing surplus, because builders construct extra units at lower rent',
      },
      {
        id: 'c',
        text: 'A rightward shift in supply until equilibrium matches the cap',
      },
      {
        id: 'd',
        text: 'Shorter waitlists as lower prices allocate apartments faster',
      },
    ],
    answer: 'a',
    explanation:
      'Capping rent below market price boosts demand while cutting supply, creating a housing shortage.',
    fun_fact:
      'Strict rent control in 1990s Stockholm led to official apartment waitlists over 15 years long.',
    trap_notes: {
      b: 'Surpluses happen when a price floor is set ABOVE the market price.',
      c: 'Lower rent caps give builders less incentive to construct new units.',
      d: 'Waitlists grow longer when more renters chase fewer apartments.',
      default: 'Price cap BELOW market price = Shortage (quantity demanded exceeds supplied).',
    },
  },
  {
    id: 'econ-mc-2',
    type: 'mc',
    domain: 'Econ',
    subdomain: 'Tax Structures',
    era: 'Public Finance',
    skill_tag: 'conceptual',
    trap_type: 'policy_lever_swap',
    geo: { lat: 41.8781, lng: -87.6298, label: 'Chicago, Illinois' },
    prompt: 'Why do economists classify a flat 7% sales tax on groceries as regressive?',
    options: [
      {
        id: 'a',
        text: 'It takes a larger share of a low-income family’s total income',
      },
      {
        id: 'b',
        text: 'It charges wealthy shoppers a higher tax percentage at checkout',
      },
      {
        id: 'c',
        text: 'It only applies to luxury imports rather than everyday food',
      },
      {
        id: 'd',
        text: 'Its rate automatically rises each year with inflation',
      },
    ],
    answer: 'a',
    explanation:
      'Low-income families spend a bigger share of their pay on food, so a flat sales tax hits their income harder.',
    fun_fact:
      'Over 30 U.S. states exempt groceries from sales tax to reduce this regressive burden.',
    trap_notes: {
      b: 'A tax that takes a higher percentage from higher earners is progressive, not regressive.',
      c: 'A sales tax on groceries applies to basic food, not just luxury goods.',
      d: 'Inflation indexing does not make a tax regressive.',
      default: 'Regressive tax = takes a bigger percentage of income from lower earners.',
    },
  },
  {
    id: 'econ-ord-1',
    type: 'ordering',
    domain: 'Econ',
    subdomain: 'Economic Institutions & Trade',
    era: '1913–1995',
    ordering_mode: 'chronological',
    skill_tag: 'chronology',
    trap_type: 'era_bleed',
    geo: { lat: 46.2044, lng: 6.1432, label: 'Geneva, Switzerland' },
    prompt: 'Order these economic milestones earliest to latest:',
    options: [
      { id: 'a', text: 'Smoot-Hawley Tariff raises U.S. import duties' },
      { id: 'b', text: 'WTO replaces GATT to settle trade disputes' },
      { id: 'c', text: 'Federal Reserve Act creates U.S. central bank' },
      { id: 'd', text: 'Bretton Woods founds the IMF and World Bank' },
    ],
    answer: ['c', 'a', 'd', 'b'],
    explanation:
      'The Federal Reserve (1913) came first, then Smoot-Hawley (1930), Bretton Woods (1944), and the WTO (1995).',
    fun_fact:
      'At Bretton Woods in 1944, Britain proposed a global currency called the "bancor," but the U.S. dollar won.',
    trap_notes: {
      default: 'Timeline: Federal Reserve (1913), Smoot-Hawley (1930), Bretton Woods (1944), WTO (1995).',
    },
  },
  {
    id: 'econ-cau-1',
    type: 'causal',
    domain: 'Econ',
    subdomain: 'Monetary Policy',
    era: 'Macroeconomics',
    ordering_mode: 'causal',
    skill_tag: 'causation',
    trap_type: 'reverse_causation',
    geo: {
      lat: 38.8927,
      lng: -77.0458,
      label: 'Federal Reserve Board, Washington, D.C.',
    },
    prompt: 'Order how Federal Reserve bond sales cool high inflation:',
    options: [
      { id: 'a', text: 'Higher rates curb borrowing & total spending' },
      { id: 'b', text: 'Fed sells U.S. Treasuries to commercial banks' },
      { id: 'c', text: 'Bank reserves fall, raising interest rates' },
      { id: 'd', text: 'Price-level growth slows as demand cools' },
    ],
    answer: ['b', 'c', 'a', 'd'],
    explanation:
      'Selling bonds drains bank cash, lifting interest rates so borrowing slows and inflation cools.',
    fun_fact:
      'The Fed does not ship paper bills when trading bonds—it adjusts digital bank reserve balances.',
    trap_notes: {
      default: 'Sequence: Fed sells bonds, bank reserves drop, interest rates rise, spending and inflation cool.',
    },
  },
  {
    id: 'econ-ded-1',
    type: 'deduction',
    domain: 'Econ',
    subdomain: 'Market Structures',
    era: 'Microeconomics',
    skill_tag: 'conceptual',
    trap_type: 'policy_lever_swap',
    geo: { lat: 42.3314, lng: -83.0458, label: 'Detroit, Michigan' },
    clues: [
      'In this market structure, a handful of large companies control most sales.',
      'High startup costs or patents block new competitors from entering easily.',
      'Each firm watches rival prices closely before changing its own.',
    ],
    prompt: 'Which market structure do these clues describe?',
    options: [
      { id: 'a', text: 'Oligopoly' },
      { id: 'b', text: 'Perfect competition' },
      { id: 'c', text: 'Monopolistic competition' },
      { id: 'd', text: 'Natural monopoly' },
    ],
    answer: 'a',
    explanation:
      'An oligopoly is a market dominated by a few big firms with high entry barriers and interdependent pricing.',
    fun_fact:
      'In 1966, GM, Ford, and Chrysler made over 80% of U.S. cars before foreign imports grew.',
    trap_notes: {
      b: 'Perfect competition has many small sellers offering identical goods with easy entry.',
      c: 'Monopolistic competition has many firms selling slightly different products.',
      d: 'A natural monopoly has only one firm supplying the whole market.',
      default: 'A few big firms + hard to enter + watching rivals = Oligopoly.',
    },
  },
  {
    id: 'econ-ded-2',
    type: 'deduction',
    domain: 'Econ',
    subdomain: 'Macroeconomic Shocks',
    era: 'Macroeconomics',
    skill_tag: 'conceptual',
    trap_type: 'policy_lever_swap',
    geo: { lat: 41.8781, lng: -87.6298, label: 'Chicago, Illinois' },
    clues: [
      'During this rare downturn, real GDP shrinks while unemployment climbs sharply.',
      'Unlike a normal recession, consumer prices jump rapidly at the same time.',
      'Economists link this 1970s oil-shock mix to a sudden drop in aggregate supply.',
    ],
    prompt: 'Which macroeconomic condition do these clues describe?',
    options: [
      { id: 'a', text: 'Stagflation' },
      { id: 'b', text: 'Deflationary spiral' },
      { id: 'c', text: 'Demand-pull expansion' },
      { id: 'd', text: 'Full-employment equilibrium' },
    ],
    answer: 'a',
    explanation:
      'Stagflation combines a shrinking economy, rising unemployment, and high inflation all at once.',
    fun_fact:
      'UK politician Iain Macleod coined "stagflation" in 1965, combining stagnation and inflation.',
    trap_notes: {
      b: 'Deflation means falling prices, whereas this condition has rising prices.',
      c: 'An expansion has growing GDP and falling unemployment.',
      d: 'Full employment means low joblessness and steady growth.',
      default: 'Shrinking GDP + high joblessness + high inflation = Stagflation.',
    },
  },
  {
    id: 'econ-map-1',
    type: 'map',
    domain: 'Econ',
    subdomain: 'Global Manufacturing & Trade Zones',
    era: '1980–Present',
    skill_tag: 'spatial_reasoning',
    trap_type: 'scale_confusion',
    geo: { lat: 22.3193, lng: 114.1694, label: 'Pearl River Delta / Hong Kong' },
    mapSpec: {
      region: 'east_asia',
      pins: [
        { id: 'a', x: 184, y: 132, label: 'Shanghai' },
        { id: 'b', x: 148, y: 190, label: 'Pearl River Delta' },
        { id: 'c', x: 220, y: 88, label: 'Seoul' },
        { id: 'd', x: 298, y: 88, label: 'Tokyo Bay' },
      ],
    },
    prompt: 'Tap the southern Chinese delta where Shenzhen and Hong Kong anchor export manufacturing.',
    options: [],
    answer: 'b',
    explanation:
      'The Pearl River Delta became China’s first Special Economic Zone hub, linking Shenzhen factories to Hong Kong.',
    fun_fact:
      'Shenzhen grew from a fishing town of 30,000 in 1980 to a tech metropolis of over 17 million.',
    trap_notes: {
      a: 'Shanghai sits farther north at the mouth of the Yangtze River.',
      c: 'Seoul and Incheon are in South Korea across the Yellow Sea.',
      d: 'Tokyo Bay sits on Japan’s Pacific coast.',
      default: 'Look to the southern Chinese coast near Hong Kong.',
    },
  },
  {
    id: 'econ-comp-1',
    type: 'compare',
    domain: 'Econ',
    subdomain: 'Macroeconomic Policy',
    era: 'Macroeconomics',
    skill_tag: 'conceptual',
    trap_type: 'policy_lever_swap',
    geo: { lat: 38.8927, lng: -77.0458, label: 'Washington, D.C.' },
    compareSpec: {
      leftLabel: 'Fiscal Policy',
      rightLabel: 'Monetary Policy',
      items: [
        { id: 'a', text: 'Congress cuts federal income taxes', bucket: 'left' },
        { id: 'b', text: 'Fed raises benchmark interest rates', bucket: 'right' },
        { id: 'c', text: 'Federal spending on new highways', bucket: 'left' },
        { id: 'd', text: 'Fed sells bonds to shrink reserves', bucket: 'right' },
      ],
    },
    prompt: 'Sort each action into Fiscal Policy or Monetary Policy.',
    options: [],
    answer: 'all_matched',
    explanation:
      'Congress and the President run fiscal policy (taxes and spending); the Fed runs monetary policy (rates and money).',
    fun_fact:
      'The Federal Reserve is independent of Congress’s annual budget so politics won’t drive interest rates.',
    trap_notes: {
      default: 'Fiscal = Congress taxes & spending. Monetary = Federal Reserve interest rates & bonds.',
    },
  },
  {
    id: 'econ-data-1',
    type: 'data',
    domain: 'Econ',
    subdomain: 'Comparative Advantage',
    era: 'International Trade',
    skill_tag: 'data_literacy',
    trap_type: 'policy_lever_swap',
    geo: { lat: 37.5665, lng: 126.978, label: 'Seoul, South Korea' },
    stimulus: {
      kind: 'table',
      title: 'Daily Output per Worker',
      headers: ['Country', 'Microchips', 'Wheat (tons)'],
      rows: [
        ['Alpha', '20', '10'],
        ['Beta', '12', '12'],
        ['Gamma', '8', '16'],
      ],
    },
    prompt: 'Based on opportunity cost, who should specialize in microchips?',
    options: [
      { id: 'a', text: 'Alpha, because 1 chip costs only 0.5 tons of wheat' },
      { id: 'b', text: 'Beta, because 1 chip costs 1 ton of wheat' },
      { id: 'c', text: 'Gamma, because 1 chip costs 2 tons of wheat' },
      { id: 'd', text: 'Alpha should make both goods and never trade' },
    ],
    answer: 'a',
    explanation:
      'Alpha gives up only 0.5 tons of wheat per microchip, the lowest opportunity cost in the table.',
    fun_fact:
      'David Ricardo proved in 1817 that trade helps both nations even if one makes more of everything.',
    trap_notes: {
      b: 'Beta gives up 1 ton of wheat per chip, which is double Alpha’s cost.',
      c: 'Gamma gives up 2 tons of wheat per chip, making it the best wheat specialist instead.',
      d: 'Even with higher total output, Alpha gains by trading chips for Gamma’s cheaper wheat.',
      default: 'Compare what each country gives up: Alpha sacrifices only 0.5 tons of wheat per chip.',
    },
  },
  {
    id: 'econ-syn-1',
    type: 'synthesis',
    domain: 'Econ',
    secondary_domains: ['US', 'World'],
    subdomain: 'Tariffs & Great Depression',
    era: '1929–1933',
    skill_tag: 'synthesis',
    trap_type: 'policy_lever_swap',
    geo: { lat: 40.7069, lng: -74.0113, label: 'Wall Street, New York' },
    secondary_geo: { lat: 51.5074, lng: -0.1278, label: 'London, United Kingdom' },
    prompt:
      'How did the 1930 Smoot-Hawley Tariff worsen the Great Depression globally?',
    options: [
      {
        id: 'a',
        text: 'High U.S. import taxes triggered foreign retaliation that collapsed world trade',
      },
      {
        id: 'b',
        text: 'It ended all U.S. tariffs, flooding American stores with cheap imports',
      },
      {
        id: 'c',
        text: 'It dropped the gold standard and caused hyperinflation in New York',
      },
      {
        id: 'd',
        text: 'It forgave all Allied WWI debts in exchange for Soviet grain',
      },
    ],
    answer: 'a',
    explanation:
      'Smoot-Hawley raised U.S. import taxes, prompting other nations to retaliate and shrinking global trade.',
    fun_fact:
      'Over 1,000 economists signed a petition urging President Hoover to veto Smoot-Hawley.',
    trap_notes: {
      b: 'Smoot-Hawley raised import taxes on over 20,000 goods rather than ending them.',
      c: 'The U.S. kept the gold standard until 1933, and prices actually fell during the 1930s.',
      d: 'High tariffs made it harder for Europe to earn dollars to repay WWI debts.',
      default: 'Smoot-Hawley = high U.S. tariffs -> foreign retaliation -> world trade collapses.',
    },
  },
];

const bankModules = import.meta.glob('./bank/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, Question[]>;

const BANK_QUESTIONS: Question[] = Object.keys(bankModules)
  .sort()
  .flatMap((path) => bankModules[path]);

/** Full Praxis 5581 question bank (50 base + 3,000 generated bank items). */
export const QUESTIONS: Question[] = [...BASE_QUESTIONS, ...BANK_QUESTIONS];

/** Returns all questions whose primary domain matches `domain`. */
export function getQuestionsByDomain(domain: Domain): Question[] {
  return QUESTIONS.filter((q) => q.domain === domain);
}
