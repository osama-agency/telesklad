import { UploadIcon } from "@/assets/icons";
import Dropzone from "dropzone";
import { useEffect } from "react";

const FileDropZone = () => {
  useEffect(() => {
    let myDropzone = new Dropzone("#demo-upload", { url: "/file/post" });

    return () => {
      (myDropzone as any).destroy();
    };
  }, []);

  return (
    <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <div className="border-b border-stroke px-6.5 py-4 dark:border-dark-3">
        <h3 className="font-medium text-dark dark:text-white">
          File Drop Zone
        </h3>
      </div>
      <div className="p-6.5">
        <form
          className="dropzone dark:!border-strokedark rounded-md !border-dashed !border-[#DEE4EE] bg-gray hover:!border-primary dark:bg-dark-2 dark:hover:!border-primary"
          id="demo-upload"
          action="/upload"
        >
          <div className="dz-message">
            <div className="mb-2.5 flex justify-center">
              <div className="flex h-15 w-15 items-center justify-center rounded-full bg-white text-dark shadow-card-8 dark:bg-dark dark:text-white">
                <UploadIcon />
              </div>
            </div>
            <span className="font-medium text-dark dark:text-white">
              Drop files here to upload
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileDropZone;
