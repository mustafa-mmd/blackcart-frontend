
import React, { useMemo } from 'react';

export interface Specification {
  key: string;
  value: string | number | boolean;
  group?: string;
  unit?: string;
  icon?: string;
}

interface ProductSpecificationsProps {
  specifications: Specification[];
  isLoading?: boolean;
  emptyMessage?: string;
  title?: string;
}

const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({ 
  specifications = [],
  isLoading = false,
  emptyMessage = "No specifications available for this product.",
  title = "Specifications"
}) => {
  // ✅ FIXED: Group specifications by group
  const groupedSpecs = useMemo(() => {
    if (!specifications || specifications.length === 0) {
      return {};
    }

    return specifications.reduce((acc, spec) => {
      const group = spec.group || 'General';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(spec);
      return acc;
    }, {} as Record<string, Specification[]>);
  }, [specifications]);

  const hasSpecifications = Object.keys(groupedSpecs).length > 0;

  // ✅ FIXED: Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded md:col-span-2"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ✅ FIXED: Empty state with better UI
  if (!hasSpecifications) {
    return (
      <div className="text-center py-10 px-4 bg-gray-50 rounded-xl">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <svg 
            className="h-8 w-8 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          {emptyMessage}
        </p>
      </div>
    );
  }

  // ✅ FIXED: Format key to readable format
  const formatKey = (key: string): string => {
    // Convert camelCase to words with spaces
    const words = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim()
      .toLowerCase();
    
    // Capitalize first letter of each word
    return words
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // ✅ FIXED: Format value with unit
  const formatValue = (spec: Specification): string => {
    let value = spec.value.toString();
    
    // Handle boolean values
    if (typeof spec.value === 'boolean') {
      value = spec.value ? 'Yes' : 'No';
    }
    
    // Add unit if available
    if (spec.unit) {
      value = `${value} ${spec.unit}`;
    }
    
    return value;
  };

  return (
    <section className="space-y-5 md:space-y-8" aria-labelledby="specifications-heading">
      <div>
        <h2 id="specifications-heading" className="text-xl font-bold text-gray-900 md:text-2xl">
          Product {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-600 md:text-base">
          Complete technical specifications and features
        </p>
      </div>

      {Object.entries(groupedSpecs).map(([group, specs]) => (
        <div 
          key={group} 
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          {/* Group Header */}
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3.5 sm:px-5 md:px-6 md:py-4">
            <h3 className="flex flex-wrap items-baseline gap-x-2 text-base font-semibold text-gray-900 md:text-lg">
              <span>{group}</span>
              <span className="text-xs font-normal text-gray-500 sm:text-sm">
                ({specs.length} {specs.length === 1 ? 'specification' : 'specifications'})
              </span>
            </h3>
          </div>
          
          {/* Specifications List */}
          <div className="divide-y divide-gray-100">
            {specs.map((spec, index) => (
              <div 
                key={`${group}-${spec.key}-${index}`}
                className="px-4 py-3.5 transition-colors hover:bg-gray-50 sm:px-5 md:px-6 md:py-4"
              >
                <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)] items-start gap-3 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1.5fr)] md:grid-cols-12 md:gap-6">
                  {/* Specification Key */}
                  <div className="md:col-span-4">
                    <div className="flex items-start gap-3">
                      {spec.icon && (
                        <div className="flex-shrink-0 w-5 h-5 text-gray-400 mt-0.5">
                          {/* Icon placeholder - you can replace with actual icons */}
                          <span className="text-sm">{spec.icon}</span>
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-semibold leading-5 text-gray-900 md:text-base">
                          {formatKey(spec.key)}
                        </h4>
                        {spec.unit && !spec.value.toString().includes(spec.unit) && (
                          <p className="text-xs text-gray-500 mt-1">
                            Measured in {spec.unit}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Specification Value */}
                  <div className="md:col-span-8">
                    <div className="flex min-h-5 items-start md:min-h-8 md:items-center">
                      <p className="min-w-0 break-words text-sm leading-5 text-gray-700 md:text-base md:leading-6">
                        {formatValue(spec)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Footer Note */}
      <div className="border-t border-gray-200 pt-4 md:mt-6 md:pt-6">
        <p className="text-center text-xs leading-5 text-gray-500 md:text-sm">
          Specifications are subject to change without notice. 
          Refer to manufacturer documentation for complete details.
        </p>
      </div>
    </section>
  );
};

export default ProductSpecifications;
