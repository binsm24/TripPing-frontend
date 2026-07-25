import './MobileLayout.css';

export default function MobileLayout({ children, background }) {
  return (
    <div className="mobile-layout" style={background ? { background } : undefined}>
      {children}
    </div>
  );
}