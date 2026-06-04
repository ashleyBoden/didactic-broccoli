export function calculateScores(data, weights) {

    const { currentPrice, priceChange, total, distanceMiles, deprivationRank } = data

    const affordablityScore = Math.max(0, 10 - (currentPrice / 800000) * 10)
    const trendScore = priceChange > 0 ? 10 : priceChange < 0 ? 0 : 5
    const housePricesScore = (affordablityScore * 0.7) + (trendScore * 0.3)

    const crimeScore = Math.max(0, 10 - (total / 500) * 10)
    const commuteScore = Math.max(0, 10 - (distanceMiles / 50) * 10)
    const deprivationScore = (deprivationRank / 32844) * 10

    const totalWeight = weights.housePrices + weights.crimeRate + weights.commuteTime + weights.deprivation
    const overallScore = (
        (housePricesScore * weights.housePrices) +
        (crimeScore * weights.crimeRate) +
        (commuteScore * weights.commuteTime) +
        (deprivationScore * weights.deprivation)
    ) / totalWeight

    return {
        housePricesScore, 
        crimeScore, 
        deprivationScore,
        commuteScore, 
        overallScore
    }
}