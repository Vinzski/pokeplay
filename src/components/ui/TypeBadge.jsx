function TypeBadge({ type, size = "small" }) {
    const typeClass = `type-badge type-${type}`
    const sizeClass = size === "large" ? "px-3 py-1 text-sm" : ""
  
    return <span className={`${typeClass} ${sizeClass}`}>{type}</span>
  }
  
  export default TypeBadge
  