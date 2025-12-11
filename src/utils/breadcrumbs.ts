
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const pathSegments = pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) {
    return [{ label: "Dashboard", path: "/" }];
  }

  const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", path: "/" }];

  // Route mapping for better labels
  const routeMap: Record<string, string> = {
    'classes': 'Classes',
    'subjects': 'Subjects',
    'students': 'Students',
    'results': 'Results',
    'manage-sheets': 'Manage Sheets',
    'manage-transfers': 'Manage Transfers',
    'manage-teacher': 'Manage Teacher',
    'settings': 'Settings',
    'add-students': 'Add Students',
    'manage-students': 'Manage Students',
    'manage-subjects': 'Manage Subjects',
    'manage-departments': 'Manage Student Department',
    'manage-combinations': 'Manage Subject Combination',
    'add-results': 'Add Results',
    'manage-results': 'Manage Results',
  };

  let currentPath = '';
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Only add path for parent routes, not the current page
    const isCurrentPage = index === pathSegments.length - 1;

    // Base label from route map or capitalized segment
    let label = routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

    // If the last segment is a UUID on a results/view route, show a friendly label
    const isUuid = /^[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/.test(segment);
    if (isCurrentPage && isUuid) {
      const prev = pathSegments[index - 1];
      const hasResults = pathSegments.includes('results');
      if (hasResults || prev === 'view') {
        label = 'View Result'; // Change to 'Student Result' if preferred
      }
    }

    breadcrumbs.push({
      label,
      path: isCurrentPage ? undefined : currentPath
    });
  });

  return breadcrumbs;
};
