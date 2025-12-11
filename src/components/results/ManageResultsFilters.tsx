
import { useState } from "react";
import ResultsSearchFilters from "@/components/results/ResultsSearchFilters";

interface ManageResultsFiltersProps {
  showMobileFilters: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filters: {
    class: string;
    department: string;
    session: string;
    term: string;
    teacher: string;
  };
  setFilters: (filters: any) => void;
  pageSize: string;
  setPageSize: (size: string) => void;
  classes: any[];
  departments: any[];
  teachers: any[];
  onClearFilters: () => void;
}

const ManageResultsFilters = ({
  showMobileFilters,
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  pageSize,
  setPageSize,
  classes,
  departments,
  teachers,
  onClearFilters
}: ManageResultsFiltersProps) => {
  return (
    <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block`}>
      <ResultsSearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        pageSize={pageSize}
        setPageSize={setPageSize}
        classes={classes}
        departments={departments}
        teachers={teachers}
        onClearFilters={onClearFilters}
      />
    </div>
  );
};

export default ManageResultsFilters;
