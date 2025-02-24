import "../app/globals.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className="general-container">
      <h1 className="general-title">Tervetuloa Juomaan</h1>
      <p className="general-description">Paras juomapeli markkinoilla.</p>
      <Link href="/play" legacyBehavior>
        <a className="general-button">Pelaa juomapeliä!</a>
      </Link>
    </div>
  );
}
