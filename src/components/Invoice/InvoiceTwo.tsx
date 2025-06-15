import { DownloadIcon, PdfIcon, PrintIcon } from "@/assets/icons";
import Link from "next/link";

const productList = [
  {
    brand: "Techno",
    description: "Kemon 24 smart phone",
    quantity: 1,
    pricePerUnit: 200,
    total: 200,
  },
  {
    brand: "Vivo",
    description: "Vivo 32 smart phone",
    quantity: 3,
    pricePerUnit: 300,
    total: 900,
  },
  {
    brand: "Samsung",
    description: "S23 Ultra",
    quantity: 1,
    pricePerUnit: 1300,
    total: 1300,
  },
  {
    brand: "Apple",
    description: "iPhone 15Pro Max",
    quantity: 2,
    pricePerUnit: 1200,
    total: 2400,
  },
  {
    brand: "Oppo",
    description: "Fold X",
    quantity: 1,
    pricePerUnit: 900,
    total: 900,
  },
];

const InVoiceTwo = () => {
  return (
    <div>
      <div className="mb-10 flex flex-wrap items-center justify-end gap-3.5">
        <button className="inline-flex items-center gap-2.5 rounded-lg bg-green-light-1 px-4 py-[7px] font-medium text-white hover:bg-opacity-90">
          <PrintIcon />
          Print
        </button>

        <button className="inline-flex items-center gap-2.5 rounded-lg bg-primary px-4 py-[7px] font-medium text-white hover:bg-opacity-90">
          <PdfIcon />
          Save As PDF
        </button>
      </div>

      <div className="flex flex-wrap justify-between gap-5">
        <div>
          <p className="mb-1.5 font-medium text-dark dark:text-white">
            Billing From:
          </p>
          <h4 className="mb-3 text-xl font-bold text-dark dark:text-white">
            Super Technologies
          </h4>
          <Link href="#" className="block">
            <span className="font-medium text-dark dark:text-white">
              Email:{" "}
            </span>
            contact@example.com
          </Link>
          <span className="mt-1.5 block">
            <span className="font-medium text-dark dark:text-white">
              Address:{" "}
            </span>
            2972 Westheimer Rd. Santa Ana.
          </span>
        </div>

        <div>
          <p className="mb-1.5 font-medium text-dark dark:text-white">
            Billing To:
          </p>
          <h4 className="mb-3 text-xl font-bold text-dark dark:text-white">
            Devid wilium
          </h4>
          <Link href="#" className="block">
            <span className="font-medium text-dark dark:text-white">
              Email:{" "}
            </span>
            contact@example.com
          </Link>
          <span className="mt-1.5 block">
            <span className="font-medium text-dark dark:text-white">
              Address:{" "}
            </span>
            New York, USA 2707 Davis Anenue
          </span>
        </div>
      </div>

      <div className="my-7.5 grid grid-cols-1 border border-stroke dark:border-dark-3 xsm:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        <div className="border-b border-r border-stroke px-5 py-4 last:border-r-0 dark:border-dark-3 sm:border-b-0">
          <h5 className="mb-1.5 font-bold text-dark dark:text-white">
            Invoice ID :
          </h5>
          <span className="text-body-sm font-medium"> #STK83084398239 </span>
        </div>

        <div className="border-b border-stroke px-5 py-4 last:border-r-0 dark:border-dark-3 sm:border-b-0 sm:border-r">
          <h5 className="mb-1.5 font-bold text-dark dark:text-white">
            Date Issued :
          </h5>
          <span className="text-body-sm font-medium"> 29, Nov 2027 </span>
        </div>

        <div className="border-b border-r border-stroke px-5 py-4 last:border-r-0 dark:border-dark-3 xsm:border-b-0">
          <h5 className="mb-1.5 font-bold text-dark dark:text-white">
            Due Date :
          </h5>
          <span className="text-body-sm font-medium"> 29, Dec 2027 </span>
        </div>

        <div className="border-r border-stroke px-5 py-4 last:border-r-0 dark:border-dark-3">
          <h5 className="mb-1.5 font-bold text-dark dark:text-white">
            Due Amount :
          </h5>
          <span className="text-body-sm font-medium"> $2,578.90 </span>
        </div>
      </div>

      <div className="grid border border-stroke dark:border-dark-3">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[670px] border-collapse">
            {/* <!-- table header start --> */}
            <thead className="border-b border-stroke dark:border-dark-3">
              <tr className="grid grid-cols-12 py-3.5 pl-5 pr-6">
                <th className="col-span-3 text-left font-medium text-dark dark:text-white">
                  Brand name
                </th>
                <th className="col-span-4 text-left font-medium text-dark dark:text-white">
                  Description
                </th>
                <th className="col-span-2 text-left font-medium text-dark dark:text-white">
                  Quantity
                </th>
                <th className="col-span-2 text-left font-medium text-dark dark:text-white">
                  Price Per Unit
                </th>
                <th className="col-span-1 text-right font-medium text-dark dark:text-white">
                  Total
                </th>
              </tr>
            </thead>
            {/* <!-- table header end --> */}

            <tbody>
              {productList.map((item, index) => (
                <tr
                  key={index}
                  className="grid grid-cols-12 border-b border-stroke py-3.5 pl-5 pr-6 dark:border-dark-3"
                >
                  <td className="col-span-3 font-medium">{item.brand}</td>
                  <td className="col-span-4 font-medium">{item.description}</td>
                  <td className="col-span-2 font-medium">{item.quantity}</td>
                  <td className="col-span-2 font-medium">
                    ${item.pricePerUnit}
                  </td>
                  <td className="col-span-1 text-right font-medium">
                    ${item.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* <!-- total price start --> */}
        <div className="flex justify-end p-6">
          <div className="w-full max-w-65">
            <div className="flex flex-col gap-4">
              <p className="flex justify-between font-medium text-dark dark:text-white">
                <span>Subtotal</span>
                <span>$4700</span>
              </p>

              <p className="flex justify-between font-medium text-dark dark:text-white">
                <span>Shipping Cost (+)</span>
                <span>$10.00</span>
              </p>

              <p className="flex justify-between font-medium text-dark dark:text-white">
                <span>
                  Coupon Discount
                  <span className="text-green-light-1">(10%)</span>
                </span>
                <span>$470</span>
              </p>

              <p className="flex justify-between font-medium text-dark dark:text-white">
                <span>
                  Vat <span className="text-[#FB5454]">(5%)</span>
                </span>
                <span>$235</span>
              </p>
            </div>

            <p className="mt-4 flex justify-between border-t border-stroke pt-5 dark:border-dark-3">
              <span className="font-medium text-dark dark:text-white">
                Total
              </span>
              <span className="font-bold text-green-light-1">$4475</span>
            </p>

            <button className="float-right mt-10 inline-flex items-center gap-2.5 rounded-lg bg-primary px-7.5 py-2.5 font-medium text-white hover:bg-opacity-90">
              <DownloadIcon />
              Download
            </button>
          </div>
        </div>
        {/* <!-- total price end --> */}
      </div>
    </div>
  );
};

export default InVoiceTwo;
