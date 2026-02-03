import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SimulationState, Page, TaxJurisdiction, ActiveEvent } from './types.ts';
import { initializeState, advanceTime, playerBuyStock, playerSellStock } from './services/simulationService.ts';
import { SIMULATION_SPEEDS } from './constants.tsx';
import { generateNewsArticleGemini } from './services/newsGenerationService.ts';
import DetailedStockView from './Stock-Market-main/components/DetailedStockView.tsx';
import Header from './Stock-Market-main/components/Header.tsx';
import HomePage from './Stock-Market-main/pages/HomePage.tsx';
import PortfolioPage from './Stock-Market-main/pages/PortfolioPage.tsx';
import MarketsPage from './Stock-Market-main/pages/MarketsPage.tsx';
import AIPage from './Stock-Market-main/pages/AIPage.tsx';
import IndexesPage from './Stock-Market-main/pages/IndexesPage.tsx';
import NewsDetailView from './Stock-Market-main/components/NewsDetailView.tsx';

const App: React.FC = () => {
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(SIMULATION_SPEEDS[6].steps);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<Page>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [worldClockCount, setWorldClockCount] = useState<number>(3);
  const intervalRef = useRef<number | null>(null);

  const simulationStateRef = useRef<SimulationState | null>(simulationState);
  useEffect(() => {
    simulationStateRef.current = simulationState;
  }, [simulationState]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    const initialState = initializeState({ useRealPrices: false, realisticDemographics: false });
    setSimulationState(initialState);
  }, []);

  const handleResetWithRealData = useCallback(() => {
    setIsRunning(false);
    const initialState = initializeState({ useRealPrices: true, realisticDemographics: true });
    setSimulationState(initialState);
  }, []);

  useEffect(() => {
    handleReset();
  }, [handleReset]);

  useEffect(() => {
    if (!simulationState) return;
    const eventsToUpdate = simulationState.eventHistory.filter(e => e.fullText && e.fullText.includes("PLACEHOLDER"));
    if (eventsToUpdate.length > 0) {
        const updateEvent = async (event: ActiveEvent) => {
            try {
                const article = await generateNewsArticleGemini(event, simulationState);
                setSimulationState(prev => {
                    if (!prev) return null;
                    const nextEvents = prev.eventHistory.map(e => 
                        e.id === event.id ? { ...e, ...article } : e
                    );
                    return { ...prev, eventHistory: nextEvents };
                });
            } catch (err) {
                console.error("Gemini News Generation Failed:", err);
            }
        };
        updateEvent(eventsToUpdate[0]);
    }
  }, [simulationState]);

  useEffect(() => {
    if (isRunning) {
        intervalRef.current = window.setInterval(() => {
            if (!simulationStateRef.current) return;
            try {
                const nextState = advanceTime(simulationStateRef.current, speed);
                setSimulationState(nextState);
            } catch (error) {
                console.error("Error advancing simulation time:", error);
            }
        }, 1000);
    } else {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }
    return () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };
  }, [isRunning, speed]);

  const handlePlayPause = useCallback(() => setIsRunning(prev => !prev), []);
  const handleSpeedChange = useCallback((newSpeed: number) => setSpeed(newSpeed), []);
  const handleSelectStock = useCallback((symbol: string) => setSelectedStockSymbol(symbol), []);
  const handleCloseDetailView = useCallback(() => setSelectedStockSymbol(null), []);
  const handleSelectEvent = useCallback((id: string) => setSelectedEventId(id), []);
  const handleCloseNewsDetailView = useCallback(() => setSelectedEventId(null), []);
  const handleNavigate = useCallback((page: Page) => setActivePage(page), []);
  const handlePlayerBuy = useCallback((symbol: string, shares: number) => {
    if (!simulationState) return;
    setSimulationState(prevState => {
      if (!prevState) return null;
      return playerBuyStock(prevState, 'human-player', symbol, shares);
    });
  }, [simulationState]);
  const handlePlayerSell = useCallback((symbol: string, shares: number) => {
      if (!simulationState) return;
      setSimulationState(prevState => {
        if (!prevState) return null;
        return playerSellStock(prevState, 'human-player', symbol, shares);
      });
  }, [simulationState]);
  const handleSearchChange = useCallback((query: string) => setSearchQuery(query), []);
  const handleWorldClockCountChange = useCallback((count: number) => setWorldClockCount(count), []);
  const handlePlayerJurisdictionChange = useCallback((jurisdiction: TaxJurisdiction) => {
    setSimulationState(prevState => {
        if (!prevState) return null;
        const newInvestors = prevState.investors.map(inv => inv.isHuman ? { ...inv, jurisdiction } : inv);
        return { ...prevState, investors: newInvestors };
    });
  }, []);

  const activeStocks = useMemo(() => simulationState?.stocks.filter(s => !s.isDelisted) || [], [simulationState?.stocks]);
  const filteredInvestors = useMemo(() => {
    if (!searchQuery || !simulationState) return simulationState?.investors.filter(i => !i.isHuman) || [];
    const lowercasedQuery = searchQuery.toLowerCase();
    return simulationState.investors.filter(investor => !investor.isHuman && investor.name.toLowerCase().includes(lowercasedQuery));
  }, [simulationState, searchQuery]);
  const selectedStock = useMemo(() => selectedStockSymbol ? activeStocks.find(s => s.symbol === selectedStockSymbol) : null, [selectedStockSymbol, activeStocks]);
  const selectedEvent = useMemo(() => selectedEventId ? simulationState?.eventHistory.find(e => e.id === selectedEventId) : null, [selectedEventId, simulationState?.eventHistory]);
  const humanPlayer = useMemo(() => simulationState?.investors.find(inv => inv.isHuman), [simulationState?.investors]);

  const renderActivePage = () => {
    if (!simulationState) return null;
    switch(activePage) {
        case 'home': return <HomePage eventHistory={simulationState.eventHistory} stocks={activeStocks} onSelectStock={handleSelectStock} onSelectEvent={handleSelectEvent} day={simulationState.day} startDate={simulationState.startDate} />
        case 'portfolio': return <PortfolioPage player={humanPlayer!} stocks={activeStocks} onSelectStock={handleSelectStock} onJurisdictionChange={handlePlayerJurisdictionChange} />
        case 'markets': return <MarketsPage stocks={activeStocks} onSelectStock={handleSelectStock} searchQuery={searchQuery} />
        case 'aii': return <AIPage investors={filteredInvestors} stocks={simulationState.stocks} searchQuery={searchQuery} />
        case 'indexes': return <IndexesPage state={simulationState} />
        default: return <HomePage eventHistory={simulationState.eventHistory} stocks={activeStocks} onSelectStock={handleSelectStock} onSelectEvent={handleSelectEvent} day={simulationState.day} startDate={simulationState.startDate} />
    }
  }

  if (!simulationState) {
    return <div className="flex items-center justify-center min-h-screen bg-background text-gray-200">Loading Simulation...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-gray-200 font-sans">
      <Header activePage={activePage} onNavigate={handleNavigate} simulationState={simulationState} isRunning={isRunning} onPlayPause={handlePlayPause} onReset={handleReset} onResetWithRealData={handleResetWithRealData} speed={speed} onSpeedChange={handleSpeedChange} searchQuery={searchQuery} onSearchChange={handleSearchChange} worldClockCount={worldClockCount} onWorldClockCountChange={handleWorldClockCountChange} />
      <main className="max-w-screen-2xl mx-auto p-2 md:p-4">{renderActivePage()}</main>
      {selectedStock && <DetailedStockView stock={selectedStock} allStocks={activeStocks} onClose={handleCloseDetailView} player={humanPlayer} onPlayerBuy={handlePlayerBuy} onPlayerSell={handlePlayerSell} />}
      {selectedEvent && <NewsDetailView event={selectedEvent} onClose={handleCloseNewsDetailView} />}
      <footer className="text-center mt-8 pb-4 text-xs text-gray-600"><p>Disclaimer: This is a fictional simulation and does not represent real financial advice.</p></footer>
    </div>
  );
};

export default App;