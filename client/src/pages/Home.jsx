import { useEffect, useRef, useState } from "react";
import API from "../api/api";

function Home() {
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [posts, setPosts] = useState([]);

  const revealRef = useRef(null);
  const [activeSection, setActiveSection] = useState("home");

  const [animatedProjects, setAnimatedProjects] = useState(0);
  const [animatedSkills, setAnimatedSkills] = useState(0);
  const [animatedAchievements, setAnimatedAchievements] = useState(0);

  // =========================
  // LOAD PORTFOLIO DATA
  // =========================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await API.get("/profile");
        setProfile(response.data);
      } catch (error) {
        console.log("Error loading profile:", error);
      }
    };

    const loadSkills = async () => {
      try {
        const response = await API.get("/skills");
        setSkills(response.data);
      } catch (error) {
        console.log("Error loading skills:", error);
      }
    };

    const loadProjects = async () => {
      try {
        const response = await API.get("/projects");
        setProjects(response.data);
      } catch (error) {
        console.log("Error loading projects:", error);
      }
    };

    const loadAchievements = async () => {
      try {
        const response = await API.get("/achievements");
        setAchievements(response.data);
      } catch (error) {
        console.log("Error loading achievements:", error);
      }
    };

    const loadPosts = async () => {
      try {
        const response = await API.get("/posts");
        setPosts(response.data);
      } catch (error) {
        console.log("Error loading blog posts:", error);
      }
    };

    loadProfile();
    loadSkills();
    loadProjects();
    loadAchievements();
    loadPosts();
  }, []);

  // =========================
  // SCROLL REVEAL
  // =========================

  useEffect(() => {
    const root = revealRef.current;

    if (!root) return;

    const elements = root.querySelectorAll(
      ".reveal-on-scroll:not(.revealed)"
    );

    if (!elements.length) return;

    // Fallback for older browsers
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => {
        element.classList.add("revealed");
      });

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    elements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [
    profile,
    skills,
    projects,
    achievements,
    posts,
  ]);

  // =========================
  // ACTIVE NAVBAR SECTION
  // =========================

  useEffect(() => {
    const sectionIds = [
      "home",
      "about",
      "skills",
      "projects",
      "achievements",
      "blog",
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      let currentSection = "home";

      sectionIds.forEach((id) => {
        const section = document.getElementById(id);

        if (section && scrollPosition >= section.offsetTop) {
          currentSection = id;
        }
      });

      setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // =========================
  // PROJECT CARD INTERACTION
  // =========================

  const handleProjectMouseMove = (event) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateX = ((y / rect.height) - 0.5) * -5;
    const rotateY = ((x / rect.width) - 0.5) * 5;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-7px)`;
  };

  const handleProjectMouseLeave = (event) => {
    const card = event.currentTarget;

    card.style.setProperty("--mouse-x", "50%");
    card.style.setProperty("--mouse-y", "50%");
    card.style.transform = "";
  };

  // =========================
  // ANIMATED HERO STATISTICS
  // =========================

  useEffect(() => {
    const targets = {
      projects: projects.length,
      skills: skills.length,
      achievements: achievements.length,
    };

    const duration = 1100;
    const startTime = performance.now();

    let animationFrame;

    const animateStats = (currentTime) => {
      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      );

      // Smooth ease-out animation
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setAnimatedProjects(
        Math.floor(targets.projects * easedProgress)
      );

      setAnimatedSkills(
        Math.floor(targets.skills * easedProgress)
      );

      setAnimatedAchievements(
        Math.floor(targets.achievements * easedProgress)
      );

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animateStats);
      }
    };

    animationFrame = requestAnimationFrame(animateStats);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [projects.length, skills.length, achievements.length]);

  const publishedPosts = posts.filter(
    (post) => post.published !== false
  );

  return (
    <div
      className="portfolio-home"
      ref={revealRef}
    >

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="portfolio-navbar">

        <div className="portfolio-logo">
          {profile?.name || "My Portfolio"}
        </div>

        <div className="portfolio-nav-links">

          <a
            href="#home"
            className={activeSection === "home" ? "active" : ""}
          >
            Home
          </a>

          <a
            href="#about"
            className={activeSection === "about" ? "active" : ""}
          >
            About
          </a>

          <a
            href="#skills"
            className={activeSection === "skills" ? "active" : ""}
          >
            Skills
          </a>

          <a
            href="#projects"
            className={activeSection === "projects" ? "active" : ""}
          >
            Projects
          </a>

          <a
            href="#achievements"
            className={activeSection === "achievements" ? "active" : ""}
          >
            Achievements
          </a>

          <a
            href="#blog"
            className={activeSection === "blog" ? "active" : ""}
          >
            Blog
          </a>

          <a href="/contact">
            Contact
          </a>

          <a
            href="/resume/resume.pdf"
            download="Akshat_Pandey_Resume.pdf"
            className="nav-resume-button"
          >
            Resume
          </a>

        </div>

      </nav>


      {/* =========================
          HERO
      ========================= */}

      <section
        id="home"
        className="portfolio-hero"
      >

        <div className="hero-content">

          <div
            className="availability-badge reveal-on-scroll"
          >
            <span className="availability-dot"></span>

            Available for Opportunities
          </div>


          <p
            className="hero-small-text reveal-on-scroll reveal-delay-1"
          >
            Hello, I'm
          </p>


          <h1
            className="reveal-on-scroll reveal-delay-1"
          >
            {profile?.name || "Your Name"}
          </h1>


          <h2
            className="reveal-on-scroll reveal-delay-2"
          >
            {profile?.profileRole ||
              "Full Stack Developer"}
          </h2>


          <p
            className="hero-description reveal-on-scroll reveal-delay-2"
          >
            {profile?.about ||
              "I build modern, responsive and user-friendly web applications using modern technologies."}
          </p>


          <div
            className="hero-buttons reveal-on-scroll reveal-delay-3"
          >

            <a
              href="#projects"
              className="primary-button"
            >
              View My Work
            </a>


            <a
              href="/resume/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="secondary-button"
            >
              View Resume
            </a>


            <a
              href="/resume/resume.pdf"
              download="Akshat_Pandey_Resume.pdf"
              className="secondary-button"
            >
              Download Resume
            </a>


            <a
              href="/contact"
              className="secondary-button"
            >
              Contact Me
            </a>

          </div>


          <div
            className="hero-stats reveal-on-scroll reveal-delay-3"
          >

            <div className="hero-stat">

              <strong>
                {animatedProjects}+
              </strong>

              <span>
                Projects
              </span>

            </div>


            <div className="hero-stat">

              <strong>
                {animatedSkills}+
              </strong>

              <span>
                Skills
              </span>

            </div>


            <div className="hero-stat">

              <strong>
                {animatedAchievements}+
              </strong>

              <span>
                Achievements
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =========================
          ABOUT
      ========================= */}

      <section
        id="about"
        className="portfolio-section about-section"
      >

        <div
          className="about-heading reveal-on-scroll"
        >

          <span className="section-label">
            GET TO KNOW ME
          </span>

          <h2>
            About Me
          </h2>

          <div className="section-heading-line"></div>

        </div>


        <div
          className="about-card reveal-on-scroll reveal-delay-1"
        >

          <div className="about-card-left">

            <div className="about-profile-icon">

              {profile?.profileImage ? (

                <img
                  src={profile.profileImage}
                  alt={
                    profile?.name || "Profile"
                  }
                  className="about-profile-image"
                />

              ) : (

                <span>
                  {profile?.name
                    ? profile.name
                        .charAt(0)
                        .toUpperCase()
                    : "A"}
                </span>

              )}

            </div>


            <div>

              <h3>
                {profile?.name ||
                  "Your Name"}
              </h3>

              <p className="about-role">
                {profile?.profileRole ||
                  "Full Stack Developer"}
              </p>

            </div>

          </div>


          <div className="about-card-right">

            <p>
              {profile?.about ||
                "I am a passionate developer interested in building impactful software applications and learning new technologies."}
            </p>


            <div className="about-highlights">

              <div className="about-highlight">

                <strong>
                  {projects.length}+
                </strong>

                <span>
                  Projects Built
                </span>

              </div>


              <div className="about-highlight">

                <strong>
                  {skills.length}+
                </strong>

                <span>
                  Technical Skills
                </span>

              </div>


              <div className="about-highlight">

                <strong>
                  {achievements.length}+
                </strong>

                <span>
                  Achievements
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================
          SKILLS
      ========================= */}

      <section
        id="skills"
        className="portfolio-section skills-portfolio-section"
      >

        <div
          className="skills-section-heading reveal-on-scroll"
        >

          <span className="section-label">
            MY EXPERTISE
          </span>

          <h2>
            Technical Skills
          </h2>

          <div className="section-heading-line"></div>

          <p>
            Technologies and tools I use to build
            modern, scalable and user-friendly
            applications.
          </p>

        </div>


        <div className="portfolio-skills-grid">

          {skills.length === 0 ? (

            <div className="portfolio-placeholder reveal-on-scroll">
              No skills added yet.
            </div>

          ) : (

            skills.map((skill, index) => {

              const level = Math.min(
                Math.max(
                  Number(skill.level) || 0,
                  0
                ),
                100
              );

              return (

                <div
                  className={`portfolio-skill-card professional-skill-card reveal-on-scroll ${
                    index % 3 === 1
                      ? "reveal-delay-1"
                      : index % 3 === 2
                      ? "reveal-delay-2"
                      : ""
                  }`}
                  key={skill._id}
                  style={{
                    "--skill-level": `${level}%`,
                  }}
                >

                  <div className="skill-card-top">

                    <div className="skill-icon">
                      {skill.name
                        ? skill.name
                            .charAt(0)
                            .toUpperCase()
                        : "S"}
                    </div>


                    <div className="skill-card-title">

                      <h3>
                        {skill.name}
                      </h3>

                      <span className="skill-category">
                        {skill.category ||
                          "Technical Skill"}
                      </span>

                    </div>


                    <span className="skill-percentage">
                      {level}%
                    </span>

                  </div>


                  <div className="skill-progress-wrapper">

                    <div className="skill-progress-track">

                      <div
                        className="skill-progress-fill reveal-progress"
                      ></div>

                    </div>

                  </div>


                  <div className="skill-card-footer">

                    <span>
                      Proficiency
                    </span>

                    <span>

                      {level >= 80
                        ? "Advanced"
                        : level >= 60
                        ? "Intermediate"
                        : "Learning"}

                    </span>

                  </div>

                </div>

              );

            })

          )}

        </div>

      </section>


      {/* =========================
          PROJECTS
      ========================= */}

      <section
        id="projects"
        className="portfolio-section projects-portfolio-section"
      >

        <div
          className="projects-section-heading reveal-on-scroll"
        >

          <span className="section-label">
            MY WORK
          </span>

          <h2>
            Featured Projects
          </h2>

          <div className="section-heading-line"></div>

          <p>
            A selection of projects I've built using
            modern technologies and development
            practices.
          </p>

        </div>


        <div className="portfolio-projects-grid">

          {projects.length === 0 ? (

            <div className="portfolio-placeholder reveal-on-scroll">
              No projects added yet.
            </div>

          ) : (

            projects.map((project, index) => (

              <article
                className={`portfolio-project-card professional-project-card reveal-on-scroll ${
                  index % 3 === 1
                    ? "reveal-delay-1"
                    : index % 3 === 2
                    ? "reveal-delay-2"
                    : ""
                }`}
                key={project._id}
                onMouseMove={handleProjectMouseMove}
                onMouseLeave={handleProjectMouseLeave}
              >

                <div className="project-number">
                  {String(index + 1).padStart(
                    2,
                    "0"
                  )}
                </div>


                <div className="project-image-wrapper">

                  {project.image ? (

                    <img
                      src={project.image}
                      alt={
                        project.title ||
                        "Project"
                      }
                      className="portfolio-project-image professional-project-image"
                    />

                  ) : (

                    <div className="project-image-placeholder">

                      <span>
                        {project.title
                          ? project.title
                              .charAt(0)
                              .toUpperCase()
                          : "P"}
                      </span>

                    </div>

                  )}

                  <div className="project-image-overlay"></div>

                </div>


                <div className="portfolio-project-content professional-project-content">

                  <div className="project-title-row">

                    <h3>
                      {project.title ||
                        "Untitled Project"}
                    </h3>

                  </div>


                  <p className="project-description">
                    {project.description ||
                      "A modern project built using current web technologies."}
                  </p>


                  {project.technologies && (

                    <div className="portfolio-project-tech professional-project-tech">

                      {Array.isArray(
                        project.technologies
                      ) ? (

                        project.technologies.map(
                          (
                            tech,
                            techIndex
                          ) => (

                            <span
                              key={techIndex}
                            >
                              {tech}
                            </span>

                          )
                        )

                      ) : (

                        String(
                          project.technologies
                        )
                          .split(",")
                          .map(
                            (
                              tech,
                              techIndex
                            ) => (

                              <span
                                key={techIndex}
                              >
                                {tech.trim()}
                              </span>

                            )
                          )

                      )}

                    </div>

                  )}


                  <div className="portfolio-project-links professional-project-links">

                    {project.githubLink && (

                      <a
                        href={
                          project.githubLink
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="primary-button project-action-button"
                      >
                        GitHub
                        <span>↗</span>
                      </a>

                    )}


                    {project.liveLink && (

                      <a
                        href={
                          project.liveLink
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="secondary-button project-action-button"
                      >
                        Live Demo
                        <span>↗</span>
                      </a>

                    )}

                  </div>

                </div>

              </article>

            ))

          )}

        </div>

      </section>


      {/* =========================
          ACHIEVEMENTS
      ========================= */}

      <section
        id="achievements"
        className="portfolio-section achievements-portfolio-section"
      >

        <div
          className="achievements-section-heading reveal-on-scroll"
        >

          <span className="section-label">
            MILESTONES
          </span>

          <h2>
            Achievements
          </h2>

          <div className="section-heading-line"></div>

          <p>
            Highlights and milestones from my
            academic, professional and development
            journey.
          </p>

        </div>


        <div className="professional-achievements-grid">

          {achievements.length === 0 ? (

            <div className="portfolio-placeholder reveal-on-scroll">
              No achievements added yet.
            </div>

          ) : (

            achievements.map(
              (achievement, index) => (

                <article
                  className={`professional-achievement-card reveal-on-scroll ${
                    index % 3 === 1
                      ? "reveal-delay-1"
                      : index % 3 === 2
                      ? "reveal-delay-2"
                      : ""
                  }`}
                  key={achievement._id}
                >

                  <div className="achievement-card-top">

                    <span className="achievement-number">
                      {String(
                        index + 1
                      ).padStart(2, "0")}
                    </span>


                    <div className="achievement-icon">
                      ★
                    </div>

                  </div>


                  <div className="achievement-card-content">

                    {achievement.date && (

                      <span className="achievement-date">
                        {achievement.date}
                      </span>

                    )}


                    <h3>
                      {achievement.title}
                    </h3>


                    {achievement.description && (

                      <p>
                        {
                          achievement.description
                        }
                      </p>

                    )}

                  </div>


                  <div className="achievement-card-line"></div>

                </article>

              )
            )

          )}

        </div>

      </section>


      {/* =========================
          BLOG
      ========================= */}

      <section
        id="blog"
        className="portfolio-section blog-portfolio-section"
      >

        <div
          className="blog-section-heading reveal-on-scroll"
        >

          <span className="section-label">
            ARTICLES
          </span>

          <h2>
            Latest Blog Posts
          </h2>

          <div className="section-heading-line"></div>

          <p>
            Thoughts, tutorials and insights from my
            learning and development journey.
          </p>

        </div>


        <div className="portfolio-blog-grid professional-blog-grid">

          {publishedPosts.length === 0 ? (

            <div className="portfolio-placeholder reveal-on-scroll">
              No blog posts published yet.
            </div>

          ) : (

            publishedPosts.map(
              (post, index) => (

                <article
                  className={`portfolio-blog-card professional-blog-card reveal-on-scroll ${
                    index % 3 === 1
                      ? "reveal-delay-1"
                      : index % 3 === 2
                      ? "reveal-delay-2"
                      : ""
                  }`}
                  key={post._id}
                >

                  <div className="blog-image-wrapper">

                    {post.image ? (

                      <img
                        src={post.image}
                        alt={
                          post.title ||
                          "Blog post"
                        }
                        className="portfolio-blog-image professional-blog-image"
                      />

                    ) : (

                      <div className="blog-image-placeholder">

                        <span>
                          {post.title
                            ? post.title
                                .charAt(0)
                                .toUpperCase()
                            : "B"}
                        </span>

                      </div>

                    )}


                    <div className="blog-number">
                      {String(
                        index + 1
                      ).padStart(2, "0")}
                    </div>

                  </div>


                  <div className="portfolio-blog-content professional-blog-content">

                    <div className="blog-post-meta">

                      <span>
                        ARTICLE
                      </span>

                    </div>


                    <h3>
                      {post.title ||
                        "Untitled Post"}
                    </h3>


                    <p className="blog-post-excerpt">

                      {post.excerpt ||
                        post.content?.substring(
                          0,
                          150
                        ) ||
                        "Read this article to learn more."}

                      {(post.excerpt ||
                        post.content)
                        ?.length > 150
                        ? "..."
                        : ""}

                    </p>


                    {post.tags && (

                      <div className="professional-blog-tags">

                        {(Array.isArray(
                          post.tags
                        )
                          ? post.tags
                          : String(
                              post.tags
                            ).split(",")
                        ).map(
                          (
                            tag,
                            tagIndex
                          ) => (

                            <span
                              key={tagIndex}
                            >
                              {String(
                                tag
                              ).trim()}
                            </span>

                          )
                        )}

                      </div>

                    )}


                    <div className="blog-read-link">

                      Read Article

                      <span>
                        →
                      </span>

                    </div>

                  </div>

                </article>

              )
            )

          )}

        </div>

      </section>


      {/* =========================
          CONTACT
      ========================= */}

      <section
        id="contact"
        className="portfolio-section portfolio-contact-section"
      >

        <div
          className="contact-section-heading reveal-on-scroll"
        >

          <span className="section-label">
            GET IN TOUCH
          </span>

          <h2>
            Let's Work Together
          </h2>

          <div className="section-heading-line"></div>

          <p>
            Have a project, opportunity or idea?
            Let's connect and build something great
            together.
          </p>

        </div>


        <div
          className="professional-contact-card reveal-on-scroll reveal-delay-1"
        >

          <div className="contact-card-content">

            <div className="contact-card-icon">
              @
            </div>


            <h3>
              Have something in mind?
            </h3>


            <p>
              I'm always open to discussing new
              projects, creative ideas and
              opportunities to grow.
            </p>

          </div>


          <div className="contact-card-actions">

            <a
              href="/contact"
              className="primary-button contact-main-button"
            >
              Send Me a Message
              <span>→</span>
            </a>


            <a
              href={
                profile?.email
                  ? `mailto:${profile.email}`
                  : "mailto:"
              }
              className="secondary-button contact-email-button"
            >
              Email Me
            </a>

          </div>

        </div>

      </section>


      {/* =========================
          FOOTER
      ========================= */}

      <footer className="portfolio-footer">

        <p>
          © 2026{" "}
          {profile?.name ||
            "My Portfolio"}.
          All rights reserved.
        </p>


        <p>
          Built with React, Node.js,
          Express & MongoDB.
        </p>


        <a
          href="/login"
          className="admin-login-link"
        >
          Admin Login
        </a>

      </footer>


      {/* =========================
          BACK TO TOP
      ========================= */}

      <button
        className="back-to-top-button"
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
        aria-label="Back to top"
      >
        ↑
      </button>

    </div>
  );
}

export default Home;
