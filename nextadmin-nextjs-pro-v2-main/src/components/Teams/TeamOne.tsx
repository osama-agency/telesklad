import Image from "next/image";
import React from "react";
import { Blob, Shapes } from "./icons";

const teamItems = [
  {
    image: "/images/team/team-04.png",
    name: "Coriss Ambady",
    position: "Web Developer",
  },
  {
    image: "/images/team/team-02.png",
    name: "John Doe",
    position: "App Developer",
  },
  {
    image: "/images/team/team-03.png",
    name: "Brett Lee",
    position: "Ui/Ux Designer",
  },
  {
    image: "/images/team/team-04.png",
    name: "Nikolas Jackson",
    position: "Sales Manager",
  },
];

const TeamOne: React.FC = () => {
  return (
    <div className="mx-auto w-full max-w-[1170px]">
      <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 xl:grid-cols-4">
        {teamItems.map((item, index) => (
          <div key={index} className="relative overflow-hidden rounded-lg">
            <Image
              width={270}
              height={330}
              className="w-full"
              src={item.image}
              alt="team"
            />

            <div className="absolute bottom-4.5 left-0 w-full text-center">
              <div className="relative mx-5 overflow-hidden rounded-lg bg-white px-3 py-5 dark:bg-dark-2">
                <h3 className="font-medium text-dark dark:text-white">
                  {item.name}
                </h3>
                <p className="text-body-xs font-medium">{item.position}</p>
                <div>
                  <Blob className="absolute bottom-0 left-0" />

                  <Shapes className="absolute right-0 top-0" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamOne;
