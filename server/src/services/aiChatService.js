const { OpenAI } = require('openai');
const { getDatasetSummary, getFilteredSamples } = require('./datasetService');

/**
 * AquaBot AI Environmental Science Assistant Service
 *
 * Implements conversational intelligence using the official OpenAI SDK
 * backed by live platform dataset metrics and authoritative environmental science data.
 */

// Initialize OpenAI client if key is present
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_openai_api_key_here') {
    return null;
  }
  return new OpenAI({ apiKey: apiKey.trim() });
}

/**
 * Builds live operational context from the dataset
 */
function buildLivePlatformContext() {
  const summary = getDatasetSummary();
  return {
    systemName: 'AquaIndex - Heavy Metal Pollution Index Assessment & Water Surveillance',
    totalSamples: summary.totalSamples,
    districtsMonitored: summary.districts,
    statesMonitored: summary.states,
    averageHpi: summary.averageHpi,
    averageHei: summary.averageHei,
    classificationBreakdown: summary.classificationCounts,
    waterSourceBreakdown: summary.waterSourceBreakdown,
    monitoredMetals: summary.availableMetals.map((m) => ({
      symbol: m.symbol,
      name: m.name,
      whoLimitMgL: m.whoLimitMgL,
      bisLimitMgL: m.bisLimitMgL,
      meanConcentrationMgL: m.meanConcentrationMgL,
      exceedanceRatePercent: `${m.exceedanceRatePercent}%`,
    })),
    hpiMethodology: 'Prasad & Bose (2001) / Mohan et al. (1996): HPI = Σ(Wi * Qi) / ΣWi. Low (<50), Medium (50-100), High (>100).',
    heiMethodology: 'Edet & Offiong (2002): HEI = Σ(Ci / MACi). Low (<10), Medium (10-20), High (>20).',
    regulatoryDisclaimer:
      'Screening surveillance only. Synthetic demonstration dataset. Water safety cannot be declared solely from AI prediction without certified laboratory AAS/ICP-MS testing.',
  };
}

/**
 * Built-in expert knowledge base for reliable fallback when OpenAI API key is unavailable or throttled
 */
