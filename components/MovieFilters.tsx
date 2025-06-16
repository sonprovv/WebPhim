import { useState } from 'react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface MovieFiltersProps {
  filters: {
    sort_field?: string;
    sort_type?: string;
    sort_lang?: string;
    category?: string;
    country?: string;
    year?: number;
  };
  onFilterChange: (filters: any) => void;
}

export function MovieFilters({ filters = {}, onFilterChange }: MovieFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="flex flex-wrap gap-4">
      <Select
        value={localFilters.sort_field || ''}
        onValueChange={(value) => handleFilterChange('sort_field', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sắp xếp theo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="modified.time">Mới cập nhật</SelectItem>
          <SelectItem value="year">Năm sản xuất</SelectItem>
          <SelectItem value="name">Tên phim</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={localFilters.sort_type || ''}
        onValueChange={(value) => handleFilterChange('sort_type', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Thứ tự" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Giảm dần</SelectItem>
          <SelectItem value="asc">Tăng dần</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={localFilters.sort_lang || ''}
        onValueChange={(value) => handleFilterChange('sort_lang', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Ngôn ngữ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="vietsub">Vietsub</SelectItem>
          <SelectItem value="thuyetminh">Thuyết minh</SelectItem>
          <SelectItem value="lồng tiếng">Lồng tiếng</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={() => {
          setLocalFilters({});
          onFilterChange({});
        }}
      >
        Xóa bộ lọc
      </Button>
    </div>
  );
} 