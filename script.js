const header = document.querySelector("[data-header]");
const revealItems = document.querySelectorAll(".reveal");
const applicationForm = document.querySelector("[data-application-form]");
const applicationResult = document.querySelector("[data-application-result]");
const applicationRecipient = "erwin@sacredsound.studio";
const applicationQuestions = {
  q1: "I have a clear sense of who I am and what I am called to be.",
  q2: "My leadership remains steady, clear, and values-aligned under pressure.",
  q3: "The key relationships around me are marked by trust, candor, and repair.",
  q4: "My current environment supports the person and organization I am becoming.",
  q5: "I am carrying significant pressure, complexity, or responsibility right now.",
  q6: "I have the capacity, margin, and support needed for my current circumstance.",
  q7: "Decision-making, accountability, and priorities are coherent in my system.",
  q8: "The outcomes I am producing feel sustainable, fruitful, and aligned.",
};

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const getScore = (formData, key) => Number(formData.get(key) || 0);

const getAlignmentState = (scores) => {
  const alignmentQuestions = [scores.q1, scores.q2, scores.q3, scores.q4, scores.q7, scores.q8];
  const alignment =
    alignmentQuestions.reduce((total, score) => total + score, 0) / alignmentQuestions.length;
  const pressure = scores.q5;
  const capacity = scores.q6;
  const allCoreLow = alignmentQuestions.every((score) => score <= 2) && capacity <= 2;

  if (allCoreLow && pressure <= 2) {
    return {
      className: "failing",
      label: "Failing",
      detail: "misaligned in every category under low pressure. Collapse requires immediate structural attention.",
    };
  }

  if (alignment >= 3.7 && pressure >= 3.5 && capacity >= 3.5) {
    return {
      className: "flourishing",
      label: "Flourishing",
      detail: "high alignment, high pressure, and high capacity. The next step is protecting and scaling coherence.",
    };
  }

  if (alignment >= 3.7 && pressure < 3.5) {
    return {
      className: "functioning",
      label: "Functioning",
      detail: "high alignment under lower pressure. The opportunity is strengthening capacity before pressure rises.",
    };
  }

  if (pressure >= 3.5) {
    return {
      className: "fragmenting",
      label: "Fragmenting",
      detail: "high pressure with lower alignment. Misalignment is surfacing under pressure.",
    };
  }

  return {
    className: "fracturing",
    label: "Fracturing",
    detail: "low pressure with low alignment. Structural breakdown is present before pressure intensifies.",
  };
};

const buildApplicationEmail = (formData, scores, state) => {
  const applicantName = formData.get("name") || "Applicant";
  const subject = `Nanasi Alignment Application - ${applicantName}`;
  const scoreLines = Object.entries(applicationQuestions)
    .map(([key, question]) => `${question}\nScore: ${scores[key]}/5`)
    .join("\n\n");
  const body = [
    "New Nanasi Institute alignment application",
    "",
    `Name: ${applicantName}`,
    `Email: ${formData.get("email")}`,
    `Age category: ${formData.get("age")}`,
    `Continent: ${formData.get("continent")}`,
    "",
    `Preliminary alignment state: ${state.label}`,
    state.detail,
    "",
    "Alignment pulse",
    scoreLines,
  ].join("\n");

  return `mailto:${applicationRecipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

applicationForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(applicationForm);
  const scores = {
    q1: getScore(formData, "q1"),
    q2: getScore(formData, "q2"),
    q3: getScore(formData, "q3"),
    q4: getScore(formData, "q4"),
    q5: getScore(formData, "q5"),
    q6: getScore(formData, "q6"),
    q7: getScore(formData, "q7"),
    q8: getScore(formData, "q8"),
  };
  const state = getAlignmentState(scores);
  const applicantName = formData.get("name") || "Your application";

  applicationResult.className = `application-result is-visible ${state.className}`;
  applicationResult.textContent = `${applicantName}: preliminary alignment state is ${state.label} - ${state.detail} Your email app will open to send this application to Erwin.`;
  window.location.href = buildApplicationEmail(formData, scores, state);
});
