import { cn } from "../lib/utils";
import { Marquee } from "./ShadcnComponents/Maquee";

const reviews = [
  {
    id:1,
    img: "https://res.cloudinary.com/drwd1wtvt/image/upload/c_thumb,w_200,g_face/v1748025504/Cairo-logo-hero-shadow-opt_jpkxld.webp",
  },
  {
    id:2,
    img: "https://res.cloudinary.com/drwd1wtvt/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1748025708/dojo-icon_c2iqdt.svg",
  },
  {
    id:3,
    img: "https://res.cloudinary.com/drwd1wtvt/image/upload/c_thumb,w_200,g_face/v1748028110/HeaderLogo_arzbbc.svg",
  },
  {
    id:4,
    img: "https://res.cloudinary.com/drwd1wtvt/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1748028415/unnamed_ie9aoo.webp",
  },
  {
    id:5,
    img: "https://res.cloudinary.com/drwd1wtvt/image/upload/c_thumb,w_200,g_face/v1748028551/6628c6affa7388979c78b26a_placeholder_ip0ouv.jpg",
  },
  {
    id:6,
    img: "https://res.cloudinary.com/drwd1wtvt/image/upload/c_thumb,w_200,g_face/v1748028726/eth_lfg8io.svg",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  
}: {
  img: string;
  
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-auto cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="w-auto h-16" width="64" height="64" alt="" src={img} />
        </div>
          
    </figure>
  );
};

export function MarqueeDemo() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden"
    style={{
        
        WebkitMaskImage:
        'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        maskImage:
        'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
    }}>
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.id} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map((review) => (
          <ReviewCard key={review.id} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
    </div>
  );
}
