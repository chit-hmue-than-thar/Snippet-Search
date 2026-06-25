export default function LoadingMessage({ text = "Loading…" }: { text?: string }) {
  return <p className="state-message">{text}</p>;
}
