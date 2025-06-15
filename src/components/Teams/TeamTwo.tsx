import { FacebookIcon, InstagramIcon, XIcon } from "@/assets/icons/social";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const teamItems = [
  {
    image: "/images/team/team-05.png",
    name: "Jackie Sanders",
    position: "CONTENT WRITER",
    subtitle: "Fermentum massa justo sit amet risus morbi leo.",
  },
  {
    image: "/images/team/team-06.png",
    name: "Adveen Desuza",
    position: "Graphics Designer",
    subtitle: "Fermentum massa justo sit amet risus morbi leo.",
  },
  {
    image: "/images/team/team-07.png",
    name: "Adveen Desuza",
    position: "SEO Expert",
    subtitle: "Fermentum massa justo sit amet risus morbi leo.",
  },
  {
    image: "/images/team/team-02.png",
    name: "Adveen Desuza",
    position: "Video Editor",
    subtitle: "Fermentum massa justo sit amet risus morbi leo.",
  },
];

const TeamTwo: React.FC = () => {
  return (
    <div className="mx-auto w-full max-w-[1170px]">
      <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 xl:grid-cols-4">
        {teamItems.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-stroke p-4 dark:border-dark-3 sm:p-6 xl:p-7.5"
          >
            <Image
              src={item.image}
              className="size-20 rounded-[5px] object-cover"
              width={80}
              height={80}
              alt={"Avatar for " + item.name}
              quality={100}
            />

            <div className="mb-7 mt-5.5">
              <h4 className="mb-0.5 text-lg font-bold text-dark dark:text-white">
                {item.name}
              </h4>
              <p className="mb-3 text-body-xs font-medium text-dark-4 dark:text-dark-6">
                {item.position}
              </p>
              <p className="text-body-sm">{item.subtitle}</p>
            </div>

            <div className="flex items-center gap-5.5">
              <Link href="#" className="text-gray-5 hover:text-primary">
                <FacebookIcon width={20} height={20} />
              </Link>

              <Link href="#" className="text-gray-5 hover:text-primary">
                <XIcon width={20} height={20} />
              </Link>

              <Link href="#" className="text-gray-5 hover:text-primary">
                <InstagramIcon />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamTwo;
