import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import FilterSidebar from './components/FilterSidebar';
import ResortGrid from './components/ResortGrid';
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
  const [sortOption, setSortOption] = useState<SortOption>('default');

  useEffect(() => {
    const fetchResorts = async () => {
      try {
        setLoading(true);
        // Fetch from all four JSON files concurrently
        const [resorts1Response, resorts2Response, resorts3Response, resorts4Response] = await Promise.all([
          fetch('/api/resorts.json'),
          fetch('/api/resorts2.json'),
          fetch('/api/resorts3.json'),
          fetch('/api/resorts4.json')
        ]);

        if (!resorts1Response.ok || !resorts2Response.ok || !resorts3Response.ok || !resorts4Response.ok) {
          throw new Error('리조트 데이터를 불러오는 데 실패했습니다.');
        }

        const data1: Resort[] = await resorts1Response.json();
        const data2: Resort[] = await resorts2Response.json();
        const data3: Resort[] = await resorts3Response.json();
        const data4: Resort[] = await resorts4Response.json();
        
        const combinedData = [...data1, ...data2, ...data3, ...data4];

        setInitialResorts(combinedData);
        setDisplayedResorts(combinedData);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchResorts();
  }, []);

  const applyFiltersAndSort = useCallback(() => {
    let processedResorts = [...initialResorts];

    // Filtering
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

    // Sorting
    switch (sortOption) {
      case 'price-asc':
        processedResorts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        processedResorts.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        processedResorts.sort((a, b) => b.rating - a.rating);
        break;
      case 'snorkeling-desc':
        processedResorts.sort((a, b) => b.snorkelingQuality - a.snorkelingQuality);
        break;
      case 'travelTime-asc':
        processedResorts.sort((a, b) => a.travelTime - b.travelTime);
        break;
      case 'default':
      default:
        // Default sort is by ID, which is the initial order.
        processedResorts.sort((a, b) => a.id - b.id);
        break;
    }

    setDisplayedResorts(processedResorts);
  }, [filters, initialResorts, sortOption]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  const handleSearchChange = (term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
  };

  const handleFilterChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
  };
  
  return (
    <div className="min-h-screen bg-white">
      <Header searchTerm={filters.searchTerm} onSearchChange={handleSearchChange} />
      <main className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8">
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
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;