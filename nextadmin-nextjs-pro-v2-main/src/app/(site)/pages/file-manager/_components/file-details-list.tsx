import { DocumentIcon, FolderOpenIcon, GalleryIcon, SoundIcon } from "./icons";

const dataList = [
  {
    icon: <FolderOpenIcon />,
    iconColor: "#3FD97F",
    name: "Design",
    files: "17 files",
    size: "459 MB",
  },
  {
    icon: <GalleryIcon />,
    iconColor: "#0ABEF9",
    name: "Image",
    files: "12 files",
    size: "120 MB",
  },
  {
    icon: <SoundIcon />,
    iconColor: "#8155FF",
    name: "Music",
    files: "39 files",
    size: "374 MB",
  },
  {
    icon: <DocumentIcon />,
    iconColor: "#FF9C55",
    name: "Docs",
    files: "78 files",
    size: "237 MB",
  },
];

const FileDetailsList: React.FC = () => {
  const hexToRgb = (hex: string): string => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `${r}, ${g}, ${b}`;
  };

  return (
    <div className="rounded-[10px] bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card xl:py-4.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {dataList.map((item, index) => (
          <div
            key={index}
            className="flex justify-between border-b border-r border-stroke px-8 py-4.5 last:border-b-0 last:border-r-0 dark:border-dark-3 xl:border-b-0 xl:py-0 [&>*:nth-child(3)]:sm:border-b-0"
          >
            <div className="flex items-center gap-5">
              <div
                className="flex h-15 w-15 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `rgba(${hexToRgb(item.iconColor)}, 0.10)`,
                  color: item.iconColor,
                }}
              >
                {item.icon}
              </div>

              <div>
                <p
                  className="text-lg font-medium"
                  style={{ color: item.iconColor }}
                >
                  {item.name}
                </p>
                <span className="mt-0.5 font-medium">{item.files}</span>
              </div>
            </div>

            <div>
              <p className="mt-1.5 font-medium text-dark dark:text-white">
                {item.size}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileDetailsList;
