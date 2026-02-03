import React from 'react';
import { InvestorStrategy, ComplexInvestorStrategy, HyperComplexInvestorStrategy, Region, Investor, RandomInvestorStrategy, TaxJurisdiction } from './types.ts';
import { NeuralNetwork } from './services/neuralNetwork.ts';

export interface StockConfig {
    symbol: string;
    name: string;
    sector: string;
    region: Region;
    basePrice: number;
    isETF?: boolean;
}

export const TOTAL_SIMULATED_STOCKS = 50000;
export const TOTAL_AI_INVESTORS = 200;

export const NEWS_EVENT_CATEGORIES = [
    'PositiveNA', 'NegativeNA',
    'PositiveEU', 'NegativeEU',
    'PositiveAsia', 'NegativeAsia',
    'PositiveGlobal', 'NegativeGlobal',
    'PoliticalGlobal', 'DisasterGlobal',
    'TechRegulation', 'SpaceMilestone', 'CyberSecurity',
    'ClimateEvent', 'SocialUnrest', 'DiplomaticBreakthrough'
] as const;

export type NewsEventCategory = typeof NEWS_EVENT_CATEGORIES[number];

interface CorporateEventConfig {
  name: string;
  description: string;
  impact?: number | Record<string, number>;
  type: 'positive' | 'negative' | 'neutral' | 'political' | 'disaster';
  region?: Region | 'Global';
  category?: NewsEventCategory;
}

type InvestorConfig = {
  id: string;
  name: string;
  isHuman?: boolean;
  region: Region;
  strategyName?: string;
  strategy: InvestorStrategy | ComplexInvestorStrategy | HyperComplexInvestorStrategy | RandomInvestorStrategy;
  initialCash: number;
  jurisdiction: TaxJurisdiction;
};

const RANDOM_NAME_PREFIXES = ['Apex', 'Stellar', 'Quantum', 'Orion', 'Cyber', 'Bio', 'Geo', 'Fusion', 'Nova', 'Vertex', 'Axiom', 'Pinnacle', 'Zenith', 'Elysian', 'Momentum', 'Helios', 'Vanguard', 'Titan', 'Seraph', 'Echo', 'Nebula', 'Prism', 'Flux', 'Solar', 'Lunar', 'Onyx', 'Iron', 'Veloc', 'Aether', 'Omni'];
const RANDOM_NAME_SUFFIXES = ['Dynamics', 'Solutions', 'Labs', 'Systems', 'Corp', 'Industries', 'Tech', 'Ventures', 'Holdings', 'Group', 'Analytics', 'Innovations', 'Enterprises', 'Robotics', 'Pharmaceuticals', 'Energy', 'Financial', 'Logistics', 'Networks', 'Foundry', 'Capital', 'Synergy'];

export const generateSymbolFromName = (name: string, index: number): string => {
    const cleanName = name.replace(/[^A-Z]/g, '');
    const prefix = cleanName.substring(0, 3) || 'STK';
    const suffix = (index % 10000).toString().padStart(4, '0');
    return `${prefix}${suffix}`;
};

export const generateRandomStock = (usedSymbols: Set<string>): { randomName: string, randomSymbol: string } => {
    let randomName = '';
    let randomSymbol = '';
    let attempts = 0;
    const index = usedSymbols.size;
    do {
        const prefix = RANDOM_NAME_PREFIXES[Math.floor(Math.random() * RANDOM_NAME_PREFIXES.length)];
        const suffix = RANDOM_NAME_SUFFIXES[Math.floor(Math.random() * RANDOM_NAME_SUFFIXES.length)];
        randomName = `${prefix} ${suffix} ${index}`;
        randomSymbol = generateSymbolFromName(prefix + suffix, index);
        attempts++;
    } while (usedSymbols.has(randomSymbol) && attempts < 100);
    return { randomName, randomSymbol };
};

export const STOCK_CONFIG: StockConfig[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', region: 'North America', basePrice: 214 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', region: 'North America', basePrice: 442 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', region: 'North America', basePrice: 179 },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', sector: 'Technology', region: 'North America', basePrice: 185 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', region: 'North America', basePrice: 131 },
  { symbol: 'META', name: 'Meta Platforms, Inc.', sector: 'Technology', region: 'North America', basePrice: 501 },
  { symbol: 'TSM', name: 'Taiwan Semiconductor', sector: 'Technology', region: 'Asia', basePrice: 173 },
  { symbol: 'AZN', name: 'AstraZeneca PLC', sector: 'Health', region: 'Europe', basePrice: 79 },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Health', region: 'North America', basePrice: 28 },
  { symbol: 'XOM', name: 'Exxon Mobil Corp.', sector: 'Energy', region: 'North America', basePrice: 114 },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Finance', region: 'North America', basePrice: 196 },
  { symbol: 'TM', name: 'Toyota Motor Corp.', sector: 'Industrials', region: 'Asia', basePrice: 205 },
  { symbol: 'XTC', name: 'Global Tech ETF', sector: 'Technology', isETF: true, basePrice: 100, region: 'Global' },
];

