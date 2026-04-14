export default function PremiumCard({
  children,
  className = "",
  reveal = false,
  revealDelay = 0,
  as: Tag = "div",
  ...restProps
}) {
  const revealProps = reveal
    ? {
        "data-reveal": true,
        style: { "--reveal-delay": `${revealDelay}ms` },
      }
    : {};

  return (
    <Tag
      {...revealProps}
      {...restProps}
      className={`glass-panel rounded-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 ${className}`}
    >
      {children}
    </Tag>
  );
}
