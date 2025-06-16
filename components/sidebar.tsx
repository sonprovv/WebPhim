"use client";

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";

export interface FilterItem {
  id: string;
  name: string;
  count: number;
}

interface FilterSectionProps {
  title: string;
  items: FilterItem[];
  selectedItems: string[];
  onItemChange: (id: string, checked: boolean) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const FilterSection = ({
  title,
  items,
  selectedItems,
  onItemChange,
  isOpen,
  onToggle,
}: FilterSectionProps) => {
  return (
    <div className="border-b border-gray-700 pb-4 mb-4">
      <button
        className="flex items-center justify-between w-full text-left text-white font-medium py-2"
        onClick={onToggle}
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      
      {isOpen && (
        <div className="mt-2 space-y-2">
          {items.map((item) => (
            <label key={item.id} className="flex items-center justify-between text-gray-300 text-sm">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={item.id}
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={(checked) => onItemChange(item.id, checked as boolean)}
                  className="h-4 w-4 rounded border-gray-600"
                />
                <span>{item.name}</span>
              </div>
              <span className="text-gray-500 text-xs">{item.count}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

interface SidebarProps {
  className?: string;
  genres: FilterItem[];
  countries: FilterItem[];
  years: FilterItem[];
}

export function Sidebar({ className, genres = [], countries = [], years = [] }: SidebarProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleGenreChange = (genreId: string, checked: boolean) => {
    if (checked) {
      setSelectedGenres([...selectedGenres, genreId]);
    } else {
      setSelectedGenres(selectedGenres.filter((id) => id !== genreId));
    }
  };

  const handleCountryChange = (countryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCountries([...selectedCountries, countryId]);
    } else {
      setSelectedCountries(selectedCountries.filter((id) => id !== countryId));
    }
  };

  const handleYearChange = (year: string, checked: boolean) => {
    if (checked) {
      setSelectedYears([...selectedYears, year]);
    } else {
      setSelectedYears(selectedYears.filter((y) => y !== year));
    }
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedCountries([]);
    setSelectedYears([]);
  };

  return (
    <div className={cn("bg-gray-900 text-white w-64 h-screen overflow-y-auto", className)}>
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Filter size={20} />
          <h2 className="text-lg font-semibold">Bộ lọc</h2>
        </div>
      </div>

      <div className="p-4">
        <FilterSection
          title="Thể loại"
          items={genres}
          selectedItems={selectedGenres}
          onItemChange={handleGenreChange}
          isOpen={openSection === 'genres'}
          onToggle={() => toggleSection('genres')}
        />

        <FilterSection
          title="Quốc gia"
          items={countries}
          selectedItems={selectedCountries}
          onItemChange={handleCountryChange}
          isOpen={openSection === 'countries'}
          onToggle={() => toggleSection('countries')}
        />

        <FilterSection
          title="Năm phát hành"
          items={years}
          selectedItems={selectedYears}
          onItemChange={handleYearChange}
          isOpen={openSection === 'years'}
          onToggle={() => toggleSection('years')}
        />

        <div className="mt-6 space-y-2">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => console.log('Filtering...')}
          >
            Áp dụng
          </Button>
          <Button 
            variant="outline" 
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            onClick={clearFilters}
          >
            Xóa bộ lọc
          </Button>
        </div>
      </div>
    </div>
  );
}