export const ICONS = {
    play: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>,
    pause: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h1a1 1 0 001-1V8a1 1 0 00-1-1H8zm3 0a1 1 0 00-1 1v4a1 1 0 001 1h1a1 1 0 001-1V8a1 1 0 00-1-1h-1z" clipRule="evenodd" /></svg>,
    reset: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm12 14a1 1 0 01-1-1v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 111.885-.666A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v3a1 1 0 01-1 1z" clipRule="evenodd" /></svg>,
    resetReal: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11h3v7H2v-7zm4 0h3v7H6v-7zm4-4h3v11h-3V7zm4 4h3v7h-3v-7z" /></svg>
};
  
export const SIMULATION_SPEEDS = [
    { label: '1m/s', steps: 60 },
    { label: '15m/s', steps: 900 },
    { label: '30m/s', steps: 1800 },
    { label: '1h/s', steps: 3600 },
    { label: '3h/s', steps: 10800 },
    { label: '12h/s', steps: 43200 },
    { label: '1d/s', steps: 86400 },
    { label: '3d/s', steps: 259200 },
    { label: '1w/s', steps: 604800 },
];

export const MIN_INITIAL_STOCK_PRICE = 8;
export const MAX_INITIAL_STOCK_PRICE = 12;
export const INITIAL_HISTORY_LENGTH = 252;
export const REAL_DATA_HISTORY_LENGTH = 5040;
export const HUMAN_INITIAL_INVESTOR_CASH = 1_000_000;
export const AI_INITIAL_INVESTOR_CASH = 100;
export const INFLATION_RATE = 0.02 / 365;

export const TAX_CONSTANTS = {
  LONG_TERM_HOLDING_PERIOD: 365,
};

export const TAX_REGIMES: Record<TaxJurisdiction, { ltcgRate: number, stcgRate: number, ltcgExemption?: number, stcgExemption?: number, description: string }> = {
    USA_WA: { ltcgRate: 0.07, stcgRate: 0, ltcgExemption: 250000, description: 'USA (Federal) + Washington (State). 7% LTCG tax on gains over $250k.' },
    USA_CA: { ltcgRate: 0.093, stcgRate: 0.093, description: 'USA (Federal) + California (State). 9.3% income tax on all capital gains.' },
    USA_TX: { ltcgRate: 0, stcgRate: 0, description: 'USA (Federal) + Texas (State). No state income tax on capital gains.' },
    DE: { ltcgRate: 0.264, stcgRate: 0.264, ltcgExemption: 1000, description: 'Germany. Flat 26.4% tax on all capital gains.' },
    JP: { ltcgRate: 0.203, stcgRate: 0.203, description: 'Japan. Flat 20.3% tax on all capital gains.' },
    GLOBAL: { ltcgRate: 0.15, stcgRate: 0.25, description: 'Global Average. Simplified progressive-like tax model.' }
};

export const CORPORATE_TAX_RATES_BY_REGION: Record<Region, number> = {
  'North America': 0.00471,
  'Europe': 0.0055,
  'Asia': 0.0052,
  'Global': 0.0050,
};

export const MIN_CORPORATE_ACTION_INTERVAL = 20;
export const CORPORATE_ACTION_INTERVAL_RANGE = 30;
export const MIN_STOCK_SPLIT_PRICE = 250;
export const MAX_STOCK_SPLIT_PRICE = 1000;

