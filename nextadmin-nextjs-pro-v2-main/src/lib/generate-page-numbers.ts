export function generatePageNumbers(totalPages: number, currentPage: number) {
  const pages: (number | string)[] = [];

  if (totalPages < 5) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage > 3) pages.push(1, "...");
    for (
      let i = Math.max(1, currentPage - 2);
      i <= Math.min(totalPages, currentPage + 2);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...", totalPages);
  }

  return pages;
}
