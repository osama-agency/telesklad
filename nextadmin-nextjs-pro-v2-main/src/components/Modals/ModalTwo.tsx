import React, { useState } from "react";
import { Modal } from "../ui/modal";
import { WarningIcon } from "./icons";

const ModalTwo: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setModalOpen(!modalOpen)}
        className="rounded-[7px] bg-primary px-9 py-3 font-medium text-white"
      >
        Modal 2
      </button>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        className="max-h-fit w-full max-w-[550px] rounded-[15px] bg-white px-8 py-12 text-center shadow-3 dark:bg-gray-dark dark:shadow-card md:px-15 md:py-15"
      >
        <span className="mx-auto flex h-15 w-full max-w-15 items-center justify-center rounded-full bg-[#DC2626] bg-opacity-10 text-[#DC2626]">
          <WarningIcon />
        </span>
        <h3 className="mt-5.5 pb-2 text-xl font-bold text-dark dark:text-white sm:text-2xl">
          Deactivate Your Account
        </h3>
        <p className="mb-10 font-medium">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry Lorem Ipsum been.
        </p>
        <div className="-mx-2.5 flex flex-wrap gap-y-4">
          <div className="w-full px-2.5 2xsm:w-1/2">
            <button
              onClick={() => setModalOpen(false)}
              className="block w-full rounded-[7px] border border-stroke bg-gray-2 p-[11px] text-center font-medium text-dark transition hover:border-gray-3 hover:bg-gray-3 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:hover:border-dark-4 dark:hover:bg-dark-4"
            >
              Cancel
            </button>
          </div>
          <div className="w-full px-3 2xsm:w-1/2">
            <button className="block w-full rounded-[7px] border border-[#DC2626] bg-[#DC2626] p-[11px] text-center font-medium text-white transition hover:bg-opacity-90">
              Deactivate
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ModalTwo;