export const CORPORATE_EVENTS_BY_SECTOR: Record<string, Record<'positive' | 'negative' | 'neutral', CorporateEventConfig[]>> = {
  Technology: {
    positive: [
      { name: "Quantum Supremacy Milestone", description: "Engineers achieve stable quantum coherence for 10 minutes, breaking world records.", impact: 1.12, type: 'positive' },
      { name: "Successful Ethical AI Audit", description: "Independent regulators clear the new LLM of bias, paving the way for public sector contracts.", impact: 1.05, type: 'positive' },
      { name: "Patent Win for Holographic Displays", description: "A multi-year lawsuit ends with a massive settlement and exclusive tech rights.", impact: 1.08, type: 'positive' },
    ],
    negative: [
      { name: "Critical Zero-Day Exploit", description: "Hackers discover a vulnerability in the core firmware of millions of devices.", impact: 0.88, type: 'negative' },
      { name: "Rare Earth Metal Shortage", description: "Geopolitical bans on export-grade gallium halt semiconductor production lines.", impact: 0.92, type: 'negative' },
    ],
    neutral: [
      { name: "Routine Security Patch", description: "Scheduled updates across the ecosystem deployed successfully.", type: 'neutral' },
    ],
  },
  Health: {
    positive: [
      { name: "Nanobot Trial Success", description: "In-vivo trials for cancer-targeting nanobots show 99% efficacy.", impact: 1.18, type: 'positive' },
      { name: "Universal Vaccine Approval", description: "The WHO approves a breakthrough universal flu vaccine.", impact: 1.09, type: 'positive' }
    ],
    negative: [
      { name: "Generic Competition Surge", description: "Patent protection expires for a top-selling blockbuster drug.", impact: 0.85, type: 'negative' },
      { name: "Clinical Data Retraction", description: "A major study supporting a core product is retracted due to data anomalies.", impact: 0.82, type: 'negative' }
    ],
    neutral: [
      { name: "Biotech Symposium", description: "Scientists gather to discuss the future of CRISPR technology.", type: 'neutral' }
    ]
  },
  Energy: {
      positive: [
        { name: "Nuclear Fusion Breakthrough", description: "Stable plasma ignition achieved for longer than 30 seconds.", impact: 1.20, type: 'positive' },
        { name: "Vast Graphene Reserves Found", description: "A new mining method unlocks massive quantities of high-grade graphene.", impact: 1.10, type: 'positive' }
      ],
      negative: [
        { name: "Grid Destabilization Event", description: "Solar flares cause localized blackouts and infrastructure damage.", impact: 0.90, type: 'negative' },
        { name: "Deep Sea Leak", description: "A prototype geothermal well suffers a structural failure.", impact: 0.85, type: 'negative' }
      ],
      neutral: [
        { name: "Annual Safety Review", description: "Routine inspection of offshore wind farms completed.", type: 'neutral' }
      ]
  },
  Finance: {
      positive: [
        { name: "CBDC Integration Success", description: "Central Bank Digital Currency pilot sees massive institutional adoption.", impact: 1.07, type: 'positive' },
        { name: "Asset Recovery", description: "A major previously-frozen sovereign fund is unfrozen and reinvested.", impact: 1.05, type: 'positive' }
      ],
      negative: [
        { name: "AI Trading Glitch", description: "A high-frequency algorithm goes rogue, causing a flash crash.", impact: 0.91, type: 'negative' },
        { name: "Global Anti-Money Laundering Probe", description: "Regulators launch a sweeping investigation into cross-border transfers.", impact: 0.89, type: 'negative' }
      ],
      neutral: [
        { name: "New Headquarters Unveiled", description: "Modern skyscrapers opened in a newly designated financial district.", type: 'neutral' }
      ]
  },
  Industrials: {
      positive: [
        { name: "Lunar Infrastructure Contract", description: "Winning a massive bid to build the first permanent lunar hab modules.", impact: 1.15, type: 'positive' },
        { name: "Vertical Farming Revolution", description: "New robotic harvest systems increase yield by 400%.", impact: 1.09, type: 'positive' }
      ],
      negative: [
        { name: "Global Freight Congestion", description: "A massive blockage in a key shipping strait halts trade.", impact: 0.93, type: 'negative' },
        { name: "Automated Factory Strike", description: "Technicians strike over remote-work policies and AI monitoring.", impact: 0.94, type: 'negative' }
      ],
      neutral: [
        { name: "Warehouse Automation Upgrade", description: "Rollout of new autonomous sorting robots begins.", type: 'neutral' }
      ]
  }
};

