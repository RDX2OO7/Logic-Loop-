import { embedTexts, cosineSimilarity } from "../agents/clusteringAgent.js";

/**
 * Filter deepSearch results based on cosine similarity to the normalized query vector.
 * @param {Object} deepSearchResult - { papers: [], repos: [], web: [] }
 * @param {string} query - normalized problem string
 * @param {number} cutoff - similarity threshold (default 0.35)
 * @param {Function} embedFn - embedding function (defaults to embedTexts)
 * @returns {Promise<Object>} filtered deepSearchResult with metadata (_kept_count, _dropped_count, _debug_scores)
 */
export async function filterRelevantSources(
  deepSearchResult,
  query,
  cutoff = 0.35,
  embedFn = embedTexts
) {
  const papers = deepSearchResult?.papers || [];
  const repos = deepSearchResult?.repos || [];
  const web = deepSearchResult?.web || [];

  const items = [];
  for (const p of papers) {
    items.push({
      category: "papers",
      item: p,
      text: `${p.title || ""}. ${p.snippet || ""}`.trim(),
    });
  }
  for (const r of repos) {
    items.push({
      category: "repos",
      item: r,
      text: `${r.name || r.title || ""}. ${r.description || r.snippet || ""}`.trim(),
    });
  }
  for (const w of web) {
    items.push({
      category: "web",
      item: w,
      text: `${w.title || ""}. ${w.snippet || ""}`.trim(),
    });
  }

  if (items.length === 0) {
    return {
      papers: [],
      repos: [],
      web: [],
      _kept_count: 0,
      _dropped_count: 0,
      _debug_scores: [],
    };
  }

  // Batch embed query and all items
  const textsToEmbed = [query, ...items.map((i) => i.text)];
  const vectors = await embedFn(textsToEmbed);

  const queryVector = vectors[0];
  const itemVectors = vectors.slice(1);

  const keptPapers = [];
  const keptRepos = [];
  const keptWeb = [];
  const debugScores = [];

  let keptCount = 0;
  let droppedCount = 0;

  for (let i = 0; i < items.length; i++) {
    const itemObj = items[i];
    const vector = itemVectors[i];
    const score = cosineSimilarity(queryVector, vector);
    const title = itemObj.item.title || itemObj.item.name || itemObj.item.id;
    const kept = score >= cutoff;

    debugScores.push({
      id: itemObj.item.id,
      title,
      category: itemObj.category,
      score: parseFloat(score.toFixed(4)),
      kept,
    });

    if (kept) {
      keptCount++;
      if (itemObj.category === "papers") keptPapers.push(itemObj.item);
      else if (itemObj.category === "repos") keptRepos.push(itemObj.item);
      else if (itemObj.category === "web") keptWeb.push(itemObj.item);
    } else {
      droppedCount++;
    }
  }

  return {
    papers: keptPapers,
    repos: keptRepos,
    web: keptWeb,
    _kept_count: keptCount,
    _dropped_count: droppedCount,
    _debug_scores: debugScores,
  };
}