function generateBuiltInResponse(userMessage, context) {
  const q = userMessage.toLowerCase().trim();
  const hasWord = (word) => new RegExp(`\\b${word}\\b`, 'i').test(q);

  // 1. Water Treatment & Heavy Metal Removal Technologies (including Boiling Myth)
  if (
    q.includes('treatment') ||
    q.includes('remove') ||
    q.includes('removal') ||
    q.includes('filtration') ||
    q.includes('filter') ||
    q.includes('purif') ||
    q.includes('remediat') ||
    q.includes('clean water') ||
    q.includes('how to treat') ||
    q.includes('how to filter') ||
    q.includes('reverse osmosis') ||
    q.includes('boil')
  ) {
    const isBoilingQuery = q.includes('boil');
    const boilingAlert = isBoilingQuery
      ? `> [!WARNING]
> **Does Boiling Water Remove Heavy Metals?**
> **NO!** Boiling water is effective against biological pathogens (bacteria and viruses), but it **CANNOT** destroy or remove heavy metals. In fact, boiling evaporates pure water vapor and **INCREASES** the concentration of toxic heavy metal ions in the remaining liquid!\n\n`
      : '';

    return `### **Water Treatment & Heavy Metal Remediation Technologies**

${boilingAlert}Heavy metals exist as dissolved elemental cations ($Pb^{2+}, Cd^{2+}, Cu^{2+}, Zn^{2+}, Ni^{2+}, Fe^{2+}/Fe^{3+}, Mn^{2+}$) or oxyanions ($Cr_2O_7^{2-}, AsO_4^{3-}$). Because they are elements, they cannot be biologically degraded and must be physically separated or chemically precipitated:

#### **1. Membrane Filtration Technologies**
- **Reverse Osmosis (RO):**
  - High-pressure pumps drive water through a semi-permeable thin-film composite (TFC) membrane (pore size $\\approx 0.0001\\text{ µm}$).
  - Achieves **95% to 99% rejection** across all heavy metal ions ($Pb^{2+}, Cd^{2+}, As^{3+}/As^{5+}, Cr^{6+}, Cu^{2+}$).
- **Nanofiltration (NF):**
  - Operates at lower pressures (50–150 psi) and selectively removes multivalent heavy metal cations while preserving monovalent minerals.

#### **2. Ion Exchange Resins (IX)**
- Synthetic cross-linked polystyrene beads functionalized with sulfonic acid (cation exchange) or quaternary ammonium (anion exchange) groups.
- Exchanging toxic ions ($Pb^{2+}, Cd^{2+}, Cu^{2+}$) for harmless sodium ($Na^+$) or hydrogen ($H^+$) ions.
- Highly regenerable using sodium chloride or acid wash; standard in industrial Effluent Treatment Plants (ETPs).

#### **3. Chemical Precipitation & Coagulation**
- **Hydroxide Precipitation:** Adding hydrated lime ($Ca(OH)_2$) or Sodium Hydroxide ($NaOH$) to elevate $pH$ to 9.0–11.0, precipitating metals as insoluble hydroxides:
  $$M^{2+} + 2\\text{OH}^- \\longrightarrow M(\\text{OH})_2 \\downarrow$$
- **Coagulation-Flocculation:** Alum $[Al_2(SO_4)_3]$ or Polyaluminum Chloride (PAC) destabilizes negative colloidal charges, forming heavy flocs that settle out in clarifiers.

#### **4. Selective Adsorption Media**
- **Activated Alumina & Iron-Coated Sand:** The gold standard for **Arsenic ($As$) and Fluoride ($F^-$)** removal in community filtration units.
- **Granular Activated Carbon (GAC) & Biochar:** High specific surface area ($> 1,000\\text{ m}^2/\\text{g}$) captures organically complexed metals.
- **Zeolites & Graphene Nanomaterials:** Engineered crystalline aluminosilicates with high cation exchange capacity.

#### **5. Biological Phytoremediation**
- Constructed wetlands using hyperaccumulator aquatic plants (*Eichhornia crassipes*, *Vetiveria zizanioides*, *Pteris vittata*) for passive polishing of mine runoff and agricultural drains.`;
  }

  // 2. Can Heavy Metals Be Detected by Physical Senses? (Smell, Taste, Color)
  if (
    q.includes('smell') ||
    q.includes('taste') ||
    q.includes('odor') ||
    q.includes('odour') ||
    q.includes('colour') ||
    q.includes('color') ||
    q.includes('look like') ||
    q.includes('can i smell') ||
    q.includes('can i taste') ||
    q.includes('can you smell') ||
    q.includes('visible') ||
    q.includes('invisible')
  ) {
    return `### **Can You Smell, Taste, or See Heavy Metals in Water?**

> [!CAUTION]
> **Clear water does NOT mean safe water!** The most lethal toxic heavy metals are completely **invisible, odorless, and tasteless** at statutory health-hazard concentrations.

#### **Sensory Reality of Heavy Metals:**
- **Lead ($Pb$), Arsenic ($As$), Cadmium ($Cd$), Mercury ($Hg$), Hexavalent Chromium ($Cr^{6+}$):**
  - **No odor, no color, no discernible taste** at 10 to 100 times their lethal or permissible thresholds.
  - A person can consume fatally high doses of Arsenic or Lead in crystal-clear well water without detecting any anomaly.
- **Metals That DO Produce Physical Signs (Aesthetic Indicators):**
  - **Iron ($Fe$):** Imparts reddish-brown turbidity, leaves rusty stains on laundry and plumbing, and causes a sharp metallic/astringent taste above $0.3\\text{ mg/L}$.
  - **Zinc ($Zn$):** Produces a milky or opalescent appearance and a bitter, chalky metallic aftertaste above $3.0 - 5.0\\text{ mg/L}$.
  - **Copper ($Cu$):** Can impart a bitter taste and produce bluish-green staining on porcelain fixtures above $1.0 - 2.0\\text{ mg/L}$.
  - **Manganese ($Mn$):** Leaves dark brownish-black specks and stains on plumbing at $> 0.1\\text{ mg/L}$.

**Conclusion:** Physical senses cannot protect you from toxic heavy metals. Only certified instrumental laboratory testing (**AAS** or **ICP-MS**) can determine if water is truly safe.`;
  }

  // 3. Medical Antidotes & Chelation Therapy
  if (
    q.includes('chelat') ||
    q.includes('antidote') ||
    q.includes('cure') ||
    q.includes('medical treatment') ||
    q.includes('edta') ||
    q.includes('dmsa') ||
    q.includes('dimercaprol') ||
    q.includes('penicillamine')
  ) {
    return `### **Medical Management: Chelation Therapy for Heavy Metal Poisoning**

When toxic heavy metals enter human systemic circulation, they cannot be broken down by liver metabolism. Medical intervention relies on **Chelation Therapy**:

#### **Mechanism of Action**
- Chelating agents are organic chemical ligands possessing electron-donor atoms (sulfur, nitrogen, oxygen) that bind tenaciously to heavy metal ions, creating stable, non-toxic heterocyclic ring complexes.
- Once bound, the toxic metal is prevented from inhibiting cellular enzymes and is safely excreted through renal filtration (urine) or bile:
  $$\\text{Toxic Metal}^{2+} + \\text{Chelator}^{2-} \\longrightarrow [\\text{Metal-Chelator Complex}]^0 \\; (\\text{Renal Excretion})$$

#### **Standard Clinical Chelating Agents**
1. **Calcium Disodium EDTA ($CaNa_2EDTA$):**
   - Primary clinical agent for acute and severe **Lead ($Pb$)** encephalopathy and lead toxicity.
2. **Dimercaptosuccinic Acid (DMSA / Succimer):**
   - Water-soluble oral chelator utilized for **Lead, inorganic Mercury, and Arsenic** poisoning with reduced adverse side effects.
3. **Dimercaprol (BAL - British Anti-Lewisite):**
   - Injectable dithiol chelator formulated for acute **Arsenic, Gold, and severe Mercury** toxicity.
4. **D-Penicillamine:**
   - Orally administered chelator designed for copper overload in **Wilson's disease** and chronic Lead intoxication.

> *Note: Chelation therapy carries serious clinical risks (such as depletion of essential trace minerals like Zinc and Calcium) and must only be conducted by licensed medical toxicologists under hospital supervision.*`;
  }

  // 4. Health Hazards, Diseases & Toxicology
  if (
    q.includes('disease') ||
    q.includes('health') ||
    q.includes('toxic') ||
    q.includes('hazard') ||
    q.includes('danger') ||
    q.includes('cancer') ||
    q.includes('carcinogen') ||
    q.includes('symptom') ||
    q.includes('poison') ||
    q.includes('syndrome') ||
    q.includes('itai-itai') ||
    q.includes('itai itai') ||
    q.includes('blackfoot') ||
    q.includes('minamata') ||
    q.includes('manganism') ||
    q.includes('wilson')
  ) {
    return `### **Health Hazards & Diseases Linked to Heavy Metal Contamination**

Heavy metals are non-biodegradable cumulative poisons that bind to biological sulfhydryl ($-SH$) groups in cellular proteins, deactivate crucial enzymes, and generate reactive oxygen species (ROS).

#### **Major Diseases & Target Organs**
| Heavy Metal | Target Organs | Specific Clinical Pathology / Disease |
| :--- | :--- | :--- |
| **Arsenic ($As$)** | Skin, Lungs, Bladder, Vascular | **Blackfoot Disease** (peripheral gangrene), hyperkeratosis, dermal pigmentation, Class 1 carcinogen |
| **Cadmium ($Cd$)** | Kidneys, Skeleton, Lungs | **Itai-Itai Disease** (severe osteomalacia & bone fractures), irreversible renal tubular proteinuria |
| **Lead ($Pb$)** | Central Nervous System, Bone Marrow | Encephalopathy, irreversible pediatric IQ loss, behavioral disorders, microcytic anemia, hypertension |
| **Mercury ($Hg$)** | Brain, Spinal Cord, Kidneys | **Minamata Syndrome** (ataxia, speech impairment, sensory constriction), profound fetal neurodevelopmental defects |
| **Chromium ($Cr^{6+}$)** | Lungs, Respiratory Tract, Skin | Bronchogenic carcinoma, deep gastrointestinal ulcers, severe contact allergic dermatitis |
| **Copper ($Cu$)** | Liver, Brain, Cornea | **Wilson's Disease** (hepatic cirrhosis, Kayser-Fleischer rings), acute gastrointestinal necrosis |
| **Nickel ($Ni$)** | Skin, Nasal Cavity, Lungs | Systemic allergic contact dermatitis ("nickel itch"), occupational respiratory tumors |
| **Manganese ($Mn$)** | Basal Ganglia, Motor System | **Manganism** (progressive Parkinson's-like tremors, rigidity, masking facies, neurological deficits) |

> *Crucial Precaution: Screening indices (HPI/HEI) assist in rapid environmental triage. Certified laboratory spectrometry (AAS/ICP-MS) is mandatory before declaring water potable.*`;
  }

  // 5. Bioaccumulation & Biomagnification in Aquatic Life & Food Chain
  if (
    q.includes('bioaccumulat') ||
    q.includes('biomagnif') ||
    q.includes('food chain') ||
    q.includes('trophic') ||
    q.includes('fish') ||
    q.includes('aquatic life') ||
    q.includes('marine') ||
    q.includes('ecosystem')
  ) {
    return `### **Bioaccumulation & Biomagnification of Heavy Metals**

Because heavy metals are elemental substances, biological organisms cannot degrade, metabolize, or decompose them:

#### **1. Bioaccumulation (Organism Level)**
- Occurs when the intake rate of a metal by an organism (via direct absorption through gills, skin, or roots) exceeds its biological excretion rate.
- Metals bind tightly to metallothionein proteins and accumulate in fatty tissue, liver, and bones.

#### **2. Biomagnification (Trophic Level Transfer)**
- As organisms consume contaminated prey, heavy metal concentrations increase exponentially up the ecological food chain:
  $$\\text{Water Body (Low, ppb)} \\longrightarrow \\text{Phytoplankton} \\longrightarrow \\text{Zooplankton} \\longrightarrow \\text{Small Fish} \\longrightarrow \\text{Apex Predatory Fish} \\longrightarrow \\text{Humans (High, ppm)}$$
- **Classic Example:** Organic methylmercury ($CH_3Hg^+$) biomagnification in predatory marine species (swordfish, tuna, shark) can reach concentrations **$100,000\\times$ higher** than ambient seawater, creating severe neurotoxic risks for pregnant women and developing fetuses.`;
  }

  // 6. Sources & Environmental Causes of Pollution (Mining, Industry, Effluents)
  if (
    q.includes('cause') ||
    q.includes('source') ||
    q.includes('origin') ||
    q.includes('why is water polluted') ||
    q.includes('how does heavy metal get into water') ||
    q.includes('industrial') ||
    q.includes('mining') ||
    q.includes('acid mine drainage') ||
    q.includes('effluent') ||
    q.includes('sewage') ||
    q.includes('factory') ||
    q.includes('factories') ||
    q.includes('smelting') ||
    q.includes('tannery') ||
    q.includes('fertilizer')
  ) {
    return `### **Sources & Pathways of Heavy Metal Contamination in Water**

Heavy metals enter water resources through four primary anthropogenic and geogenic pathways:

#### **1. Industrial Effluents & Manufacturing**
- **Electroplating & Surface Finishing:** Discharges high concentrations of Chromium ($Cr$), Nickel ($Ni$), Cadmium ($Cd$), Zinc ($Zn$), and Copper ($Cu$).
- **Chemical & Battery Manufacturing:** Lead-acid and nickel-cadmium battery recycling facilities produce localized $Pb$ and $Cd$ contamination.
- **Tanneries & Textile Finishing:** Hexavalent Chromium ($Cr^{6+}$) salts used for tanning leather, alongside chemical dyes containing trace metals.

#### **2. Mining & Acid Mine Drainage (AMD)**
- Extraction of coal, iron, gold, and base metal ores exposes mineral iron sulfide (Pyrite, $FeS_2$) to atmospheric oxygen and water:
  $$4\\text{FeS}_2 + 15\\text{O}_2 + 14\\text{H}_2\\text{O} \\longrightarrow 4\\text{Fe(OH)}_3 \\downarrow + 8\\text{H}_2\\text{SO}_4$$
- The resulting sulfuric acid ($pH < 3.5$) dissolves surrounding bedrock, leaching catastrophic concentrations of $Fe, Mn, Pb, Al, Cd,$ and $As$ into rivers and groundwater aquifers.

#### **3. Agricultural Runoff**
- **Phosphate Fertilizers:** Rock phosphate naturally contains substantial impurities of toxic **Cadmium ($Cd$)**, which leaches into shallow water tables after repeated seasonal application.
- **Pesticides & Fungicides:** Copper oxychloride and historical arsenical sprays leave persistent soil residues.

#### **4. Geogenic (Natural) Geological Leaching**
- Deep groundwater aquifers in sedimentary floodplains (such as the Ganga-Brahmaputra basin) naturally dissolve arsenic-bearing minerals under reducing geochemical conditions.

#### **5. Urban Runoff & Aging Plumbing Infrastructure**
- Historic lead service lines, brass fixtures, galvanized water mains, and electronic waste (e-waste) disposed in unlined municipal landfills.`;
  }

  // 7. Laboratory Detection & Analytical Testing Methods
  if (
    q.includes('test') ||
    q.includes('testing') ||
    q.includes('detect') ||
    q.includes('measur') ||
    q.includes('analyze') ||
    q.includes('analysis') ||
    q.includes('laboratory') ||
    q.includes('lab') ||
    q.includes('aas') ||
    q.includes('icp-ms') ||
    q.includes('icpms') ||
    q.includes('spectrometry') ||
    q.includes('spectroscopy') ||
    q.includes('voltammetry')
  ) {
    return `### **Laboratory Detection & Analytical Methods for Heavy Metals**

Quantifying trace heavy metals down to statutory parts-per-billion (ppb / µg/L) levels requires specialized analytical instrumentation:

#### **1. Atomic Absorption Spectroscopy (AAS)**
- **Flame AAS (FAAS):** Samples are aspirated into an acetylene-air or nitrous oxide flame ($2,300–3,000^\\circ\\text{C}$) to atomize metals. Detection limit: $0.01 - 0.1\\text{ mg/L}$ (ppm level).
- **Graphite Furnace AAS (GFAAS):** Uses electrothermal graphite tube heating; reaches ultra-trace detection limits down to **$0.1 - 1.0\\text{ µg/L}$ (ppb)** for Lead, Cadmium, and Arsenic.

#### **2. Inductively Coupled Plasma Mass Spectrometry (ICP-MS)**
- **Gold Standard in Environmental Chemistry:** Uses argon plasma at $6,000–10,000\\text{ K}$ to ionize metals and a mass spectrometer to separate isotopic masses.
- Capable of simultaneously quantifying **all 9 heavy metals** in under 2 minutes down to **parts per trillion (ppt / ng/L)** sensitivity.

#### **3. Anodic Stripping Voltammetry (ASV)**
- Electrochemical field sensor technique depositing metal ions onto a working electrode during a cathodic pre-concentration step, then stripping them anodically. Excellent for portable field screening.

#### **4. Colorimetric Field Test Kits**
- Reagent test strips or handheld photometers producing characteristic dye complexes (e.g., Rhodizonate for Lead, Gutzeit reaction for Arsenic). Useful for rapid field screening prior to certified laboratory ICP-MS verification.`;
  }

  // 8. Water Quality Standards (WHO vs BIS IS 10500:2012)
  if (
    q.includes('standard') ||
    q.includes('standards') ||
    q.includes('who vs bis') ||
    q.includes('who limit') ||
    q.includes('bis limit') ||
    q.includes('permissible limit') ||
    q.includes('allowable limit') ||
    q.includes('drinking water standard') ||
    q.includes('guideline value') ||
    q.includes('threshold limit')
  ) {
    return `### **Heavy Metal Water Quality Standards (WHO vs BIS IS 10500:2012)**

| Heavy Metal | Symbol | WHO Guideline (mg/L) | BIS Permissible Limit (mg/L) | Primary Health Hazard |
| :--- | :--- | :--- | :--- | :--- |
| **Lead** | $Pb$ | \`0.01\` | \`0.01\` | Neurotoxic, renal impairment |
| **Cadmium** | $Cd$ | \`0.003\` | \`0.003\` | Bone demineralization (Itai-Itai), kidney damage |
| **Arsenic** | $As$ | \`0.01\` | \`0.01\` | Carcinogenic, vascular disease |
| **Chromium** | $Cr$ | \`0.05\` | \`0.05\` | Carcinogenic (Cr-VI), dermatitis |
| **Copper** | $Cu$ | \`2.0\` | \`0.05\` (up to 1.5) | Gastrointestinal distress, liver toxicity |
| **Zinc** | $Zn$ | \`3.0\` | \`5.0\` (up to 15.0) | Astringent taste, gastrointestinal irritation |
| **Nickel** | $Ni$ | \`0.07\` | \`0.02\` | Allergic contact dermatitis, renal stress |
| **Iron** | $Fe$ | \`0.3\` | \`0.3\` (up to 1.0) | Turbidity, metallic taste, pipe incrustation |
| **Mercury** | $Hg$ | \`0.001\` | \`0.001\` | Central nervous system toxicity (Minamata) |
| **Manganese**| $Mn$ | \`0.4\` | \`0.1\` (up to 0.3) | Neurotoxicity, Manganism, black staining |

*Units: mg/L (milligrams per liter / parts per million).*`;
  }

  // 9. Physicochemical Parameters: pH, TDS, Turbidity
  if (
    hasWord('ph') ||
    q.includes('acidity') ||
    q.includes('alkalin') ||
    hasWord('tds') ||
    q.includes('dissolved solid') ||
    q.includes('turbidity') ||
    hasWord('ntu') ||
    q.includes('conductivity')
  ) {
    return `### **Physicochemical Parameters in Heavy Metal Surveillance**

Physicochemical factors strongly control the chemical speciation, solubility, and bio-toxicity of heavy metals:

#### **1. Water pH (Potential of Hydrogen)**
- **Standard Drinking Water Range:** $6.5 - 8.5$ (WHO & BIS IS 10500:2012).
- **Environmental Impact:**
  - **Low pH (Acidic, $pH < 6.5$):** Drastically increases the solubility and chemical mobility of toxic heavy metal cations ($Pb^{2+}, Cd^{2+}, Cu^{2+}, Zn^{2+}$). Acidic water also accelerates plumbing pipe corrosion.
  - **High pH (Alkaline, $pH > 8.5$):** Favors precipitation of heavy metals as insoluble carbonates and hydroxides, reducing dissolved water column concentrations.

#### **2. Total Dissolved Solids (TDS)**
- **BIS Acceptable Limit:** \`500 mg/L\` (Permissible limit in absence of alternative: \`2,000 mg/L\`).
- Represents total inorganic salts ($Ca^{2+}, Mg^{2+}, Na^+, K^+, HCO_3^-, Cl^-, SO_4^{2-}$) and dissolved mineral particles. High TDS increases electrical conductivity and may signal industrial or saline contamination.

#### **3. Turbidity**
- **BIS Acceptable Limit:** \`1 NTU\` (Permissible limit up to \`5 NTU\`).
- Measures cloudiness produced by suspended clay, silt, and colloidal particles. High turbidity shelters pathogenic bacteria from disinfection and often carries adsorbed heavy metal particles.`;
  }

  // 10. Groundwater vs Surface Water
  if (
    q.includes('groundwater') ||
    q.includes('borewell') ||
    q.includes('tube well') ||
    q.includes('aquifer') ||
    q.includes('surface water') ||
    q.includes('river') ||
    q.includes('lake') ||
    q.includes('reservoir')
  ) {
    return `### **Groundwater vs Surface Water Contamination Dynamics**

#### **1. Groundwater (Borewells, Tube Wells, Deep Aquifers)**
- **Vulnerability Profile:**
  - High risk of **geogenic natural contamination** (Arsenic, Fluoride, Iron) due to prolonged contact with deep mineral-bearing rock strata under reducing conditions.
  - Vulnerable to agricultural leaching (fertilizer nitrates, Cadmium impurities).
  - Extremely slow self-purification: once an aquifer is contaminated by heavy metals, natural remediation can take **decades or centuries**.

#### **2. Surface Water (Rivers, Lakes, Reservoirs)**
- **Vulnerability Profile:**
  - Direct recipients of municipal sewer outfalls, untreated industrial effluents, and urban stormwater runoff.
  - Higher seasonal variability: monsoon runoff may flush industrial pollutants downstream, while dry summer months cause severe evaporation and contaminant concentration.
  - High dissolved oxygen levels allow certain metals (like Iron and Manganese) to oxidize and precipitate into riverbed sediments.`;
  }

  // 11. Other Critical Groundwater Contaminants: Fluoride, Uranium, Nitrate
  if (
    q.includes('fluoride') ||
    q.includes('fluorosis') ||
    q.includes('uranium') ||
    q.includes('radioactive') ||
    q.includes('nitrate') ||
    q.includes('blue baby') ||
    q.includes('methemoglobinemia')
  ) {
    return `### **Critical Groundwater Contaminants: Fluoride, Uranium & Nitrate**

Beyond trace transition metals, several toxic inorganic contaminants frequently co-occur in groundwater:

#### **1. Fluoride ($F^-$)**
- **WHO Limit:** \`1.5 mg/L\` | **BIS Limit:** \`1.0 mg/L\` (relaxation up to \`1.5 mg/L\`)
- **Health Impact:**
  - Essential in micro-doses ($< 1.0\\text{ mg/L}$) for dental enamel, but excessive intake causes **Dental Fluorosis** (mottling/browning of teeth) and crippling **Skeletal Fluorosis** (calcification of ligaments, joint deformation).
- **Remediation:** Nalgonda technique (alum + lime coagulation), Activated Alumina adsorption, Reverse Osmosis.

#### **2. Uranium ($U$) in Groundwater**
- **WHO Guideline:** \`30 µg/L\` ($0.03\\text{ mg/L}$) | **AERB India Limit:** \`60 µg/L\`
- **Health Impact:**
  - Primarily a chemical nephrotoxin (kidney tubular injury) rather than a radiological hazard at environmental levels.
  - Found naturally in granitic basement aquifers across Punjab, Haryana, Rajasthan, and Andhra Pradesh.
- **Remediation:** Reverse Osmosis, specialized anion exchange resins.

#### **3. Nitrate ($NO_3^-$)**
- **WHO Limit:** \`50 mg/L\` | **BIS Limit:** \`45 mg/L\`
- **Health Impact:**
  - Leached from nitrogenous synthetic fertilizers and septic seepage.
  - Causes infant **Methemoglobinemia ("Blue Baby Syndrome")**, where nitrate oxidizes blood hemoglobin to methemoglobin, depriving vital tissues of oxygen.
- **Remediation:** Ion exchange, biological denitrification, Reverse Osmosis.`;
  }

  // 12. Effluent Treatment Plants (ETP) & Industrial Compliance
  if (
    hasWord('etp') ||
    q.includes('effluent treatment') ||
    hasWord('zld') ||
    q.includes('zero liquid discharge') ||
    hasWord('cpcb') ||
    q.includes('discharge norm') ||
    q.includes('industrial wastewater')
  ) {
    return `### **Industrial Effluent Treatment Plants (ETP) for Heavy Metals**

Industrial facilities discharging wastewater must comply with Central Pollution Control Board (CPCB) and EPA statutory limits:

#### **Standard Multi-Stage ETP Process Train:**
1. **Equalization & pH Adjustment:**
   - Wastewater streams are collected to buffer surges and adjusted with acid or alkali to optimal reaction $pH$.
2. **Chemical Reduction (Specific to Hexavalent Chromium):**
   - Toxic soluble $Cr^{6+}$ is reduced to trivalent $Cr^{3+}$ at $pH \\approx 2.5$ using Sodium Metabisulfite ($SMBS$) or Ferrous Sulfate ($FeSO_4$):
     $$\\text{Cr}_2\\text{O}_7^{2-} + 3\\text{SO}_3^{2-} + 8\\text{H}^+ \\longrightarrow 2\\text{Cr}^{3+} + 3\\text{SO}_4^{2-} + 4\\text{H}_2\\text{O}$$
3. **Hydroxide Precipitation:**
   - Lime or caustic soda raises $pH$ to 9.0–10.5, precipitating heavy metal cations ($Pb^{2+}, Cu^{2+}, Ni^{2+}, Zn^{2+}$) as dense metal hydroxide sludges.
4. **Coagulation & Flocculation:**
   - Alum or Polyaluminum Chloride (PAC) plus anionic polyacrylamide polymers aggregate fine colloidal particles into rapidly settling flocs.
5. **Clarification & Sludge Dewatering:**
   - Lamella clarifiers separate clear supernatant from bottom sludge; filter presses dewater sludge into cake for hazardous waste landfilling (TSDF).
6. **Tertiary Polishing & Zero Liquid Discharge (ZLD):**
   - Dual media sand and carbon filtration followed by multi-pass Reverse Osmosis (RO) and Multiple Effect Evaporators (MEE) to achieve 100% water recovery.`;
  }

  // 13. What is HPI?
  if (
    q.includes('what is hpi') ||
    q.includes('hpi?') ||
    q.includes('heavy metal pollution index') ||
    q.includes('prasad') ||
    q.includes('mohan')
  ) {
    return `### **Heavy Metal Pollution Index (HPI)**

The **Heavy Metal Pollution Index (HPI)** is a rating model that quantifies the overall water quality relative to heavy metal contamination. It was formulated by **Mohan et al. (1996)** and widely established by **Prasad & Bose (2001)**.

#### **Mathematical Formula**
$$\\text{HPI} = \\frac{\\sum_{i=1}^{n} (W_i \\cdot Q_i)}{\\sum_{i=1}^{n} W_i}$$

Where:
- **$W_i$ (Unit Weight):** Inversely proportional to the permissible limit $S_i$:
  $$W_i = \\frac{k}{S_i}, \\quad \\text{where } k = \\frac{1}{\\sum (1/S_i)}$$
- **$Q_i$ (Sub-index Rating):** Degree of quality for metal $i$:
  $$Q_i = \\frac{|M_i - I_i|}{S_i - I_i} \\times 100$$
  - $M_i$: Measured metal concentration in mg/L.
  - $I_i$: Ideal value ($0.0\\text{ mg/L}$ for toxic heavy metals per WHO/BIS).
  - $S_i$: Permissible drinking-water limit.

#### **Classification Scale (Prasad & Bose 2001)**
| HPI Score | Water Quality Category | Regulatory Interpretation |
| :--- | :--- | :--- |
| **HPI < 50** | **Low Pollution** | Excellent / Good potable quality |
| **50 ≤ HPI ≤ 100** | **Medium Pollution** | Threshold reached; requires investigation |
| **HPI > 100** | **High / Critical** | Exceeds critical threshold; treatment required |

In our current dataset of **${context.totalSamples} samples**, the mean HPI is **${context.averageHpi ?? 'N/A'}**.`;
  }

  // 14. Explain HEI
  if (
    q.includes('explain hei') ||
    q.includes('what is hei') ||
    q.includes('hei?') ||
    q.includes('heavy metal evaluation index') ||
    q.includes('edet')
  ) {
    return `### **Heavy Metal Evaluation Index (HEI)**

The **Heavy Metal Evaluation Index (HEI)** assesses the cumulative toxic contamination load of multiple metals, introduced by **Edet & Offiong (2002)**.

#### **Mathematical Formula**
$$\\text{HEI} = \\sum_{i=1}^{n} \\frac{C_i}{\\text{MAC}_i}$$

Where:
- **$C_i$:** Measured analytical concentration of metal $i$ in mg/L.
- **$\\text{MAC}_i$:** Maximum Allowable Concentration (standard permissible threshold) in mg/L.

#### **Classification Thresholds (Edet & Offiong 2002)**
| HEI Score | Pollution Degree | Practical Significance |
| :--- | :--- | :--- |
| **HEI < 10** | **Low Heavy Metal Pollution** | Contaminant levels within safe operational limits |
| **10 ≤ HEI ≤ 20** | **Medium Heavy Metal Pollution** | Borderline zone; increased surveillance required |
| **HEI > 20** | **High Heavy Metal Pollution** | Severe cumulative burden; treatment essential |

In the AquaIndex dataset, the mean HEI across all stations is **${context.averageHei ?? 'N/A'}**.`;
  }

  // 15. How ML Risk Model Works
  if (
    q.includes('ml model') ||
    q.includes('machine learning') ||
    q.includes('how does ml work') ||
    q.includes('risk model') ||
    q.includes('predict') ||
    q.includes('prediction') ||
    q.includes('simulation')
  ) {
    return `### **AquaIndex Machine Learning & Risk Prediction Engine**

The AquaIndex **Contamination Risk Prediction Engine** utilizes an ensemble multi-factor analytical model designed to assess water toxicity and predict potential environmental degradation.

#### **Model Formula & Component Weights**
The simulated composite risk score (0 to 100) is synthesized from 4 key sub-indices:

$$\\text{Risk Score} = 0.40 \\times S_{\\text{HPI}} + 0.30 \\times S_{\\text{HEI}} + 0.15 \\times P_{\\text{pH}} + 0.15 \\times S_{\\text{Toxic}}$$

1. **Normalized HPI Score ($S_{\\text{HPI}}$, 40% Weight):**
   - Evaluates overall metal load relative to Prasad & Bose (2001) standard.
2. **Normalized HEI Score ($S_{\\text{HEI}}$, 30% Weight):**
   - Assesses cumulative burden based on Edet & Offiong (2002).
3. **Physicochemical Penalty ($P_{\\text{pH}}$, 15% Weight):**
   - Deviations from neutral $pH$ (ideal 6.5–8.5) and elevated $TDS$ increase metal bioavailability and mobility.
4. **Extreme Single-Metal Penalty ($S_{\\text{Toxic}}$, 15% Weight):**
   - Severe spikes in acute toxins ($Pb > 0.01\\text{ mg/L}$, $Cd > 0.003\\text{ mg/L}$, $As > 0.01\\text{ mg/L}$) dramatically elevate the risk tier.

#### **Risk Classifications**
- **Safe / Low Risk (0–39):** Meets potable standards; routine maintenance.
- **Moderate / Watchlist (40–69):** Approaching maximum allowable limits; enhanced monitoring.
- **High / Critical Hazard (70–100):** Exceeds statutory limits; immediate filtration / remediation required.

> *Note: This engine serves as an educational screening and rapid-triage surveillance demonstration. Real drinking water safety requires certified AAS/ICP-MS laboratory testing.*`;
  }

  // 16. About This Project / Project Overview
  if (
    q.includes('about this project') ||
    q.includes('about aquaindex') ||
    q.includes('what is this project') ||
    q.includes('project overview') ||
    q.includes('project briefing') ||
    q.includes('project summary') ||
    q.includes('project details') ||
    q.includes('tell me about this project') ||
    q.includes('summary of water samples')
  ) {
    return `### **AquaIndex Project Overview & Water Surveillance Platform**

**AquaIndex** is a full-stack environmental water surveillance and heavy-metal assessment platform engineered to monitor, evaluate, and predict heavy metal contamination in drinking and surface water resources.

#### **Core Platform Architecture & Scope**
- **Dataset Scale:** 500 validated water quality monitoring samples across **10 key industrial and agricultural districts** (Raipur, Dhanbad, Korba, Durgapur, Singrauli, Angul, Jajpur, Jharsuguda, Bellary, Salem).
- **Water Sources Monitored:** Groundwater (Borewells, Tube wells), Surface water (Rivers, Lakes, Reservoirs), and Municipal distribution networks.
- **Heavy Metals Tracked:** Lead ($Pb$), Cadmium ($Cd$), Arsenic ($As$), Chromium ($Cr$), Copper ($Cu$), Zinc ($Zn$), Nickel ($Ni$), Iron ($Fe$), and Mercury ($Hg$).
- **Physicochemical Parameters:** $pH$, Total Dissolved Solids ($TDS$), and Turbidity ($NTU$).

#### **Scientific & Mathematical Methodologies**
1. **Prasad & Bose (2001) HPI:** Weighted arithmetic indexing quantifying cumulative metal pollution relative to permissible thresholds.
   - *Low Pollution:* $HPI < 50$ (Good/potable)
   - *Threshold Level:* $50 \\le HPI \\le 100$ (Surveillance needed)
   - *Critical Level:* $HPI > 100$ (Remediation mandatory)
2. **Edet & Offiong (2002) HEI:** Cumulative evaluation index summing concentration-to-maximum-allowable-concentration ratios.
   - *Low:* $HEI < 10$ | *Medium:* $10–20$ | *High:* $HEI > 20$
3. **ML Risk Scoring Engine:** Multi-parameter ensemble simulation combining normalized HPI (40%), HEI (30%), pH penalties (15%), and extreme-metal threshold multipliers (15%).
4. **Dual Standards Verification:** Automatic real-time cross-referencing against both **WHO 4th Edition Guidelines** and **BIS IS 10500:2012**.

#### **Live Surveillance Metrics**
- **Total Samples:** ${context.totalSamples}
- **Average HPI:** ${context.averageHpi ?? 'N/A'}
- **Average HEI:** ${context.averageHei ?? 'N/A'}
- **Low Pollution:** ${context.classificationBreakdown?.lowPollutionCount || 0} samples
- **Threshold / Critical:** ${(context.classificationBreakdown?.mediumPollutionCount || 0) + (context.classificationBreakdown?.highPollutionCount || 0)} samples`;
  }

  // 17. Which Heavy Metals Are Monitored?
  if (
    q.includes('which heavy metal') ||
    q.includes('metals are monitored') ||
    q.includes('monitored metals') ||
    q.includes('list metals')
  ) {
    const metalsList = context.monitoredMetals
      .map(
        (m) =>
          `- **${m.name} (${m.symbol})**: WHO Limit = \`${m.whoLimitMgL} mg/L\`, BIS Limit = \`${m.bisLimitMgL} mg/L\` (Mean: \`${m.meanConcentrationMgL} mg/L\`, Exceedances: \`${m.exceedanceRatePercent}\`)`
      )
      .join('\n');

    return `### **Heavy Metals Monitored by AquaIndex**

AquaIndex actively tracks **9 toxic and trace heavy metals** across all water sources:

${metalsList}

Each sample is cross-benchmarked against both **WHO 4th Edition Guidelines** and **Bureau of Indian Standards (BIS IS 10500:2012)**.`;
  }

  // 18. Dashboard Interpretation Guide
  if (
    q.includes('interpret the dashboard') ||
    q.includes('how to interpret') ||
    q.includes('dashboard')
  ) {
    return `### **How to Interpret the AquaIndex Dashboard**

1. **Top KPI Cards:**
   - **Total Water Samples (${context.totalSamples}):** Number of registered field monitoring records.
   - **Districts (${context.districtsMonitored.length}):** Geographical coverage across ${context.statesMonitored.join(', ')}.
   - **Average HPI (${context.averageHpi}):** Green when < 50 (Low), Amber when 50–100 (Threshold), Red when > 100 (Critical).
   - **Average HEI (${context.averageHei}):** Green when < 10, Amber when 10–20, Red when > 20.
2. **Timeline Trend Chart:**
   - Visualizes temporal trajectories of HPI and HEI against benchmark lines at 50 and 100.
3. **Heavy Metal Mean Concentrations:**
   - Bar chart showing average normalized concentrations in mg/L compared to international safety levels.
4. **Recent Samples & Quality Inventory:**
   - Table displaying each sample ID, location, collection date, HPI score, and status badges. Clicking any sample opens its detailed analytical breakdown.
5. **Notice on Synthetic Data:**
   - Demonstrates operational algorithms using synthetic demonstration data; certified laboratory analysis is mandatory before real-world consumption decisions.`;
  }

  // 19. Critical Districts & Hotspots
  if (
    q.includes('hotspot') ||
    q.includes('critical district') ||
    q.includes('contaminated district') ||
    q.includes('most polluted') ||
    q.includes('highest contamination') ||
    q.includes('districts')
  ) {
    return `### **Contamination Hotspots & Regional Surveillance**

AquaIndex actively monitors **10 major industrial, mining, and agricultural regions**:

1. **High Industrial/Mining Activity Zones:**
   - **Raipur & Korba (Chhattisgarh):** Thermal power generation and coal mining areas showing elevated iron ($Fe$), manganese ($Mn$), and lead ($Pb$) levels in runoff.
   - **Dhanbad & Singrauli (Jharkhand / MP):** Heavy coalfield operations with localized acidic mine drainage risks.
   - **Angul & Jharsuguda (Odisha):** Aluminum and steel industrial corridors requiring continuous groundwater screening.
2. **Agricultural & Mixed Catchments:**
   - **Salem (Tamil Nadu) & Bellary (Karnataka):** Tannery, mining, and intense agrarian runoff with elevated nitrates, TDS, and trace heavy metals.
   - **Jajpur & Durgapur (Odisha / West Bengal):** Chromite and industrial manufacturing belts.

You can inspect district-specific distributions on the **Dashboard** and **Water Samples Inventory** pages by using the District Filter dropdown!`;
  }

  // 20. Individual Elements (Word Boundary Matched to prevent substring collisions)
  // Lead (Pb)
  if (hasWord('lead') || hasWord('pb')) {
    return `### **Health & Environmental Impacts of Lead (Pb) in Water**

- **Authoritative Standards:**
  - **WHO Guideline:** \`0.01 mg/L\` (10 µg/L)
  - **BIS IS 10500:2012 Limit:** \`0.01 mg/L\`
- **Health Hazards:**
  - Lead is a potent cumulative neurotoxin with no known safe biological blood level.
  - In children: Causes irreversible cognitive deficits, reduced IQ, behavioral disorders, and stunted growth.
  - In adults: Linked to hypertension, ischemic cardiovascular complications, microcytic anemia, and renal damage.
- **Common Contamination Sources:**
  - Aging lead service lines, lead-soldered copper pipes, brass plumbing fixtures, industrial battery recycling plants.
- **Regulatory Action:**
  - Any sample with $\\text{Pb} > 0.01\\text{ mg/L}$ immediately triggers an **"Exceeds selected threshold"** alert in AquaIndex.`;
  }

  // Cadmium (Cd)
  if (hasWord('cadmium') || hasWord('cd')) {
    return `### **Cadmium (Cd) in Drinking Water**

- **Authoritative Standards:**
  - **WHO Limit:** \`0.003 mg/L\` (3 µg/L)
  - **BIS IS 10500:2012 Limit:** \`0.003 mg/L\`
- **Toxicology & Clinical Pathology:**
  - Highly toxic heavy metal causing irreversible proximal renal tubular dysfunction and severe bone demineralization (**Itai-Itai disease** in Japan, characterized by multiple excruciating skeletal fractures).
  - Class 1 human carcinogen associated with prostate and pulmonary cancers.
- **Sources:**
  - Electroplating effluents, plastic stabilizers, nickel-cadmium batteries, and rock-phosphate fertilizers applied to agricultural soils.`;
  }

  // Arsenic (As)
  if (hasWord('arsenic') || hasWord('as')) {
    return `### **Arsenic (As) in Drinking Water**

- **Authoritative Standards:**
  - **WHO Limit:** \`0.01 mg/L\` (10 µg/L)
  - **BIS IS 10500:2012 Limit:** \`0.01 mg/L\` (permissible up to 0.05 mg/L in absence of alternate source)
- **Toxicology & Clinical Pathology:**
  - Class 1 human carcinogen causing skin keratosis, hyperpigmentation ("raindrop pigmentation"), peripheral vascular gangrene (**"Blackfoot disease"**), and cancers of the skin, bladder, and lungs.
- **Sources:**
  - Natural geogenic dissolution in alluvial floodplains (widespread in the Ganga-Brahmaputra basin), pesticide residue, and mining runoff.`;
  }

  // Mercury (Hg)
  if (hasWord('mercury') || hasWord('hg')) {
    return `### **Mercury (Hg) in Drinking Water**

- **Authoritative Standards:**
  - **WHO Limit:** \`0.001 mg/L\` (1 µg/L)
  - **BIS IS 10500:2012 Limit:** \`0.001 mg/L\`
- **Toxicology & Clinical Pathology:**
  - Methylated by aquatic anaerobic microorganisms into organic methylmercury ($CH_3Hg^+$), which bioaccumulates up the aquatic food chain into fish.
  - Causes severe central nervous system injury (**Minamata disease**), sensory ataxia, constriction of visual fields, tremor, and profound congenital microcephaly in developing fetuses.`;
  }

  // Chromium (Cr & Cr-VI)
  if (
    hasWord('chromium') ||
    hasWord('cr') ||
    q.includes('hexavalent') ||
    q.includes('cr-vi') ||
    q.includes('cr(vi)')
  ) {
    return `### **Chromium (Cr) in Water Quality & Toxicology**

- **Authoritative Standards:**
  - **WHO Drinking Water Guideline:** \`0.05 mg/L\` (50 µg/L total Chromium)
  - **BIS IS 10500:2012 Limit:** \`0.05 mg/L\` (no relaxation)
- **Chemical Speciation & Toxicity:**
  - **Trivalent Chromium [Cr(III)]:** Essential micronutrient in trace amounts; low toxicity and poorly absorbed.
  - **Hexavalent Chromium [Cr(VI)]:** Highly toxic, highly mobile in groundwater, and a Group 1 human carcinogen (IARC). Causes lung and gastrointestinal cancers, deep skin ulcerations ("chrome holes"), nasal septum perforation, and kidney lesions.
- **Common Sources:**
  - Chrome electroplating baths, leather tannery effluents (tanning baths), stainless steel fabrication, chromite ore processing (e.g., Sukinda mining belt in Odisha).
- **Remediation Techniques:**
  - Chemical reduction of $Cr(VI)$ to $Cr(III)$ using ferrous sulfate ($FeSO_4$) or sulfur dioxide followed by hydroxide precipitation; Reverse Osmosis; specialized ion-exchange resins.`;
  }

  // Copper (Cu)
  if (hasWord('copper') || hasWord('cu')) {
    return `### **Copper (Cu) in Water Surveillance**

- **Authoritative Standards:**
  - **WHO Guideline:** \`2.0 mg/L\`
  - **BIS IS 10500:2012 Limit:** \`0.05 mg/L\` (permissible up to \`1.5 mg/L\` in absence of alternate source)
- **Health Hazards:**
  - Essential trace element for enzymatic function, but excessive ingestion causes acute gastrointestinal distress (nausea, vomiting, abdominal colic).
  - Chronic toxicity leads to hepatic and renal failure; individuals with **Wilson's disease** have a genetic defect preventing copper excretion, leading to toxic accumulation in the liver, brain, and cornea (Kayser-Fleischer rings).
- **Common Sources:**
  - Internal corrosion of domestic copper plumbing and brass fittings (especially in low pH water), mining runoff, agricultural copper sulfate fungicides, and industrial smelting.`;
  }

  // Iron (Fe)
  if (hasWord('iron') || hasWord('fe')) {
    return `### **Iron (Fe) in Drinking Water**

- **Authoritative Standards:**
  - **WHO Guideline:** \`0.3 mg/L\` (based on taste and aesthetic threshold)
  - **BIS IS 10500:2012 Limit:** \`0.3 mg/L\` (permissible up to \`1.0 mg/L\`)
- **Impacts & Problems:**
  - Imparts a bitter, astringent metallic taste and reddish-brown turbidity to water.
  - Causes severe staining of laundry and plumbing fixtures.
  - Promotes growth of iron bacteria (*Gallionella ferruginea*), producing slimy gelatinous biofilms that clog pipes and well screens.
  - Long-term dietary overload can exacerbate **hemochromatosis** (iron storage disease).
- **Common Sources:**
  - Weathering of iron-rich mineral rocks (hematite, magnetite, pyrite), coal mine drainage, corroding cast iron water mains, and industrial metal fabrication runoff.`;
  }

  // Zinc (Zn)
  if (hasWord('zinc') || hasWord('zn')) {
    return `### **Zinc (Zn) in Water Systems**

- **Authoritative Standards:**
  - **WHO Guideline:** \`3.0 mg/L\` (aesthetic limit)
  - **BIS IS 10500:2012 Limit:** \`5.0 mg/L\` (permissible up to \`15.0 mg/L\`)
- **Health Effects:**
  - Zinc is an essential nutritional cofactor for over 300 enzymes, but levels above $5.0\\text{ mg/L}$ impart an unpalatable astringent taste and milky opalescent appearance.
  - Massive acute ingestion triggers violent gastrointestinal cramps, nausea, and vomiting, while chronic excessive intake competitively inhibits copper and iron absorption, inducing secondary anemia.
- **Common Sources:**
  - Leaching from galvanized iron plumbing pipes and brass fittings, brass alloy manufacturing, zinc smelting, tire wear debris in urban runoff, and rubber vulcanization waste.`;
  }

  // Nickel (Ni)
  if (hasWord('nickel') || hasWord('ni')) {
    return `### **Nickel (Ni) in Drinking Water**

- **Authoritative Standards:**
  - **WHO Guideline:** \`0.07 mg/L\` (70 µg/L)
  - **BIS IS 10500:2012 Limit:** \`0.02 mg/L\` (20 µg/L)
- **Toxicology:**
  - Most common cause of **allergic contact dermatitis** ("nickel itch"), affecting up to 10–20% of the population upon skin or mucosal contact.
  - Chronic systemic ingestion causes renal tubular dysfunction, pulmonary inflammation, and increased cardiovascular stress.
- **Common Sources:**
  - Effluents from nickel-cadmium battery plants, electroplating facilities, stainless steel scrap melting, and leaching from nickel-chromium plumbing taps.`;
  }

  // Manganese (Mn)
  if (hasWord('manganese') || hasWord('mn')) {
    return `### **Manganese (Mn) in Water Surveillance**

- **Authoritative Standards:**
  - **WHO Guideline:** \`0.4 mg/L\` (neurotoxicity health-based benchmark)
  - **BIS IS 10500:2012 Limit:** \`0.1 mg/L\` (permissible up to \`0.3 mg/L\`)
- **Health Hazards:**
  - Produces blackish-brown deposits and stains in pipes and sanitary ware.
  - Chronic elevated ingestion, particularly in infants and children, causes neurotoxicity and behavioral abnormalities. In severe occupational or drinking-water poisonings, it leads to **"Manganism"**, a permanent syndrome resembling Parkinson's disease with tremor, muscle rigidity, and gait disorders.
- **Common Sources:**
  - Anoxic deep groundwater dissolving natural manganese minerals, ferromanganese smelting plants, and battery disposal.`;
  }

  // 21. General Heavy Metal & Pollution Intelligent Responder (Matches broad queries)
  if (
    q.includes('heavy metal') ||
    q.includes('metal') ||
    q.includes('pollut') ||
    q.includes('contaminat') ||
    q.includes('water') ||
    q.includes('safe') ||
    q.includes('drink')
  ) {
    return `### **Heavy Metal Pollution in Water: Comprehensive Overview**

**Heavy metals** are dense metallic elements (density $> 5\\text{ g/cm}^3$) that exhibit acute and chronic bio-toxicity even at parts-per-billion (ppb) concentrations.

#### **Key Heavy Metal Facts in Drinking Water**
- **Top Critical Contaminants:** Lead ($Pb$), Cadmium ($Cd$), Arsenic ($As$), Mercury ($Hg$), and Hexavalent Chromium ($Cr^{6+}$).
- **Core Scientific Indices:**
  - **HPI (Heavy Metal Pollution Index):** Prasad & Bose (2001) weighted arithmetic model ($HPI < 50$ safe, $50–100$ threshold, $> 100$ critical).
  - **HEI (Heavy Metal Evaluation Index):** Edet & Offiong (2002) cumulative burden index ($HEI < 10$ low, $10–20$ medium, $> 20$ high).
- **Regulatory Safety Thresholds:** Cross-checked against **WHO 4th Edition Guidelines** and **BIS IS 10500:2012**.
- **Effective Removal:** Reverse Osmosis (RO), Ion Exchange Resins, Chemical Hydroxide Precipitation, and Activated Alumina adsorption. *(Boiling water does NOT remove heavy metals!)*

> *What specific aspect would you like to explore? Ask about a specific metal (e.g. Lead, Arsenic), treatment technologies, health diseases, chelation therapy, or laboratory testing!*`;
  }

  // 22. General AquaIndex overview fallback
  return `### **AquaIndex Environmental Intelligence Summary**

**AquaIndex** is a comprehensive environmental surveillance platform engineered for monitoring heavy metal contamination in water bodies.

**Key Platform Capabilities:**
- **Indices Computed:** Heavy Metal Pollution Index (HPI) per *Prasad & Bose (2001)* and Heavy Metal Evaluation Index (HEI) per *Edet & Offiong (2002)*.
- **Currently Monitored:** **${context.totalSamples} water samples** across **${context.districtsMonitored.length} districts** (${context.districtsMonitored.slice(0, 5).join(', ')}, etc.).
- **Average Metrics:** Mean HPI = **${context.averageHpi ?? 'N/A'}**, Mean HEI = **${context.averageHei ?? 'N/A'}**.
- **Monitored Contaminants:** Lead (Pb), Cadmium (Cd), Chromium (Cr), Copper (Cu), Zinc (Zn), Nickel (Ni), Iron (Fe), Arsenic (As), Mercury (Hg).

> *Try asking me: "What is HPI?", "Explain HEI.", "How to remove heavy metals?", "Can boiling water remove lead?", "What diseases are caused by arsenic?", or "Why does mining cause water pollution?"*`;
}

