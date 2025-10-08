export function calculateBasePrice(from: string, to: string): number {
    if (from === "Paris" && to === "Paris") return 2
    
    else if(from !== "Paris" && to === "Paris") return 0

    else if(from === "Paris" && to !== "Paris") return 10

    return 0
}