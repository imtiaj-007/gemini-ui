export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-center md:justify-end h-screen bg-[url('/block-bg.jpg')] bg-no-repeat bg-cover bg-center">
            {children}
        </div>
    );
}