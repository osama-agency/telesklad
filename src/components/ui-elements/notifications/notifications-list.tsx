import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";

dayjs.extend(relativeTime);

type PropsType = {
  data: {
    active: boolean;
    image: string;
    name: string;
    details: string;
    time: string;
    date: string;
  }[];
};

export function NotificationsList({ data }: PropsType) {
  return (
    <div className="grid grid-cols-1 gap-5">
      {data.map((item, index) => (
        <div
          key={index}
          className={`rounded-[10px] border-l-[5px] bg-white px-4 py-6 shadow-card-9 dark:bg-dark-2 sm:px-5 xl:px-7.5 ${
            item.active ? "border-green-light-1" : "border-red"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex gap-5">
              <div className="relative rounded-full">
                <Image
                  src={item.image}
                  className="rounded-full"
                  width={50}
                  height={50}
                  alt="user"
                  quality={100}
                />

                <span
                  className={`absolute right-0 top-0 size-3 rounded-full ring-2 ring-white ${
                    item.active ? "bg-[#219653]" : "bg-[#FB5454]"
                  }`}
                />
              </div>

              <div className="w-full">
                <h4 className="mb-[3px] text-lg font-bold leading-6 text-dark dark:text-white">
                  {item.name}
                </h4>

                <p className="mb-[3px] font-medium">{item.details}</p>

                <time dateTime={item.time} className="text-body-sm font-medium">
                  {dayjs(item.time).fromNow()}
                </time>
              </div>
            </div>

            <time
              dateTime={item.date}
              className="inline-flex rounded-md bg-gray px-2.5 py-1.5 text-body-sm font-medium dark:bg-dark-3"
            >
              {dayjs(item.date).format("DD, MMM YYYY")}
            </time>
          </div>
        </div>
      ))}
    </div>
  );
}

export function getNotifications() {
  return [
    {
      active: true,
      image: "/images/user/user-03.png",
      name: "Dwayne Bero",
      details: "Project assigned by the manager",
      time: "2025-01-15T10:05:00Z",
      date: "2027-11-24T00:00:00Z",
    },
    {
      active: true,
      image: "/images/user/user-22.png",
      name: "Talan Curtis",
      details: "Approved date for sanction of loan is verified",
      time: "2025-01-15T09:43:00Z",
      date: "2027-11-24T00:00:00Z",
    },
    {
      active: true,
      image: "/images/user/user-21.png",
      name: "Talan Rhiel Madsen",
      details: "Admin and other team accepted your work request",
      time: "2025-01-15T09:53:00Z",
      date: "2027-01-12T00:00:00Z",
    },
    {
      active: false,
      image: "/images/user/user-24.png",
      name: "Charlie Botosh",
      details: "Temporarily your account has been suspended",
      time: "2024-01-15T10:05:00Z",
      date: "2026-12-09T00:00:00Z",
    },
    {
      active: true,
      image: "/images/user/user-25.png",
      name: "Jordyn Torff",
      details: "You have changed your password successfully",
      time: "2024-01-15T10:05:00Z",
      date: "2026-03-30T00:00:00Z",
    },
  ];
}
