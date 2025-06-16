"use client";

import { ChevronLeft, ChevronRight, SearchIcon } from "@/assets/icons";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { PointerUp } from "./icons";

const data = [
  {
    name: "Brielle Kuphal",
    position: "Senior Javascript Developer",
    office: "Edinburgh",
    age: "25",
    startDate: "2012/03/29",
    salary: 433060,
  },
  {
    name: "Barney Murray",
    position: "Senior Backend Developer",
    office: "amsterdam",
    age: "29",
    startDate: "2010/05/01",
    salary: 424785,
  },
  {
    name: "Ressie Ruecker",
    position: "Senior Frontend Developer",
    office: "Jakarta",
    age: "27",
    startDate: "2013/07/01",
    salary: 785210,
  },
  {
    name: "Teresa Mertz",
    position: "Senior Designer",
    office: "New Caledonia",
    age: "25",
    startDate: "2014/05/30",
    salary: 532126,
  },
  {
    name: "Chelsey Hackett",
    position: "Product Manager",
    office: "NewYork",
    age: "26",
    startDate: "2011/09/30",
    salary: 421541,
  },
  {
    name: "Tatyana Metz",
    position: "Senior Product Manager",
    office: "NewYork",
    age: "28",
    startDate: "2009/09/30",
    salary: 852541,
  },
  {
    name: "Oleta Harvey",
    position: "Junior Product Manager",
    office: "California",
    age: "25",
    startDate: "2015/10/30",
    salary: 654444,
  },
  {
    name: "Bette Haag",
    position: "Junior Product Manager",
    office: "Carolina",
    age: "29",
    startDate: "2017/12/31",
    salary: 541111,
  },
  {
    name: "Meda Ebert",
    position: "Junior Web Developer",
    office: "Amsterdam",
    age: "27",
    startDate: "2015/10/31",
    salary: 651456,
  },
  {
    name: "Elissa Stroman",
    position: "Junior React Developer",
    office: "Kuala Lumpur",
    age: "29",
    startDate: "2008/05/31",
    salary: 566123,
  },
  {
    name: "Sid Swaniawski",
    position: "Senior React Developer",
    office: "Las Vegas",
    age: "29",
    startDate: "2009/09/01",
    salary: 852456,
  },
  {
    name: "Madonna Hahn",
    position: "Senior Vue Developer",
    office: "New York",
    age: "27",
    startDate: "2006/10/01",
    salary: 456147,
  },
  {
    name: "Waylon Kihn",
    position: "Senior HTML Developer",
    office: "Amsterdam",
    age: "23",
    startDate: "2017/11/01",
    salary: 321254,
  },
  {
    name: "Jaunita Lindgren",
    position: "Senior Backend Developer",
    office: "Jakarta",
    age: "25",
    startDate: "2018/12/01",
    salary: 321254,
  },
  {
    name: "Lenora MacGyver",
    position: "Junior HTML Developer",
    office: "Carolina",
    age: "27",
    startDate: "2015/09/31",
    salary: 852254,
  },
  {
    name: "Edyth McCullough",
    position: "Senior Javascript Developer",
    office: "Edinburgh",
    age: "25",
    startDate: "2012/03/29",
    salary: 433060,
  },
  {
    name: "Ibrahim Stroman",
    position: "Senior Backend Developer",
    office: "amsterdam",
    age: "29",
    startDate: "2010/05/01",
    salary: 424785,
  },
  {
    name: "Katelynn Reichert",
    position: "Senior Frontend Developer",
    office: "Jakarta",
    age: "27",
    startDate: "2013/07/01",
    salary: 785210,
  },
  {
    name: "Logan Kiehn",
    position: "Senior Designer",
    office: "New Caledonia",
    age: "25",
    startDate: "2014/05/30",
    salary: 532126,
  },
  {
    name: "Rogers Stanton",
    position: "Product Manager",
    office: "NewYork",
    age: "26",
    startDate: "2011/09/30",
    salary: 421541,
  },
  {
    name: "Alanis Torp",
    position: "Senior Product Manager",
    office: "NewYork",
    age: "28",
    startDate: "2009/09/30",
    salary: 852541,
  },
  {
    name: "Jarvis Bauch",
    position: "Junior Product Manager",
    office: "California",
    age: "25",
    startDate: "2015/10/30",
    salary: 654444,
  },
  {
    name: "Trey Ritchie",
    position: "Junior Product Manager",
    office: "Carolina",
    age: "29",
    startDate: "2017/12/31",
    salary: 541111,
  },
  {
    name: "Ronny Dietrich",
    position: "Junior Web Developer",
    office: "Amsterdam",
    age: "27",
    startDate: "2015/10/31",
    salary: 651456,
  },
  {
    name: "Isabella Christiansen",
    position: "Junior React Developer",
    office: "Kuala Lumpur",
    age: "29",
    startDate: "2008/05/31",
    salary: 566123,
  },
];

// table header
const columns: ColumnDef<(typeof data)[number]>[] = [
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Position",
    accessorKey: "position",
  },
  {
    header: "Office",
    accessorKey: "office",
  },
  {
    header: "Age",
    accessorKey: "age",
  },
  {
    header: "Star Date",
    accessorKey: "startDate",
  },
  {
    header: "Salary",
    accessorKey: "salary",
    cell: (row) => `$${(row.getValue() as number).toLocaleString()}`,
  },
];

export default function DataTableTwo() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      columnFilters,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <section className="data-table-common data-table-two rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      <div className="flex justify-between px-7.5 py-4.5">
        <div className="relative z-20 w-full max-w-[414px]">
          <input
            type="text"
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full rounded-[7px] border border-stroke bg-[#F6F8FB] px-5 py-2.5 outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
            placeholder="Search here..."
          />

          <button className="absolute right-0 top-0 flex h-11.5 w-11.5 items-center justify-center rounded-r-md">
            <SearchIcon />
          </button>
        </div>

        <div className="flex items-center font-medium">
          <p className="pl-2 text-dark dark:text-current">Per Page:</p>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="bg-transparent pl-2.5"
          >
            {[5, 10, 20, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 overflow-x-auto">
        <table className="datatable-table !border-collapse px-4 md:px-8">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      <span>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </span>

                      <div className="ml-2 inline-flex flex-col space-y-[2px]">
                        <PointerUp />
                        <PointerUp className="rotate-180" />
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  No data found
                </td>
              </tr>
            )}

            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="truncate">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-6 py-5">
        <p className="font-medium">
          Showing {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()} pages
        </p>
        <div className="flex">
          <button
            className="flex cursor-pointer items-center justify-center rounded-[3px] p-[7px] px-[7px] hover:bg-primary hover:text-white disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft width={18} height={18} />
          </button>

          {Array.from(
            { length: table.getPageCount() },
            (_, index) => index,
          ).map((pageIndex) => (
            <button
              key={pageIndex}
              onClick={() => table.setPageIndex(pageIndex)}
              className={`${
                table.getState().pagination.pageIndex === pageIndex &&
                "bg-primary text-white"
              } mx-1 flex cursor-pointer items-center justify-center rounded-[3px] p-1.5 px-[15px] hover:bg-primary hover:text-white`}
            >
              {pageIndex + 1}
            </button>
          ))}

          <button
            className="flex cursor-pointer items-center justify-center rounded-[3px] p-[7px] px-[7px] hover:bg-primary hover:text-white disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight width={18} height={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
