import { cn } from "@/lib/utils";
import { ShowcaseSection } from "../Layouts/showcase-section";

type VideosItemProps = {
  aspectRatio: "21:9" | "16:9" | "4:3" | "1:1";
  videoId: string;
};

const VideosItem = ({ aspectRatio, videoId }: VideosItemProps) => {
  return (
    <ShowcaseSection title={`Responsive Aspect Ratio ${aspectRatio}`}>
      <iframe
        className={cn("w-full", {
          "aspect-square": aspectRatio === "1:1",
          "aspect-[4/3]": aspectRatio === "4:3",
          "aspect-video": aspectRatio === "16:9",
          "aspect-[21/9]": aspectRatio === "21:9",
        })}
        src={"https://www.youtube.com/embed/" + videoId}
        allowFullScreen
      />
    </ShowcaseSection>
  );
};

export default VideosItem;
