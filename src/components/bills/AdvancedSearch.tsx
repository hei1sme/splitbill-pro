"use client";

import React, { useState } from "react";
import { Search, Filter, Calendar, DollarSign, Users, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface AdvancedFilters {
  searchTerm: string;
  status: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  amountRange: {
    min: string;
    max: string;
  };
  category: string;
  groupId: string;
}

interface AdvancedSearchProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  groups: Array<{ id: string; name: string }>;
}

export function AdvancedSearch({ filters, onFiltersChange, groups }: AdvancedSearchProps) {
  const [showFilters, setShowFilters] = useState(false);

  const updateFilters = (key: keyof AdvancedFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: "",
      status: "",
      dateRange: { from: undefined, to: undefined },
      amountRange: { min: "", max: "" },
      category: "",
      groupId: "",
    });
  };

  const activeFiltersCount = Object.values(filters).filter((value) => {
    if (typeof value === "string") return value !== "";
    if (typeof value === "object" && value !== null) {
      if ("from" in value) return value.from || value.to;
      if ("min" in value) return value.min !== "" || value.max !== "";
    }
    return false;
  }).length;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Search & Filter Bills</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="ml-auto"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by bill name, description, or participants..."
            value={filters.searchTerm}
            onChange={(e) => updateFilters("searchTerm", e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => updateFilters("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PARTIAL">Partially Paid</SelectItem>
                  <SelectItem value="SETTLED">Settled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Group Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Group
              </label>
              <Select
                value={filters.groupId}
                onValueChange={(value) => updateFilters("groupId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All groups</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Category
              </label>
              <Select
                value={filters.category}
                onValueChange={(value) => updateFilters("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  <SelectItem value="food">Food & Dining</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </label>
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      {filters.dateRange.from ? (
                        format(filters.dateRange.from, "MMM d")
                      ) : (
                        "From"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filters.dateRange.from}
                      onSelect={(date) =>
                        updateFilters("dateRange", {
                          ...filters.dateRange,
                          from: date,
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      {filters.dateRange.to ? (
                        format(filters.dateRange.to, "MMM d")
                      ) : (
                        "To"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filters.dateRange.to}
                      onSelect={(date) =>
                        updateFilters("dateRange", {
                          ...filters.dateRange,
                          to: date,
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Amount Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Amount Range
              </label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.amountRange.min}
                  onChange={(e) =>
                    updateFilters("amountRange", {
                      ...filters.amountRange,
                      min: e.target.value,
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.amountRange.max}
                  onChange={(e) =>
                    updateFilters("amountRange", {
                      ...filters.amountRange,
                      max: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="w-full"
                disabled={activeFiltersCount === 0}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
