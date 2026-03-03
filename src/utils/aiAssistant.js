import { requestUserAssistant } from "../api/assistant-bot/bot.api";

const RULES = [
  {
    keywords: ["fever", "cough", "sore throat", "flu", "cold"],
    possibleConditions: ["Viral upper respiratory infection", "Influenza", "Pharyngitis"],
    suggestedTests: ["CBC", "CRP", "Chest X-Ray (if severe cough)"],
    baseRisk: "medium",
  },
  {
    keywords: ["sugar", "diabetes", "polyuria", "polydipsia", "glucose"],
    possibleConditions: ["Type 2 Diabetes Mellitus", "Uncontrolled hyperglycemia"],
    suggestedTests: ["HbA1c", "Fasting glucose", "Renal function tests"],
    baseRisk: "high",
  },
  {
    keywords: ["blood pressure", "hypertension", "bp", "headache", "dizziness"],
    possibleConditions: ["Primary Hypertension", "Hypertensive urgency (rule out)"],
    suggestedTests: ["BP trend chart", "ECG", "Renal profile"],
    baseRisk: "high",
  },
  {
    keywords: ["chest pain", "shortness of breath", "palpitations"],
    possibleConditions: ["Cardiac ischemia", "Arrhythmia", "Anxiety-related symptoms"],
    suggestedTests: ["ECG", "Troponin", "Echocardiography (if needed)"],
    baseRisk: "high",
  },
  {
    keywords: ["back pain", "joint pain", "arthritis", "swelling"],
    possibleConditions: ["Musculoskeletal strain", "Inflammatory arthritis"],
    suggestedTests: ["ESR/CRP", "X-Ray of affected area"],
    baseRisk: "medium",
  },
];

const RISK_ORDER = { low: 1, medium: 2, high: 3 };

const maxRisk = (a, b) =>
  RISK_ORDER[a] >= RISK_ORDER[b] ? a : b;

const localSymptomChecker = ({
  symptoms = "",
  age = "",
  gender = "",
  history = "",
} = {}) => {
  const text = `${symptoms} ${history}`.toLowerCase();
  const matched = RULES.filter((rule) =>
    rule.keywords.some((keyword) => text.includes(keyword))
  );

  const possibleConditions = matched.length
    ? [...new Set(matched.flatMap((rule) => rule.possibleConditions))]
    : ["General clinical review advised"];

  const suggestedTests = matched.length
    ? [...new Set(matched.flatMap((rule) => rule.suggestedTests))]
    : ["CBC", "Basic vitals assessment"];

  let riskLevel = matched.reduce((risk, rule) => maxRisk(risk, rule.baseRisk), "low");

  const numericAge = Number(age || 0);
  if (numericAge >= 60 && riskLevel !== "high") riskLevel = "high";
  if (text.includes("chronic") || text.includes("recurrent")) {
    riskLevel = maxRisk(riskLevel, "high");
  }

  const summary = `Input reviewed for ${gender || "patient"}, age ${
    numericAge || "N/A"
  }. Potential conditions and tests are advisory only.`;

  return {
    possibleConditions,
    suggestedTests,
    riskLevel,
    summary,
  };
};

const localRiskFlags = ({ diagnoses = [], symptoms = "" } = {}) => {
  const normalizedSymptoms = symptoms.toLowerCase();
  const diagnosisText = diagnoses
    .map((entry) => `${entry.title || ""} ${entry.notes || ""}`.toLowerCase())
    .join(" ");

  const flags = [];
  const infectionMentions = diagnoses.filter((entry) =>
    `${entry.title || ""} ${entry.notes || ""}`.toLowerCase().includes("infection")
  ).length;

  if (infectionMentions >= 2) {
    flags.push("Repeated infection pattern detected");
  }

  if (diagnosisText.includes("chronic") || normalizedSymptoms.includes("chronic")) {
    flags.push("Chronic symptom pattern detected");
  }

  const hasDiabetes = diagnosisText.includes("diabetes") || normalizedSymptoms.includes("diabetes");
  const hasHypertension =
    diagnosisText.includes("hypertension") || normalizedSymptoms.includes("blood pressure");
  if (hasDiabetes && hasHypertension) {
    flags.push("High-risk diabetes + hypertension combination");
  }

  if (!flags.length) {
    flags.push("No major high-risk pattern detected in current data.");
  }

  return flags;
};

