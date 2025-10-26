import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import FilterSidebar from './components/FilterSidebar';
import ResortGrid from './components/ResortGrid';
import ResortDetail from './components/ResortDetail';
import CompareTray from './components/CompareTray';
import CompareView from './components/CompareView';
import NavBar from './components/NavBar';
import TravelAgencies from './components/TravelAgencies';
import { POPULARITY_RANKING } from './constants';
import type { Resort, Filters, SortOption } from './types';

const RESORTS_PER_PAGE = 15;

const parseNumberArray = (value: string | null): number[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is number => typeof item === 'number');
    }
  } catch (err) {
    console.error('Failed to parse number array from localStorage', err);
  }

  return [];
};

const App: React.FC = () => {
  const [initialResorts, setInitialResorts] = useState<Resort[]>([]);
  const [displayedResorts, setDisplayedResorts] = useState<Resort[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    transportation: [],
    maxPrice: 30000,
    roomTypes: [],
    minRestaurants: 0,
    minBars: 0,
    hasPrivatePool: false,
  });
  const [sortOption, setSortOption] = useState<SortOption>('popularity');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedResortId, setSelectedResortId] = useState<number | null>(null);
  const [compareList, setCompareList] = useState<number[]>([]);
  const [isCompareViewVisible, setIsCompareViewVisible] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'resorts' | 'agencies'>('resorts');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isImageEditMode, setIsImageEditMode] = useState<boolean>(false);
  const [previousSortOption, setPreviousSortOption] = useState<SortOption>('popularity');
  const [customOrder, setCustomOrder] = useState<number[]>([]);
  const [hiddenResortIds, setHiddenResortIds] = useState<number[]>([]);


  useEffect(() => {
    const fetchResorts = async () => {
      try {
        setLoading(true);

        const isProd = window.location.hostname.includes('github.io');
        
        const resortFileUrls = Array.from({ length: 9 }, (_, i) => {
          const fileName = `resorts${i === 0 ? '' : i + 1}.json`;
          // 개발 환경(AI Studio)에서는 상대 경로를, 프로덕션 환경(GitHub)에서는 절대 경로를 사용합니다.
          return isProd ? `/Maldives-Bible/api/${fileName}` : `api/${fileName}`;
        });

        const responses = await Promise.all(resortFileUrls.map(url => fetch(url)));

        for (const response of responses) {
            if (!response.ok) {
                throw new Error(`리조트 데이터를 불러오는 데 실패했습니다: ${response.statusText} (${response.url})`);
            }
        }

        const resortsDataArrays: Resort[][] = await Promise.all(responses.map(res => res.json()));
        
        const combinedData = resortsDataArrays.flat();
        const overrides = JSON.parse(localStorage.getItem('resortOverrides') || '{}');
        const mergedData = combinedData.map(resort => ({
          ...resort,
          ...(overrides[resort.id] || {}),
        }));

        const hiddenResortsFromStorage = parseNumberArray(localStorage.getItem('hiddenResorts'));
        const hiddenSet = new Set(hiddenResortsFromStorage);
        const storedOrder = parseNumberArray(localStorage.getItem('resortOrder'));
        const mergedIds = mergedData.map(resort => resort.id);
        const sanitizedOrder = storedOrder.filter(id => mergedIds.includes(id) && !hiddenSet.has(id));
        const orderSet = new Set(sanitizedOrder);
        const missingIds = mergedIds.filter(id => !orderSet.has(id) && !hiddenSet.has(id));
        const finalOrder = [...sanitizedOrder, ...missingIds];

        setHiddenResortIds(hiddenResortsFromStorage);
        setCustomOrder(finalOrder);
        localStorage.setItem('resortOrder', JSON.stringify(finalOrder));
        setInitialResorts(mergedData);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchResorts();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#\/resort\/(\d+)$/);
      if (match) {
        setSelectedResortId(Number(match[1]));
        window.scrollTo(0, 0);
      } else {
        setSelectedResortId(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // 초기 로드 시에도 해시를 확인합니다.

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const applyFiltersAndSort = useCallback(() => {
    let processedResorts = [...initialResorts];
    const hiddenSet = new Set(hiddenResortIds);

    processedResorts = processedResorts.filter(resort => !hiddenSet.has(resort.id));

    // Filtering logic...
    if (filters.searchTerm) {
      processedResorts = processedResorts.filter(resort =>
        resort.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        resort.name_en.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }
    if (filters.transportation.length > 0) {
      processedResorts = processedResorts.filter(resort =>
        filters.transportation.includes(resort.transportation)
      );
    }
    processedResorts = processedResorts.filter(resort => resort.price <= filters.maxPrice);
    if (filters.roomTypes.length > 0) {
      processedResorts = processedResorts.filter(resort =>
        filters.roomTypes.every(type => {
          if (type === 'beach') return resort.hasBeachVilla;
          if (type === 'water') return resort.hasWaterVilla;
          return false;
        })
      );
    }
    if (filters.hasPrivatePool) {
      processedResorts = processedResorts.filter(resort => resort.hasPrivatePool);
    }
    processedResorts = processedResorts.filter(resort => resort.restaurants >= filters.minRestaurants);
    processedResorts = processedResorts.filter(resort => resort.bars >= filters.minBars);

    // Sorting logic...
    switch (sortOption) {
      case 'custom': {
        if (customOrder.length > 0) {
          const orderMap = new Map(customOrder.map((id, index) => [id, index]));
          processedResorts.sort((a, b) => {
            const indexA = orderMap.get(a.id);
            const indexB = orderMap.get(b.id);

            if (indexA === undefined && indexB === undefined) return a.id - b.id;
            if (indexA === undefined) return 1;
            if (indexB === undefined) return -1;
            return indexA - indexB;
          });
        }
        break;
      }
      case 'popularity':
        processedResorts.sort((a, b) => {
          const rankA = POPULARITY_RANKING.indexOf(a.name);
          const rankB = POPULARITY_RANKING.indexOf(b.name);

          if (rankA !== -1 && rankB !== -1) return rankA - rankB;
          if (rankA !== -1) return -1;
          if (rankB !== -1) return 1;
          return a.id - b.id; // Fallback for unranked items
        });
        break;
      case 'price-asc': processedResorts.sort((a, b) => a.price - b.price); break;
      case 'price-desc': processedResorts.sort((a, b) => b.price - a.price); break;
      case 'rating-desc': processedResorts.sort((a, b) => b.rating - a.rating); break;
      case 'snorkeling-desc': processedResorts.sort((a, b) => b.snorkelingQuality - a.snorkelingQuality); break;
      case 'travelTime-asc': processedResorts.sort((a, b) => a.travelTime - b.travelTime); break;
    }

    setDisplayedResorts(processedResorts);
    setCurrentPage(1);
  }, [customOrder, filters, hiddenResortIds, initialResorts, sortOption]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  const selectedResort = initialResorts.find(r => r.id === selectedResortId);
  const calculatedTotalPages = displayedResorts.length === 0
    ? 0
    : Math.ceil(displayedResorts.length / RESORTS_PER_PAGE);

  const paginatedResorts = isImageEditMode
    ? displayedResorts
    : calculatedTotalPages === 0
      ? []
      : displayedResorts.slice(
          (currentPage - 1) * RESORTS_PER_PAGE,
          currentPage * RESORTS_PER_PAGE
        );

  const totalPages = isImageEditMode
    ? (displayedResorts.length > 0 ? 1 : 0)
    : calculatedTotalPages;

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (selectedResortId && initialResorts.length > 0 && !selectedResort) {
      window.location.hash = '';
    }
  }, [selectedResortId, initialResorts, selectedResort]);

  const handleSearchChange = (term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
  };

  const handleFilterChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBackToList = () => {
    window.location.hash = '';
  };

  const handleToggleCompare = (resortId: number) => {
    setCompareList(prev => {
      if (prev.includes(resortId)) {
        return prev.filter(id => id !== resortId);
      }
      if (prev.length < 3) {
        return [...prev, resortId];
      }
      alert('최대 3개의 리조트만 비교할 수 있습니다.');
      return prev;
    });
  };

  const handleClearCompare = () => {
    setCompareList([]);
  };

  const handleShowCompare = () => {
    setIsCompareViewVisible(true);
    window.scrollTo(0, 0);
  };

  const handleHideCompare = () => {
    setIsCompareViewVisible(false);
  };

  const handleToggleImageEditMode = () => {
    if (!isImageEditMode) {
      setPreviousSortOption(sortOption);
      if (sortOption !== 'custom') {
        setSortOption('custom');
      }
      setCurrentPage(1);
      setIsImageEditMode(true);
      return;
    }

    setIsImageEditMode(false);
    setSortOption(previousSortOption);
  };

  const handleDeleteResort = (resortId: number) => {
    setHiddenResortIds(prev => {
      if (prev.includes(resortId)) {
        return prev;
      }
      const updated = [...prev, resortId];
      localStorage.setItem('hiddenResorts', JSON.stringify(updated));
      return updated;
    });

    setCustomOrder(prev => {
      if (!prev.includes(resortId)) {
        return prev;
      }
      const updatedOrder = prev.filter(id => id !== resortId);
      localStorage.setItem('resortOrder', JSON.stringify(updatedOrder));
      return updatedOrder;
    });

    setCompareList(prev => prev.filter(id => id !== resortId));

    if (selectedResortId === resortId) {
      setSelectedResortId(null);
      window.location.hash = '';
    }
  };

  const handleMoveResort = (resortId: number, direction: 'up' | 'down') => {
    setCustomOrder(prev => {
      const index = prev.indexOf(resortId);
      if (index === -1) {
        return prev;
      }

      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= prev.length) {
        return prev;
      }

      const updatedOrder = [...prev];
      [updatedOrder[index], updatedOrder[swapIndex]] = [updatedOrder[swapIndex], updatedOrder[index]];
      localStorage.setItem('resortOrder', JSON.stringify(updatedOrder));
      return updatedOrder;
    });
  };

  const resortsToCompare = initialResorts
    .filter(r => compareList.includes(r.id))
    .sort((a, b) => compareList.indexOf(a.id) - compareList.indexOf(b.id));

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Header
        searchTerm={filters.searchTerm}
        onSearchChange={handleSearchChange}
        isImageEditMode={isImageEditMode}
        onToggleImageEditMode={handleToggleImageEditMode}
      />
      <main className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8">
        <NavBar currentView={currentView} onViewChange={setCurrentView} />
        
        {currentView === 'agencies' && <TravelAgencies />}
        
        {currentView === 'resorts' && (
          <>
            {isCompareViewVisible ? (
              <CompareView 
                resorts={resortsToCompare} 
                onBack={handleHideCompare}
                onRemove={handleToggleCompare}
              />
            ) : selectedResortId && selectedResort ? (
              <ResortDetail resort={selectedResort} onBack={handleGoBackToList} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 hidden lg:block">
                  <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
                </div>
                <div className="lg:col-span-3">
                  {loading && <div className="text-center py-16">몰디브 리조트 정보를 불러오는 중입니다...</div>}
                  {error && <div className="text-center py-16 text-red-500">에러: {error}</div>}
                  {!loading && !error && (
                    <ResortGrid
                      resorts={paginatedResorts}
                      sortOption={sortOption}
                      onSortChange={handleSortChange}
                      totalResortsCount={displayedResorts.length}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      compareList={compareList}
                      onToggleCompare={handleToggleCompare}
                      onOpenFilter={() => setIsFilterOpen(true)}
                      isImageEditMode={isImageEditMode}
                      onDeleteResort={handleDeleteResort}
                      onMoveResort={handleMoveResort}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
      {isFilterOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 lg:hidden transition-opacity duration-300" 
          onClick={() => setIsFilterOpen(false)}
        >
          <div 
            className="bg-white h-full w-4/5 max-w-sm shadow-xl transition-transform duration-300 transform -translate-x-full animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full overflow-y-auto">
              <FilterSidebar 
                filters={filters} 
                onFilterChange={handleFilterChange} 
                onClose={() => setIsFilterOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
       {!isCompareViewVisible && currentView === 'resorts' && !isImageEditMode && (
        <CompareTray
          resorts={resortsToCompare}
          onRemove={handleToggleCompare}
          onClear={handleClearCompare}
          onCompare={handleShowCompare}
        />
      )}
    </div>
  );
};

export default App;
