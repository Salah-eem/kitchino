import { AdminGuard } from '@/components/AdminGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-dark-bg">
        <div className="max-w-[1600px] mx-auto transition-all">
          {/* Navbar removed from here because it is already in the Root Layout */}
          <div className="p-4 sm:p-8 lg:p-10">
            {children}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
