// Verifies a pool of candidate Unsplash photo IDs and prints the valid ones.
const candidates = [
  // Already used in the project (known good)
  "photo-1555854877-bab0e564b8d5", "photo-1522708323590-d24dbb6b0267",
  "photo-1502672260266-1c1ef2d93688", "photo-1560448204-e02f11c3d0e2",
  "photo-1484154218962-a197022b5858", "photo-1595526114035-0d45ed16cfbf",
  "photo-1505691938895-1758d7feb511", "photo-1586023492125-27b2c045efd7",
  "photo-1522771739844-6a9f6d5f14af", "photo-1502005229762-ee1b2b8004f3",
  "photo-1493809842364-78817add7ffb", "photo-1512917774080-9991f1c4c750",
  "photo-1502672023488-70e25813eb80", "photo-1600585154340-be6161a56a0c",
  "photo-1513694203232-719a280e022f", "photo-1536376072261-38c75010e6c9",
  "photo-1512918728675-ed5a9ecdebfd", "photo-1560185007-cde436f6a4d0",
  "photo-1502005229762-ae1b46642009", "photo-1502005035787-8ff33b6f0018",
  "photo-1598928506311-c55ded91a20c", "photo-1600566753376-12c8ab7fb75b",
  "photo-1540518614846-7ede433c4ef3",
  // Additional interior / apartment / room candidates
  "photo-1560185120-60916b3b748c", "photo-1522771930-7884c3212275",
  "photo-1493246507139-91e8fad9978e", "photo-1600607687939-ce8a6c25118c",
  "photo-1600566753086-00f18fb6b6ea", "photo-1600210492486-724fe5c67fb0",
  "photo-1600121190509-1c7f8f744416", "photo-1584622650111-999a0eb0290b",
  "photo-1600047509807-bb8a6f3b6346", "photo-1502920917128-1aa5d44f80ea",
  "photo-1544923246-77307dd654cb", "photo-1567767292399-5c0a675a2e9b",
  "photo-1493663284031-b7e59ef9b7e7", "photo-1554995207-c19c1549daa2",
  "photo-1560185009-5cc9e5b058d2", "photo-1616594039932-24d037886d33",
  "photo-1615529182904-148127458007", "photo-1631603391154-10a1535ff7cf",
  "photo-1631049307264-da08051be262", "photo-1521782460945-8d310f4e2bb8",
  "photo-1533090161767-e6ffed986c88", "photo-1560314541-eeeda1a41c88",
  "photo-1505693416388-ac5ce068fe85", "photo-1526628953300-037f1854d01e",
  "photo-1616486029423-aaa4789e8c9a", "photo-1583394838336-acd977736f90",
  "photo-1567709080503-ce20f0b08db0", "photo-1556912167-f556f1f39fdf",
  "photo-1600585152220-16b6cd13ffb4", "photo-1598918901700-8bef69f8f4f3",
  "photo-1615873296231-a308ca1d060a", "photo-1600607687644-c7126b5c8f96",
  "photo-1616137315604-290640339861", "photo-1633458808188-719958f9f54e",
  "photo-160021049136e-576e333a5f06", "photo-1595435045844-045a6a7d7772",
  "photo-1560447796-5f10c9744a4d", "photo-1556911220-bff31c812dba",
  "photo-1574359462985-c385911bb891", "photo-1600566752355-35792bedcfea",
  "photo-1560184897-ae75f418493e", "photo-1585079161627-4281b1c9b987",
  "photo-1556020653-fae6fb44c279", "photo-1600607687920-4e2a09cf1e5d",
  "photo-1618221195710-dd6b41faaea6", "photo-1616486393439-8c1e2f2a0b0d",
  "photo-1620625471860-756c6d84947f", "photo-1633621534372-5f7a6e2b1f5c",
  "photo-1635935209342-bee26f4a5736", "photo-1637932164943-ddbbbb721bde",
  "photo-1639188384325-9d3e5e579277", "photo-1641092119327-f61b8d449fa4",
  "photo-1641092895481-12b8f1f39a2d", "photo-1642827316746-7e4bb2f1c40d"
];

const base = "https://images.unsplash.com/";
const qs = "?auto=format&fit=crop&w=1200&q=80";

(async () => {
  const valid = [];
  const invalid = [];
  for (const id of candidates) {
    try {
      const r = await fetch(base + id + qs, { method: "HEAD" });
      if (r.ok) valid.push(id); else invalid.push(id + " [" + r.status + "]");
    } catch (e) {
      invalid.push(id + " [ERR]");
    }
  }
  console.log("VALID_COUNT=" + valid.length);
  console.log(JSON.stringify(valid, null, 2));
  console.log("INVALID:");
  console.log(JSON.stringify(invalid, null, 2));
})();
