import { PageLoader } from "@/components/Spinner";

export default function Loading() {
  return (
    <div className="bg-[#f3f4f0]">
      <PageLoader label="Loading the dashboard" full />
    </div>
  );
}
