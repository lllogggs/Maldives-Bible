import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import FilterSidebar from './components/FilterSidebar';
import ResortGrid from './components/ResortGrid';
import EditModal from './components/EditModal';
import ResortDetail from './components/ResortDetail';
import CompareTray from './components/CompareTray';
import CompareView from './components/CompareView';
import NavBar from './components/NavBar';
import TravelAgencies from './components/TravelAgencies';
import { POPULARITY_RANKING } from './constants';
import type { Resort, Filters, SortOption } from './types';

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
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingResort, setEditingResort] = useState<Resort | null>(null);
  const [selectedResortId, setSelectedResortId] = useState<number | null>(null);
  const [compareList, setCompareList] = useState<number[]>([]);
  const [isCompareViewVisible, setIsCompareViewVisible] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'resorts' | 'agencies'>('resorts');

  useEffect(() => {
    const fetchResorts = async () => {
      try {
        setLoading(true);
        // vite.config.ts의 base 경로를 가져와 절대 경로를 만듭니다.
        const baseUrl = import.meta.env.BASE_URL;
        const resortFileUrls = Array.from({ length: 9 }, (_, i) =>
            // 예: /Maldives-Bible/api/resorts.json
            `${baseUrl}api/resorts${i === 0 ? '' : i + 1}.json`
        );

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
  }, [filters, initialResorts, sortOption]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  const selectedResort = initialResorts.find(r => r.id === selectedResortId);

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

  const handleToggleEditMode = () => {
    setIsEditMode(prev => !prev);
  };

  const handleOpenEditModal = (resort: Resort) => {
    setEditingResort(resort);
  };

  const handleCloseEditModal = () => {
    setEditingResort(null);
  };
  
  const handleGoBackToList = () => {
    window.location.hash = '';
  };

  const handleSaveResort = (resortId: number, newImageUrl: string) => {
    const updatedInitialResorts = initialResorts.map(r => {
      if (r.id === resortId) {
        const newImageUrls = r.imageUrls ? [...r.imageUrls] : [''];
        newImageUrls[0] = newImageUrl;
        return { ...r, imageUrls: newImageUrls };
      }
      return r;
    });
    setInitialResorts(updatedInitialResorts);

    const overrides = JSON.parse(localStorage.getItem('resortOverrides') || '{}');
    const resortToUpdate = updatedInitialResorts.find(r => r.id === resortId);
    if(resortToUpdate) {
        overrides[resortId] = { ...overrides[resortId], imageUrls: resortToUpdate.imageUrls };
        localStorage.setItem('resortOverrides', JSON.stringify(overrides));
    }

    handleCloseEditModal();
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

  const resortsToCompare = initialResorts
    .filter(r => compareList.includes(r.id))
    .sort((a, b) => compareList.indexOf(a.id) - compareList.indexOf(b.id));

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Header 
        searchTerm={filters.searchTerm} 
        onSearchChange={handleSearchChange}
        isEditMode={isEditMode}
        onToggleEditMode={handleToggleEditMode}
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
                <div className="lg:col-span-1">
                  <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
                </div>
                <div className="lg:col-span-3">
                  {loading && <div className="text-center py-16">몰디브 리조트 정보를 불러오는 중입니다...</div>}
                  {error && <div className="text-center py-16 text-red-500">에러: {error}</div>}
                  {!loading && !error && (
                    <ResortGrid 
                      resorts={displayedResorts} 
                      sortOption={sortOption}
                      onSortChange={handleSortChange}
                      isEditMode={isEditMode}
                      onEditResort={handleOpenEditModal}
                      compareList={compareList}
                      onToggleCompare={handleToggleCompare}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
       {!isCompareViewVisible && currentView === 'resorts' && (
        <CompareTray 
          resorts={resortsToCompare} 
          onRemove={handleToggleCompare}
          onClear={handleClearCompare}
          onCompare={handleShowCompare}
        />
      )}
      {editingResort && (
        <EditModal
          resort={editingResort}
          onSave={handleSaveResort}
          onClose={handleCloseEditModal}
        />
      )}
    </div>
  );
};

export default App;