export const MACRO_EVENTS: CorporateEventConfig[] = [
    { name: "Mars Colonization Pact", description: "Superpowers agree to joint funding for a permanent Martian base, stimulating the space industrial sector.", impact: 1.06, type: 'positive', region: 'Global', category: 'PositiveGlobal' },
    { name: "Eurozone Digital Currency Tensions", description: "Brussels faces internal pushback on the new Digital Euro security protocols, sparking regional uncertainty.", impact: 0.97, type: 'political', region: 'Europe', category: 'PoliticalGlobal' },
    { name: "Silicon Silk Road Initiative", description: "A new ultra-high-speed data corridor between Tokyo and London is announced, bypassing traditional digital hubs.", impact: 1.06, type: 'positive', region: 'Asia', category: 'PositiveAsia' },
    { name: "Martian Independence Movement", description: "A faction of colonists on Mars declares 'Data Sovereignty', disrupting interplanetary communications stocks.", impact: 0.92, type: 'political', region: 'Global', category: 'PoliticalGlobal' },
    { name: "Global UBI Referendum", description: "Several major nations pass referendums for Universal Basic Income, expected to radically shift consumer spending patterns.", impact: 1.04, type: 'political', region: 'Global', category: 'PoliticalGlobal' },
    { name: "Category 6 Hyper-Cane Alert", description: "An unprecedented Category 6 hurricane is projected to hit the Gulf, threatening major fusion grid nodes.", impact: 0.88, type: 'disaster', region: 'North America', category: 'DisasterGlobal' },
    { name: "Unprecedented Heat Dome", description: "Europe's electrical grid strained as record temperatures drive energy demand to 150% of capacity.", impact: 0.91, type: 'disaster', region: 'Europe', category: 'DisasterGlobal' },
    { name: "Neural Privacy Act Passed", description: "Strict new laws limit the use of brain-computer interface data for advertising; Technology stocks face headwind.", impact: 0.94, type: 'political', region: 'North America', category: 'TechRegulation' },
    { name: "Quantum-Proof Encryption Mandate", description: "Governments require all financial data to be quantum-encrypted by year-end, driving a massive security spend.", impact: 0.97, type: 'political', region: 'North America', category: 'CyberSecurity' },
    { name: "Deepfake Identification Breakthrough", description: "New algorithms reliably identify synthetic media, restoring trust in digital communications.", impact: 1.02, type: 'positive', region: 'Global', category: 'TechRegulation' },
    { name: "Android Rights Protests", description: "Social movements demanding 'Machine Ethics' for advanced laborers disrupt logistics and manufacturing hubs.", impact: 0.95, type: 'political', region: 'Global', category: 'SocialUnrest' },
    { name: "Age-Reversal Breakthrough", description: "Rumors of a successful telomere restoration therapy boost long-term demographic projections and healthcare optimism.", impact: 1.04, type: 'positive', region: 'Global', category: 'PositiveGlobal' },
    { name: "Digital Sovereignty Tax", description: "Nations impose a 15% flat tax on cross-border data processing, hitting the bottom lines of cloud giants.", impact: 0.94, type: 'negative', region: 'Global', category: 'NegativeGlobal' },
];

export const INDICATOR_NEURONS = [
    'momentum_5d', 'momentum_20d', 'trend_price_vs_sma_50', 'oscillator_rsi_14_contrarian',
    'global_political_index', 'regional_stability_index', 'climate_disruption_signal', 'social_volatility'
];
export const CORPORATE_NEURONS = ['self_momentum_50d', 'market_momentum_50d', 'opportunity_score'];

export const buildInvestors = (options: { realisticDemographics?: boolean } = {}): InvestorConfig[] => {
    const totalInvestors = TOTAL_AI_INVESTORS;
    const JURISDICTIONS: TaxJurisdiction[] = ['USA_WA', 'USA_CA', 'USA_TX', 'DE', 'JP', 'GLOBAL'];
    const REGIONS: Region[] = ['North America', 'Europe', 'Asia'];
    const aiInvestors: InvestorConfig[] = [];

    for (let i = 0; i < totalInvestors; i++) {
        const rand = Math.random();
        let hiddenLayers: number[];
        let strategyName: string;
        
        // Dynamic Cognitive Distribution
        if (rand < 0.60) {
            hiddenLayers = [12, 8]; // 2 Layers (Standard)
            strategyName = "NeuralNet v2.0";
        } else if (rand < 0.85) {
            hiddenLayers = [16, 12, 8]; // 3 Layers (Sophisticated)
            strategyName = "Cortex Quant";
        } else if (rand < 0.95) {
            hiddenLayers = [24, 18, 12, 8]; // 4 Layers (Institutional)
            strategyName = "Alpha-Centauri-HFT";
        } else {
            hiddenLayers = [32, 24, 16, 12, 8]; // 5 Layers (Super-Intelligence)
            strategyName = "God-Eye Protocol";
        }

        const region = REGIONS[i % REGIONS.length];

        aiInvestors.push({
            id: `ai-${i + 1}`,
            name: `${strategyName.split(' ')[0]} #${i + 1}`,
            strategyName: strategyName,
            region,
            initialCash: AI_INITIAL_INVESTOR_CASH,
            jurisdiction: JURISDICTIONS[i % JURISDICTIONS.length],
            strategy: {
                strategyType: 'hyperComplex',
                network: new NeuralNetwork([INDICATOR_NEURONS.length, ...hiddenLayers, 1], INDICATOR_NEURONS),
                riskAversion: 0.3 + Math.random() * 0.4,
                tradeFrequency: 2 + Math.floor(Math.random() * 8),
                learningRate: 0.005 + Math.random() * 0.015
            }
        });
    }

    const humanPlayer: InvestorConfig = {
        id: 'human-player',
        name: 'Human Player',
        isHuman: true,
        region: 'North America',
        initialCash: HUMAN_INITIAL_INVESTOR_CASH,
        jurisdiction: 'USA_WA',
        strategy: { strategyType: 'random', tradeChance: 0 }
    };
    
    return [humanPlayer, ...aiInvestors];
};