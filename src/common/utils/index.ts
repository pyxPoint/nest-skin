export const generateUrl = (title: string) => {
  return (
    title
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') + '.html'
  );
};

export const buildTree = (data: any[], parentId: number = -1): any[] =>
  data
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      ...item,
      children: buildTree(data, item.id).sort((a, b) => a.order - b.order),
    }));

export const buildParentList = (parents: any[], data: any[]): any[] =>
  parents.map((item) => ({
    ...item,
    children: data.some((child) => child.parentId === item.id),
  }));
