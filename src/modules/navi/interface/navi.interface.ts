export interface GetNavigationItem {
  id: number;
  status: number;
  title: string;
  url: string;
  order: number;
  parentId: number | null;
  mainMenu?: boolean | null;
  createdAt?: Date;
  updatedAt?: Date;
  breadcrumbs?: boolean | null;
  sideBar?: boolean | null;
}
export interface CreateNavigationItem extends Omit<GetNavigationItem, 'id'> {
  id?: number;
  batchTag?: string;
}

export interface SearchNavigationListItem {
  id: number;
  title: string;
  url: string;
  order: number;
  parentId: number | null;
  mainMenu?: boolean | null;
  breadcrumbs?: boolean | null;
  sideBar?: boolean | null;
}

export interface NavigationItem extends SearchNavigationListItem {
  isChildren: boolean;
}
export interface NavigationItemData {
  list: NavigationItem[];
  total: number;
  hasMore: boolean;
}
export interface GetNavigationParams {
  title?: string;
  id?: number;
  start?: number;
  size?: number;
}