const localPrescriptionExplanation = ({
  patientName = "Patient",
  medications = [],
  instructions = "",
  language = "en",
} = {}) => {
  const medicineList = medications.map((item) => item.name).filter(Boolean);
  const medicineSentence = medicineList.length
    ? `Your prescription includes: ${medicineList.join(", ")}.`
    : "Your doctor has prescribed medicines as per your condition.";

  const explanationEn = `${patientName}, ${medicineSentence} Follow dosage strictly and do not skip doses. ${
    instructions || ""
  }`.trim();
  const lifestyleEn = [
    "Maintain hydration and balanced meals.",
    "Take medicines on schedule.",
    "Avoid self-medication.",
  ];
  const preventiveEn = [
    "Book follow-up if symptoms persist.",
    "Monitor warning signs and seek urgent care for severe symptoms.",
  ];

  const explanationUr = `${patientName}، آپ کی دوا ڈاکٹر کی ہدایت کے مطابق استعمال کریں۔ خوراک وقت پر لیں اور علامات میں بہتری نہ ہو تو فالو اپ کریں۔`;

  return {
    explanation: language === "ur" ? explanationUr : explanationEn,
    explanationUrdu: explanationUr,
    lifestyleRecommendations: lifestyleEn,
    preventiveAdvice: preventiveEn,
  };
};

export const runSmartSymptomChecker = async (
  payload = {},
  role = "doctor"
) => {
  try {
    const data = await requestUserAssistant({
      role,
      action: "symptom_checker",
      payload,
    });
    if (data?.result) {
      return {
        riskLevel: data.result.riskLevel || "medium",
        possibleConditions: Array.isArray(data.result.possibleConditions)
          ? data.result.possibleConditions
          : [],
        suggestedTests: Array.isArray(data.result.suggestedTests)
          ? data.result.suggestedTests
          : [],
        summary: data.result.summary || "AI analysis completed.",
      };
    }
  } catch {
    // fallback below
  }

  return localSymptomChecker(payload);
};

export const detectRiskFlags = async (
  payload = {},
  role = "doctor"
) => {
  try {
    const data = await requestUserAssistant({
      role,
      action: "risk_flags",
      payload,
    });
    if (Array.isArray(data?.result?.flags) && data.result.flags.length) {
      return data.result.flags;
    }
  } catch {
    // fallback below
  }

  return localRiskFlags(payload);
};

export const generatePrescriptionExplanation = async (
  payload = {},
  role = "doctor"
) => {
  try {
    const data = await requestUserAssistant({
      role,
      action: "prescription_explanation",
      payload,
    });
    if (data?.result) {
      return {
        explanation: data.result.explanation || "",
        explanationUrdu: data.result.explanationUrdu || "",
        lifestyleRecommendations: Array.isArray(data.result.lifestyleRecommendations)
          ? data.result.lifestyleRecommendations
          : [],
        preventiveAdvice: Array.isArray(data.result.preventiveAdvice)
          ? data.result.preventiveAdvice
          : [],
      };
    }
  } catch {
    // fallback below
  }

  return localPrescriptionExplanation(payload);
};

export const getAiAssistance = async (input = "") => {
  const result = await runSmartSymptomChecker({ symptoms: input }, "patient");
  return [
    `Risk Level: ${String(result.riskLevel || "medium").toUpperCase()}`,
    `Possible Conditions: ${(result.possibleConditions || []).join(", ")}`,
    `Suggested Tests: ${(result.suggestedTests || []).join(", ")}`,
  ];
};
