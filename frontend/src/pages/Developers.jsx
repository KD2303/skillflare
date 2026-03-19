import { useState, useEffect, useRef } from "react";
import {
  Github,
  Linkedin,
  Database,
  Bug,
  Mail,
  Globe,
  Layers,
  Code2,
  Shield,
  Sparkles,
} from "lucide-react";

/* ── Scroll-reveal hook ── */
const useReveal = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

const RevealSection = ({ children, className = "", delay = 0 }) => {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ── Data ── */
const teamMembers = [
  {
    id: 1,
    name: "Krish Dargar",
    role: "Full Stack Developer",
    category: ["Frontend", "Backend"],
    image: "/Profile_Photos/Krish%20Profile.jpeg",
    skills: ["React", "Node.js", "MongoDB", "Tailwind"],
    socials: {
      github: "https://github.com/KD2303",
      linkedin: "https://www.linkedin.com/in/krish-dargar-101774324/",
      portfolio: "#",
    },
  },
  {
    id: 2,
    name: "Sheetal Gourh",
    role: "Frontend Developer",
    category: ["Frontend"],
    image: "/Profile_Photos/Sheetal%20Profile.jpeg",
    skills: ["HTML5", "CSS3", "React", "Figma"],
    socials: {
      github: "https://github.com/sheetal783",
      linkedin: "https://www.linkedin.com/in/sheetal-gourh-994272339/",
      portfolio: "#",
    },
  },
  {
    id: 3,
    name: "Arin Gupta",
    role: "Backend Developer",
    category: ["Backend"],
    image: "/Profile_Photos/Arin%20Profile%20photo.jpeg",
    skills: ["Node.js", "Express", "MongoDB", "REST APIs"],
    socials: {
      github: "https://github.com/arin-gupta06",
      linkedin: "https://www.linkedin.com/in/arin-gupta-2b94b032a/",
      portfolio: "#",
    },
  },
  {
    id: 4,
    name: "Anurag Mishra",
    role: "Backend Developer",
    category: ["Backend"],
    image: "/Profile_Photos/Anurag%20Profile%20Photo.jpeg",
    skills: ["Python", "Django", "PostgreSQL", "Docker"],
    socials: {
      github: "https://github.com/anuragmishra5159/anuragmishra5159",
      linkedin: "https://www.linkedin.com/in/anuragmishra5159/",
      portfolio: "#",
    },
  },
  {
    id: 5,
    name: "Vivek Chaurasiya",
    role: "Backend Developer",
    category: ["Backend"],
    image: "/Profile_Photos/Vivek%20Profile%20Photo.png",
    imagePosition: "object-top",
    skills: ["Node.js", "Express.js", "MongoDB", "REST APIs"],
    socials: {
      github: "https://github.com/VivekChaurasiya95",
      linkedin: "https://www.linkedin.com/in/vivek-chaurasiya-722037315/",
      portfolio: "#",
    },
  },
  {
    id: 6,
    name: "Ashish Garg",
    role: "QA Engineer",
    category: ["Testing"],
    image: "/Profile_Photos/Ashish%20Profile%20Photo.jpeg",
    imagePosition: "object-[center_top]",
    skills: ["Selenium", "Manual Testing", "JIRA", "Cypress"],
    socials: {
      github: "https://github.com/Ashishgargnotgonnaloose2248",
      linkedin: "https://www.linkedin.com/in/ashish-garg-2b896432a/",
      portfolio: "#",
    },
  },
];

const mentor = {
  name: "Dr. Devesh Kumar Lal",
  role: "Faculty Mentor / Project Guide",
  image: "/Profile_Photos/Devesh%20Sir%20Profile.jpeg",
  description:
    "Guiding and supporting the development team throughout the project. Expert in Distributed Systems and Software Engineering with over 15 years of academic experience.",
  socials: {
    linkedin: "https://www.linkedin.com/in/dr-devesh-kumar-lal-aa8ba419/",
    email: "mailto:mentor@university.edu",
  },
};

const filters = ["All", "Frontend", "Backend", "Testing", "Mentor"];

const filterIcons = {
  All: Sparkles,
  Frontend: Layers,
  Backend: Database,
  Testing: Shield,
  Mentor: Code2,
};

const categoryColor = {
  Frontend: "from-orange-500 to-amber-400",
  Backend: "from-blue-500 to-cyan-400",
  Testing: "from-emerald-500 to-green-400",
};

const categoryBadgeBg = {
  Frontend: "bg-orange-500/15 text-orange-400",
  Backend: "bg-blue-500/15 text-blue-400",
  Testing: "bg-emerald-500/15 text-emerald-400",
};

/* ── Component ── */
const Developers = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredMembers =
    activeFilter === "All" || activeFilter === "Mentor"
      ? teamMembers
      : teamMembers.filter((m) => m.category.includes(activeFilter));

  const showMentor = activeFilter === "All" || activeFilter === "Mentor";
  const showMembers = activeFilter !== "Mentor";

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* ════════ HERO ════════ */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* glow blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-orange/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="wrapper relative z-10 text-center">
          <RevealSection>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-brand-orange text-sm font-medium mb-6">
              <Code2 size={14} />
              <span>Our Team</span>
            </div>
          </RevealSection>

          <RevealSection delay={100}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display text-white mb-5 leading-tight">
              Meet Our <span className="text-gradient">Development Team</span>
            </h1>
          </RevealSection>

          <RevealSection delay={200}>
            <p className="text-lg md:text-xl text-brand-text-secondary max-w-2xl mx-auto leading-relaxed">
              The people behind building and improving this project.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ════════ FILTER TABS ════════ */}
      <div className="wrapper">
        <RevealSection>
          <div className="flex flex-wrap justify-center gap-3 mb-14">
            {filters.map((f) => {
              const Icon = filterIcons[f];
              const active = activeFilter === f;
              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                    ${
                      active
                        ? "bg-brand-orange text-white shadow-glow scale-105"
                        : "bg-brand-surface border border-brand-border text-brand-text-secondary hover:text-white hover:border-brand-orange/40 hover:scale-105"
                    }`}
                >
                  <Icon
                    size={15}
                    className={
                      active
                        ? "text-white"
                        : "text-brand-text-muted group-hover:text-brand-orange transition-colors"
                    }
                  />
                  {f}
                </button>
              );
            })}
          </div>
        </RevealSection>

        {/* ════════ TEAM GRID ════════ */}
        {showMembers && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mb-20">
            {filteredMembers.map((member, idx) => {
              const primaryCat = member.category[0];
              const gradient =
                categoryColor[primaryCat] || categoryColor.Frontend;
              return (
                <RevealSection key={member.id} delay={idx * 80}>
                  <div className="group relative bg-brand-card rounded-2xl border border-brand-border overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-brand-orange/30 hover:shadow-[0_20px_60px_-15px_rgba(249,115,22,0.15)]">
                    {/* top gradient bar */}
                    <div
                      className={`h-28 bg-gradient-to-br ${gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-500`}
                    />

                    <div className="px-6 pb-8 text-center relative">
                      {/* avatar */}
                      <div className="relative -mt-14 mb-4 inline-block">
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-brand-orange/60 to-blue-500/60 blur opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
                        <img
                          src={member.image}
                          alt={member.name}
                          className={`relative w-28 h-28 rounded-full border-4 border-brand-card bg-brand-surface object-cover ${member.imagePosition || "object-center"}`}
                        />
                        {/* role badges on avatar */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                          {member.category.map((cat) => {
                            const icons = {
                              Frontend: Layers,
                              Backend: Database,
                              Testing: Bug,
                            };
                            const colors = {
                              Frontend: "bg-orange-500",
                              Backend: "bg-blue-500",
                              Testing: "bg-emerald-500",
                            };
                            const CatIcon = icons[cat];
                            return (
                              <div
                                key={cat}
                                className={`p-1.5 ${colors[cat]} rounded-full text-white shadow-lg`}
                              >
                                <CatIcon size={12} />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-brand-orange transition-colors duration-300">
                        {member.name}
                      </h3>
                      <p className="text-sm text-brand-text-secondary mb-4 font-medium">
                        {member.role}
                      </p>

                      {/* skills */}
                      <div className="flex flex-wrap justify-center gap-1.5 mb-5">
                        {member.skills.map((skill) => (
                          <span
                            key={skill}
                            className={`px-2.5 py-1 text-xs rounded-full font-medium ${categoryBadgeBg[primaryCat]} transition-colors`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* socials */}
                      <div className="flex justify-center gap-3">
                        <a
                          href={member.socials.github}
                          className="p-2 rounded-lg bg-brand-surface text-brand-text-muted hover:text-white hover:bg-white/10 transition-all duration-200"
                        >
                          <Github size={17} />
                        </a>
                        <a
                          href={member.socials.linkedin}
                          className="p-2 rounded-lg bg-brand-surface text-brand-text-muted hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200"
                        >
                          <Linkedin size={17} />
                        </a>
                        <a
                          href={member.socials.portfolio}
                          className="p-2 rounded-lg bg-brand-surface text-brand-text-muted hover:text-brand-orange hover:bg-brand-orange/10 transition-all duration-200"
                        >
                          <Globe size={17} />
                        </a>
                      </div>
                    </div>
                  </div>
                </RevealSection>
              );
            })}
          </div>
        )}

        {/* empty filter state */}
        {showMembers && filteredMembers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-brand-text-secondary text-lg">
              No team members found in this category.
            </p>
          </div>
        )}

        {/* ════════ FACULTY MENTOR ════════ */}
        {showMentor && (
          <RevealSection className="mb-20">
            <div className="relative rounded-3xl p-px bg-gradient-to-br from-brand-orange/40 via-brand-border to-blue-500/40 overflow-hidden group">
              {/* animated glow blobs */}
              <div className="absolute top-0 right-0 -mr-24 -mt-24 w-72 h-72 bg-brand-orange/20 rounded-full blur-3xl opacity-40 animate-float pointer-events-none" />
              <div
                className="absolute bottom-0 left-0 -ml-24 -mb-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl opacity-30 animate-float pointer-events-none"
                style={{ animationDelay: "3s" }}
              />

              <div className="relative bg-brand-card rounded-[23px] p-8 md:p-12 z-10">
                <div className="flex flex-col md:flex-row items-center gap-10">
                  {/* mentor photo */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-orange to-blue-500 rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                    <img
                      src={mentor.image}
                      alt={mentor.name}
                      className="relative w-44 h-44 rounded-full border-4 border-brand-card object-cover shadow-2xl"
                    />
                  </div>

                  {/* mentor info */}
                  <div className="text-center md:text-left flex-1">
                    <span className="inline-block uppercase tracking-widest text-xs text-brand-orange font-semibold mb-3 px-3 py-1 rounded-full bg-brand-orange/10">
                      Faculty Mentor
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-2">
                      {mentor.name}
                    </h2>
                    <p className="text-blue-400 text-lg mb-5 font-medium">
                      {mentor.role}
                    </p>
                    <p className="text-brand-text-secondary text-base leading-relaxed max-w-2xl mb-8">
                      {mentor.description}
                    </p>

                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                      <a
                        href={mentor.socials.email}
                        className="btn-primary px-6 py-2.5 text-sm"
                      >
                        <Mail size={16} className="mr-2" />
                        Contact Mentor
                      </a>
                      <a
                        href={mentor.socials.linkedin}
                        className="p-2.5 rounded-xl bg-brand-surface border border-brand-border text-brand-text-secondary hover:text-blue-400 hover:border-blue-500/40 transition-all duration-200"
                      >
                        <Linkedin size={20} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        )}
      </div>
    </div>
  );
};

export default Developers;
