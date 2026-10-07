import WikiNav from "@/components/wiki/WikiNav";

export default function WikiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WikiNav />
      {children}
    </>
  );
}
