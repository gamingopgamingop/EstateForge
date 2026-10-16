const candidates = [
  "photo-1560448075-98fc30d4824c", "photo-1484957366057-33882c2f8b1c",
  "photo-1499191555426-7c9cca324408", "photo-1502920366313-9454924977e5",
  "photo-1509645222473-254a05c908cc", "photo-1510475235324-5a2b25d08a9f",
  "photo-1512757061701-2308dcb32259", "photo-1515263023-431a95d630c9",
  "photo-1518235361785-62d8e3949cb2", "photo-1519389952373-7c9c42f13563",
  "photo-1521401445476-c88b73c8e0bb", "photo-1522771930-7884c3212275",
  "photo-1523217582562-09d0b40b256a", "photo-1527030831425-8ba8c7abd21a",
  "photo-1530965572974-9f0f9f6f8a0c", "photo-1532670843716-6e5c570f0e80",
  "photo-1533097898341-ebf1e33e575c", "photo-1534239303400-45e0be1c764c",
  "photo-1534664781796-d890a5a4c8b1", "photo-1535131749006-b0993c6295c3",
  "photo-1536342944681-10f01bfb8d1a", "photo-1536832589502-c2b6ddffbf42",
  "photo-1537953773744-c90048d75553", "photo-1538465157161-32d9b1d0c792",
  "photo-1541877640763-d6b85d5dbf14", "photo-1542314831-068cd1dbfeeb",
  "photo-1543720471-854c9496fbcb", "photo-1545168831-12165ba088d5",
  "photo-1546015592-c0f72b45bbed", "photo-1547036933-113e5f71c25a",
  "photo-1548902447-3d8a3b14856f", "photo-1549182084-5de32d1e4280",
  "photo-1550525179-0feed4f82fe5", "photo-1551232821-9b0163af2fff",
  "photo-1552433596-835863b0f14d", "photo-155341317-154e1d5186ce",
  "photo-1554456371-9e9d0df7bf0b", "photo-1554703864-2431005879b6",
  "photo-1556910103-026be84db570", "photo-1558213633-a95fae7f4f0e",
  "photo-1559245721-9f5f9451c890", "photo-1560185989-6f3b141b7b8b",
  "photo-1560250097-720f1f1aeb3a", "photo-1560273107-3d62c1de4f0b",
  "photo-1560313308-977edb9ac2d3", "photo-1560447197-33d5b1701cde",
  "photo-1560447410-c253cfb9e0ba", "photo-1560447476-50d3a933ba2d",
  "photo-1560447780-a2138ed314ab", "photo-1560447757-677d12996c2e",
  "photo-1560447995-25cf256339ae", "photo-1560447961-ff57f8fa02d2",
  "photo-1560447975-85feb504e4b7", "photo-1560447996-6f2918af706f",
  "photo-1560447958-1d5f73223979", "photo-1560448079-3f8c98e158d0"
];
const base = "https://images.unsplash.com/";
const qs = "?auto=format&fit=crop&w=1200&q=80";
(async () => {
  const valid = [];
  for (const id of candidates) {
    try { const r = await fetch(base + id + qs, { method: "HEAD" }); if (r.ok) valid.push(id); }
    catch (e) {}
  }
  console.log("VALID_COUNT=" + valid.length);
  console.log(JSON.stringify(valid));
})();
