function extractResumeDetails(resumeText) {
  const text = resumeText || "";

  const skillsList = [
    "JavaScript",
    "React",
    "React.js",
    "Node.js",
    "Express",
    "MongoDB",
    "HTML",
    "CSS",
    "Java",
    "Python",
    "C++",
    "SQL",
    "Git",
    "GitHub",
    "REST API",
    "REST APIs",
    "MERN",
    "Figma"
  ];

  const skills = skillsList.filter((skill) =>
    new RegExp(`\\b${skill.replace(".", "\\.")}\\b`, "i").test(text)
  );

  const phoneMatch = text.match(/(?:\+91[\s-]?)?[6-9]\d{9}\b/);

  let experienceYears = 0;

  const experienceMatch = text.match(
    /(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)\s+(?:of\s+)?experience/i
  );

  if (experienceMatch) {
    experienceYears = Number(experienceMatch[1]);
  }

  const educationKeywords = [
    "B.E",
    "B.Tech",
    "M.E",
    "M.Tech",
    "B.Sc",
    "M.Sc",
    "MBA",
    "Bachelor",
    "Master",
    "Computer Science",
    "Engineering"
  ];

  const education = educationKeywords.filter((item) =>
    text.toLowerCase().includes(item.toLowerCase())
  );

  return {
    skills,
    experienceYears,
    education,
    phone: phoneMatch ? phoneMatch[0] : ""
  };
}

module.exports = {
  extractResumeDetails
};