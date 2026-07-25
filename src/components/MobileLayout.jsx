import './MobileLayout.css';

export default function MobileLayout({
  children,
  showBack = false,
  onBack,
  rightIcon = null,       // 'home' | 'bookmark' | null
  onRightIconClick,
}) {
  return (
    <div className="mobile-layout">
      {(showBack || rightIcon) && (
        <div className="mobile-layout__topbar">
          {showBack ? (
            <button className="mobile-layout__topbar-btn" onClick={onBack} aria-label="뒤로가기">
              ‹
            </button>
          ) : (
            <span style={{ width: 36 }} />
          )}

          {rightIcon ? (
            <button className="mobile-layout__topbar-btn" onClick={onRightIconClick} aria-label={rightIcon}>
              {rightIcon === 'home' ? '⌂' : '★'}
              {/* 실제 아이콘은 나중에 Figma에서 export한 svg로 교체 */}
            </button>
          ) : (
            <span style={{ width: 36 }} />
          )}
        </div>
      )}

      <div className="mobile-layout__content">
        {children}
      </div>
    </div>
  );
}