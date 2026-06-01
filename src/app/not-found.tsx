import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">Página no encontrada</p>
        <Link
          href="/dashboard"
          className="inline-block rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
