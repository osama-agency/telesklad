'use client'

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
import ColumnFilter from "./ColumnFilter";
import { PointerUp } from "./icons";

const EMPLOYEE_RECORDS = [
  {
    name: "Brielle Kuphal",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1977",
    email: "Brielle45@gmail.com",
    phone: "+323(29)-232-44-74",
    address: "Block A, Demo Park",
    status: "Full-time",
  },
  {
    name: "Barney Murray",
    position: "Developer",
    duration: "3 years",
    birthDate: "25 Nov, 1966",
    email: "Barney@gmail.com",
    phone: "+323(29)-232-75-44",
    address: "Block A, Demo Park",
    status: "Part-time",
  },
  {
    name: "Ressie Ruecker",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1955",
    email: "Ressie@gmail.com",
    phone: "+323(29)-785-44-44",
    address: "Block A, Demo Park",
    status: "Full-time",
  },
  {
    name: "Teresa Mertz",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1979",
    email: "Teresa@gmail.com",
    phone: "+323(29)-232-15-44",
    address: "Block A, Demo Park",
    status: "Part-time",
  },
  {
    name: "Chelsey Hackett",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1969",
    email: "Chelsey@gmail.com",
    phone: "+323(29)-232-56-89",
    address: "Block A, Demo Park",
    status: "Full-time",
  },
  {
    name: "Tatyana Metz",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1989",
    email: "Tatyana@gmail.com",
    phone: "+323(29)-789-42-23",
    address: "Block A, Demo Park",
    status: "Part-time",
  },
  {
    name: "Oleta Harvey",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1979",
    email: "Oleta@gmail.com",
    phone: "+323(29)-852-63-95",
    address: "Block A, Demo Park",
    status: "Full-time",
  },
  {
    name: "Bette Haag",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1979",
    email: "Bette@gmail.com",
    phone: "+323(29)-852-23-01",
    address: "Block A, Demo Park",
    status: "Part-time",
  },
  {
    name: "Meda Ebert",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1945",
    email: "Meda@gmail.com",
    phone: "+323(29)-232-15-23",
    address: "Block A, Demo Park",
    status: "Full-time",
  },
  {
    name: "Elissa Stroman",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 2000",
    email: "Elissa@gmail.com",
    phone: "+323(29)-756-25-63",
    address: "Block A, Demo Park",
    status: "Part-time",
  },
  {
    name: "Sid Swaniawski",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1999",
    email: "Sid@gmail.com",
    phone: "+323(29)-859-52-12",
    address: "Block A, Demo Park",
    status: "Full-time",
  },
  {
    name: "Madonna Hahn",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1965",
    email: "Madonna@gmail.com",
    phone: "+323(29)-896-52-13",
    address: "Block A, Demo Park",
    status: "Part-time",
  },
  {
    name: "Waylon Kihn",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1975",
    email: "Waylon@gmail.com",
    phone: "+323(29)-420-45-65",
    address: "Block A, Demo Park",
    status: "Full-time",
  },
  {
    name: "Jaunita Lindgren",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1945",
    email: "Jaunita@gmail.com",
    phone: "+323(29)-789-45-89",
    address: "Block A, Demo Park",
    status: "Part-time",
  },
  {
    name: "Lenora MacGyver",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1998",
    email: "Lenora@gmail.com",
    phone: "+323(29)-789-12-75",
    address: "Block A, Demo Park",
    status: "Full-time",
  },
  {
    name: "Chelsey Hackett",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1968",
    email: "Chelsey@gmail.com",
    phone: "+323(29)-963-14-52",
    address: "Block A, Demo Park",
    status: "Part-time",
  },
  {
    name: "Tatyana Metz",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1984",
    email: "Tatyana@gmail.com",
    phone: "+323(29)-856-75-12",
    address: "Block A, Demo Park",
    status: "Full-time",
  },
  {
    name: "Oleta Harvey",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1989",
    email: "Oleta@gmail.com",
    phone: "+323(29)-963-15-95",
    address: "Block A, Demo Park",
    status: "Part-time",
  },
  {
    name: "Meda Ebert",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1988",
    email: "Meda@gmail.com",
    phone: "+323(29)-258-62-32",
    address: "Block A, Demo Park",
    status: "Part-time",
  },
  {
    name: "Elissa Stroman",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1998",
    email: "Elissa@gmail.com",
    phone: "+323(29)-856-41-44",
    address: "Block A, Demo Park",
    status: "Full-time",
  },
  {
    name: "Sid Swaniawski",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1997",
    email: "Sid@gmail.com",
    phone: "+323(29)-147-75-56",
    address: "Block A, Demo Park",
    status: "Part-time",
  },
  {
    name: "Madonna Hahn",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1964",
    email: "Madonna@gmail.com",
    phone: "+323(29)-863-25-13",
    address: "Block A, Demo Park",
    status: "Full-time",
  },
  {
    name: "Waylon Kihn",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1945",
    email: "Waylon@gmail.com",
    phone: "+323(29)-896-75-25",
    address: "Block A, Demo Park",
    status: "Part-time",
  },
  {
    name: "Jaunita Lindgren",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1989",
    email: "Jaunita@gmail.com",
    phone: "+323(29)-789-12-45",
    address: "Block A, Demo Park",
    status: "Full-time",
  },
  {
    name: "Lenora MacGyver",
    position: "Designer",
    duration: "3 years",
    birthDate: "25 Nov, 1985",
    email: "Lenora@gmail.com",
    phone: "+323(29)-856-75-12",
    address: "Block A, Demo Park",
    status: "Part-time",
  },
];

