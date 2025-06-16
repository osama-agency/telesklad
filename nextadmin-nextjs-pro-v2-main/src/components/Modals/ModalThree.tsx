import { XIcon } from "@/assets/icons";
import React, { useState } from "react";
import { Modal } from "../ui/modal";
import { CongratulationsIcon } from "./icons";

const ModalThree: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setModalOpen(!modalOpen)}
        className="rounded-[7px] bg-primary px-9 py-3 font-medium text-white"
      >
        Modal 3
      </button>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        className="relative max-h-fit w-full max-w-[550px] rounded-[15px] bg-primary px-8 py-12 text-center md:px-15 md:py-15"
      >
        <span className="mx-auto flex h-19.5 w-full max-w-19.5 items-center justify-center rounded-full bg-white bg-opacity-10">
          <CongratulationsIcon />
        </span>
        <h3 className="mb-3 mt-5.5 text-xl font-black text-white sm:text-[35px] sm:leading-[47px]">
          Congratulations!
        </h3>

        <p className="mb-10 font-medium text-white">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry Lorem Ipsum been.
        </p>
        <a
          href="#"
          className="inline-block rounded-[7px] border border-white px-13 py-[11px] text-center font-medium text-white transition hover:bg-white hover:text-primary"
        >
          Know More
        </a>
        <button
          onClick={() => setModalOpen(false)}
          className="absolute right-6 top-6 flex size-7 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-primary"
        >
          <XIcon />
        </button>
      </Modal>
    </div>
  );
};

export default ModalThree;
