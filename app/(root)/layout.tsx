import { Nav } from "@/components/nav";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="h-full w-full flex justify-start items-center flex-col">
      <Nav />
      <div className="max-w-screen-xl w-full p-4">
        <main className="py-12 space-y-8">{children}</main>
      </div>
    </main>
  );
};
export default RootLayout;
