import {
  FacebookIcon,
  LinkedInIcon2,
  XIcon,
  YoutubeIcon,
} from "@/assets/icons/social";
import Link from "next/link";

const ACCOUNTS = [
  {
    platform: "Facebook",
    url: "#",
    Icon: FacebookIcon,
  },
  {
    platform: "X",
    url: "#",
    Icon: XIcon,
  },
  {
    platform: "YouTube",
    url: "#",
    Icon: YoutubeIcon,
  },
  {
    platform: "LinkedIn",
    url: "#",
    Icon: LinkedInIcon2,
  },
];

export function SocialAccounts() {
  return (
    <div className="mt-10">
      <h4 className="mb-5 font-medium text-dark dark:text-white">
        Follow us on
      </h4>
      <div className="flex items-center gap-3.5">
        {ACCOUNTS.map(({ Icon, ...item }) => (
          <Link
            key={item.platform}
            href={item.url}
            className="flex size-10 items-center justify-center rounded-full border border-[#DFE4EA] text-dark-4 hover:border-primary hover:bg-primary hover:text-white dark:border-dark-3 dark:text-dark-6 dark:hover:border-primary dark:hover:text-white"
          >
            <span className="sr-only">View {item.platform} Account</span>

            <Icon />
          </Link>
        ))}
      </div>
    </div>
  );
}
