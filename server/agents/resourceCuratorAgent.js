import { searchGitHub } from "../services/deepSearch.js";

export async function searchHuggingFaceDatasets(query, limit = 5) {
  try {
    const headers = process.env.HF_TOKEN ? { Authorization: `Bearer ${process.env.HF_TOKEN}` } : {};
    const url = `https://huggingface.co/api/datasets?search=${encodeURIComponent(query)}&limit=${limit}`;
    const res = await fetch(url, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).map((d) => ({
      name: d.id || "",
      url: `https://huggingface.co/datasets/${d.id}`,
    }));
  } catch (err) {
    console.error("searchHuggingFaceDatasets failed:", err.message);
    return [];
  }
}

export async function searchKaggleDatasets(query, limit = 5) {
  try {
    if (!process.env.KAGGLE_USERNAME || !process.env.KAGGLE_KEY) return [];
    const auth = Buffer.from(`${process.env.KAGGLE_USERNAME}:${process.env.KAGGLE_KEY}`).toString("base64");
    const url = `https://www.kaggle.com/api/v1/datasets/list?search=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).slice(0, limit).map((d) => ({
      name: d.title || d.ref || "",
      url: `https://www.kaggle.com/datasets/${d.ref}`,
    }));
  } catch (err) {
    console.error("searchKaggleDatasets failed:", err.message);
    return [];
  }
}

export async function runResourceCuratorAgent(techQuery, datasetQuery) {
  const [repos, hfDatasets, kaggleDatasets] = await Promise.all([
    searchGitHub(techQuery, 5),
    searchHuggingFaceDatasets(datasetQuery, 5),
    searchKaggleDatasets(datasetQuery, 5),
  ]);

  return {
    datasets: [...hfDatasets, ...kaggleDatasets],
    repos: repos.map((r) => ({ name: r.name, url: r.url })),
    apis: [],
  };
}
