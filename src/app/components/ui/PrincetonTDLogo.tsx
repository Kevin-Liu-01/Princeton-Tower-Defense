import Image from "next/image";

export default function PrincetonTDLogo({
  size = "h-12 w-12",
}: {
  size?: string;
}) {
  return (
    <Image
      src="/images/logos/princeton-td-logo.svg"
      alt="Princeton TD"
      width={84}
      height={84}
      className={size}
      style={{
        filter:
          "drop-shadow(0 0 8px rgba(251,191,36,0.35)) drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
      }}
    />
  );
}
