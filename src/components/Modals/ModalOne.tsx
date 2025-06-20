import React, { useState } from "react";
import { Modal } from "../ui/modal";

const ModalOne: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setModalOpen(!modalOpen)}
        className="rounded-[7px] bg-gradient-primary px-9 py-3 font-medium text-white hover:bg-gradient-primary-hover"
      >
        Modal 1
      </button>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        className="max-h-fit w-full max-w-[550px] rounded-[15px] bg-white px-8 py-12 text-center shadow-3 dark:bg-gray-dark dark:shadow-card md:px-15 md:py-15"
      >
        <h3 className="pb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl">
          Your Message Sent Successfully
        </h3>
        <span className="mx-auto mb-5.5 inline-block h-[3px] w-22.5 rounded-[2px] bg-primary"></span>
        <p className="mb-10 font-medium">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry&apos;s standard dummy text
          ever since
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
                            <button className="block w-full rounded-[7px] border border-primary bg-gradient-primary p-[11px] text-center font-medium text-white transition hover:bg-gradient-primary-hover">
              View Details
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ModalOne;
