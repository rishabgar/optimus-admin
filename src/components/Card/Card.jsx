import styles from "./Card.module.css";

function Card({ children, background, className = "", style, ...props }) {
  const cardStyle = {
    ...style,
    ...(background ? { background } : {}),
  };

  return (
    <div
      className={`${styles.card} ${className}`.trim()}
      style={cardStyle}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
