import { IconProps } from "@/types/icon-props";

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.2234 4.55806C11.4675 4.31398 11.8632 4.31398 12.1073 4.55806L17.1073 9.55806C17.3514 9.80214 17.3514 10.1979 17.1073 10.4419L12.1073 15.4419C11.8632 15.686 11.4675 15.686 11.2234 15.4419C10.9793 15.1979 10.9793 14.8021 11.2234 14.5581L15.1565 10.625H3.33203C2.98685 10.625 2.70703 10.3452 2.70703 10C2.70703 9.65482 2.98685 9.375 3.33203 9.375H15.1565L11.2234 5.44194C10.9793 5.19786 10.9793 4.80214 11.2234 4.55806Z"
        fill=""
      />
    </svg>
  );
}

export function SlashIcon(props: IconProps) {
  return (
    <svg
      width="6"
      height="15"
      viewBox="0 0 6 15"
      fill="currentColor"
      {...props}
    >
      <path
        d="M5.80682 0.818181L2.05682 14.75H0.255682L4.00568 0.818181H5.80682Z"
        fill="currentColor"
      />
    </svg>
  );
}