/**
 * Handle user chat message
 */
async function processChatMessage(message, conversationHistory = []) {
  // Input validation
  if (!message || typeof message !== 'string' || message.trim() === '') {
    throw new Error('A valid, non-empty message is required.');
  }

  const cleanMessage = message.trim();
  if (cleanMessage.length > 1000) {
    throw new Error('Message is too long. Please limit your query to 1,000 characters.');
  }

  const platformContext = buildLivePlatformContext();
  const openai = getOpenAIClient();

  // If OpenAI client is not configured, use the built-in domain engine
  if (!openai) {
    const reply = generateBuiltInResponse(cleanMessage, platformContext);
    return {
      success: true,
      message: reply,
      sender: 'AquaBot',
      timestamp: new Date().toISOString(),
      source: 'local_expert_engine',
      notice: 'Powered by AquaIndex Built-in Environmental Science Knowledge Engine. (To enable cloud GPT responses, add OPENAI_API_KEY to server/.env)',
    };
  }

  // Use OpenAI SDK
  try {
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const systemPrompt = `You are AquaBot, the official AI environmental science and water surveillance assistant for the AquaIndex platform.
You are professional, authoritative, helpful, and concise. Format your answers with clear markdown headings, bullet points, and tables where helpful.

CRITICAL OPERATIONAL RULES:
1. NEVER fabricate sample readings or invent fake laboratory numbers. Use the provided platform context.
2. If asked about current dashboard data or dataset statistics, reference this EXACT verified backend data:
   - Total Samples: ${platformContext.totalSamples}
   - Districts Monitored: ${platformContext.districtsMonitored.join(', ')}
   - States Monitored: ${platformContext.statesMonitored.join(', ')}
   - Mean HPI: ${platformContext.averageHpi}
   - Mean HEI: ${platformContext.averageHei}
   - Classification Breakdown: ${JSON.stringify(platformContext.classificationBreakdown)}
   - Monitored Heavy Metals & Limits: ${JSON.stringify(platformContext.monitoredMetals)}
3. HPI Formula: HPI = Σ(Wi * Qi) / ΣWi (Prasad & Bose 2001). Thresholds: Low (<50), Medium (50-100), Critical (>100).
4. HEI Formula: HEI = Σ(Ci / MACi) (Edet & Offiong 2002). Thresholds: Low (<10), Medium (10-20), High (>20).
5. REGULATORY SAFETY RULE: NEVER declare drinking water unconditionally "safe" from an AI prediction or synthetic demonstration data. Always state that certified laboratory testing (such as AAS or ICP-MS) is required for real-world drinking water decisions.
6. If the user asks about heavy metal health impacts (e.g. Lead, Cadmium, Arsenic), provide scientifically accurate clinical toxicology information.`;

    // Build message array with recent history (up to 8 turns)
    const messages = [
      { role: 'system', content: systemPrompt },
    ];

    if (Array.isArray(conversationHistory)) {
      const recent = conversationHistory.slice(-8);
      for (const turn of recent) {
        if (turn.sender === 'user' && turn.text) {
          messages.push({ role: 'user', content: String(turn.text).slice(0, 500) });
        } else if (turn.sender === 'bot' && turn.text) {
          messages.push({ role: 'assistant', content: String(turn.text).slice(0, 1000) });
        }
      }
    }

    messages.push({ role: 'user', content: cleanMessage });

    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 800,
    });

    const replyText =
      completion.choices[0]?.message?.content ||
      generateBuiltInResponse(cleanMessage, platformContext);

    return {
      success: true,
      message: replyText,
      sender: 'AquaBot',
      timestamp: new Date().toISOString(),
      source: 'openai',
      modelUsed: model,
    };
  } catch (apiError) {
    console.warn('[AquaBot OpenAI Warning] Cloud API call failed:', apiError.message);
    // Graceful fallback to built-in knowledge engine
    const fallbackReply = generateBuiltInResponse(cleanMessage, platformContext);
    return {
      success: true,
      message: fallbackReply,
      sender: 'AquaBot',
      timestamp: new Date().toISOString(),
      source: 'local_expert_engine_fallback',
      notice: `Fallback applied: ${apiError.message}. System functioning with internal environmental engine.`,
    };
  }
}

module.exports = {
  processChatMessage,
  buildLivePlatformContext,
};
