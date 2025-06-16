export function sortChartDataByMonths(data: { x: string; y: any }[]) {
  return data.sort((a, b) => {
    return (
      new Date(`2021-${a.x}-01`).getMonth() -
      new Date(`2021-${b.x}-01`).getMonth()
    );
  });
}
