import Link from "next/link";

export default function Header() {
  return (
    <header className="header">
      <Link href="/" className="logo">
        Snippet Search
      </Link>
      <nav>
        <Link href="/">Search</Link>
        <Link href="/snippets/new">New snippet</Link>
      </nav>
    </header>
  );
}
