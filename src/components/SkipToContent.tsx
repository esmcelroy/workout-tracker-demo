/**
 * SkipToContent Component
 * Provides keyboard users with a way to skip directly to main content
 * Visible on focus (keyboard tab), hidden from screen view
 */
export function SkipToContent() {
  const handleClick = () => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2"
    >
      Skip to main content
    </a>
  );
}
