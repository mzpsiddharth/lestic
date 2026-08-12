import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-lestic flex flex-col items-center py-24 text-center">
      <p className="text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/laptops" className="btn-primary mt-8">
        Browse Laptops
      </Link>
    </div>
  );
}
