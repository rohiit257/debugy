import { StickyBanner } from "@/components/ui/sticky-banner";

export function StickyBannerComp() {
  return (
    <div className="relative flex h-auto w-full flex-col overflow-y-auto">
      <StickyBanner className="bg-[#A7EF9E]">
        <p className="mx-0 max-w-[90%] text-black drop-shadow-md">
          Announcement: Please Be Pateint We Are Building.{" "}
          <a href="#" className="transition duration-200 hover:underline">
            Read announcement
          </a>
        </p>
      </StickyBanner>

    </div>
  );
}


