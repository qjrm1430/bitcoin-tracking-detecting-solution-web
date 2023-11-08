import "./globals.css";
import NavBar from "@/app/navBar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="kr" className="h-full w-full">
      <head>
        <title>BTDS</title>
      </head>
      <body className="h-full w-full flex flex-col">
        <header>
          <NavBar />
        </header>
        <div className="mx-auto flex-grow overflow-hidden w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
