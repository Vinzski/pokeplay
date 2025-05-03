// Extract Pokémon ID from a URL
export const extractIdFromUrl = (url) => {
    if (!url) return null
  
    // URLs are typically in the format: https://pokeapi.co/api/v2/pokemon/1/
    const matches = url.match(/\/pokemon\/(\d+)\/?$/)
  
    if (matches && matches[1]) {
      return Number.parseInt(matches[1])
    }
  
    return null
  }
  
  // Format number with leading zeros
  export const formatId = (id, length = 3) => {
    return id.toString().padStart(length, "0")
  }
  
  // Capitalize first letter of a string
  export const capitalize = (str) => {
    if (!str) return ""
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
  
  // Format stat name for display
  export const formatStatName = (name) => {
    return name
      .replace("special-attack", "Sp. Atk")
      .replace("special-defense", "Sp. Def")
      .split("-")
      .map(capitalize)
      .join(" ")
  }
  
  // Get color based on stat value (0-255)
  export const getStatColor = (value) => {
    if (value < 50) return "bg-red-500"
    if (value < 80) return "bg-orange-500"
    if (value < 110) return "bg-yellow-500"
    if (value < 140) return "bg-green-500"
    return "bg-blue-500"
  }
  
  // Delay function for animations
  export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  
  // Format date to readable string
  export const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }
  