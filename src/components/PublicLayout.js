import Navbar from './Navbar';
import Footer from './Footer';

export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-dark-200">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

// Helper so pages can do: Page.getLayout = withPublicLayout
export const withPublicLayout = (page) => <PublicLayout>{page}</PublicLayout>;