// table header
const columns: ColumnDef<(typeof EMPLOYEE_RECORDS)[number]>[] = [
  {
    id: "name",
    header: "Name/Id",
    accessorKey: "name",
    enableColumnFilter: true,
  },
  {
    id: "position",
    header: "Position",
    accessorKey: "position",
    enableColumnFilter: true,
  },
  {
    id: "birthday",
    header: "BDay",
    accessorKey: "birthDate",
    enableColumnFilter: true,
  },
  {
    id: "email",
    header: "Email/Phone",
    accessorKey: "email",
    enableColumnFilter: true,
  },
  {
    id: "address",
    header: "Address",
    accessorKey: "address",
    enableColumnFilter: true,
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    enableColumnFilter: true,
  },
];

const DataTableOne = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: EMPLOYEE_RECORDS,
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
    // Custom filter UI for each column
    meta: {
      filterComponent: (props: any) => <ColumnFilter column={props.column} />,
    },
  });

  return (
    <section className="data-table-common rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      <div className="flex justify-between px-7.5 py-4.5">
        <div className="relative z-20 w-full max-w-[414px]">
          <input
            type="text"
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full rounded-lg border border-stroke bg-transparent px-5 py-2.5 outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
            placeholder="Search here..."
          />

          <button className="absolute right-0 top-0 flex h-11.5 w-11.5 items-center justify-center rounded-r-md bg-primary text-white">
            <SearchIcon className="size-4.5" />
          </button>
        </div>

        <div className="flex items-center font-medium">
          <p className="pl-2 font-medium text-dark dark:text-current">
            Per Page:
          </p>
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
        <table className="datatable-table datatable-one !border-collapse px-4 md:px-8">
          <thead className="border-separate px-4">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                className="border-t border-stroke dark:border-dark-3"
                key={headerGroup.id}
              >
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="whitespace-nowrap">
                    <div>
                      <div
                        className="flex cursor-pointer items-center"
                        onClick={header.column.getToggleSortingHandler()}
                      >
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

                      {header.column.getCanFilter() && (
                        <div>
                          <ColumnFilter
                            column={{
                              filterValue:
                                header.column.getFilterValue() as string,
                              setFilter: header.column.setFilterValue,
                            }}
                          />
                        </div>
                      )}
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
              <tr
                className="border-t border-stroke dark:border-dark-3"
                key={row.id}
              >
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

      <div className="flex justify-between items-center px-7.5 py-7">
        <div className="flex items-center">
          <button
            className="flex items-center justify-center rounded-[3px] p-[7px] hover:bg-primary hover:text-white disabled:pointer-events-none"
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
              } mx-1 flex items-center justify-center rounded-[3px] p-1.5 px-[15px] font-medium hover:bg-primary hover:text-white`}
            >
              {pageIndex + 1}
            </button>
          ))}

          <button
            className="flex items-center justify-center rounded-[3px] p-[7px] hover:bg-primary hover:text-white disabled:pointer-events-none"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight width={18} height={18} />
          </button>
        </div>

        <p className="font-medium">
          Showing {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()} pages
        </p>
      </div>
    </section>
  );
};

export default DataTableOne;
