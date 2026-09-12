import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function Contact() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    const name = formData.name.trim();
    const email = formData.email.trim();
    const subject = formData.subject.trim();
    const message = formData.message.trim();

    if (!name) {
      newErrors.name = "Please enter your name.";
    } else if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    } else if (name.length > 60) {
      newErrors.name = "Name must be 60 characters or less.";
    }

    if (!email) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!subject) {
      newErrors.subject = "Please enter a subject.";
    } else if (subject.length < 3) {
      newErrors.subject = "Subject must be at least 3 characters.";
    } else if (subject.length > 100) {
      newErrors.subject = "Subject must be 100 characters or less.";
    }

    if (!message) {
      newErrors.message = "Please enter your message.";
    } else if (message.length < 10) {
      newErrors.message = "Message must be at least 10 characters.";
    } else if (message.length > 2000) {
      newErrors.message = "Message must be 2000 characters or less.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setStatus("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatus("");

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    setSending(true);

    try {
      await API.post("/messages", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      setStatus("success");

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setErrors({});
    } catch (error) {
      console.error("Contact form error:", error);

      setStatus(
        error.response?.data?.message ||
          "Unable to send your message. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page">

      <div className="contact-header">
        <div>
          <h1>Contact</h1>
          <p>
            Get in touch with me for opportunities, collaborations,
            or project discussions.
          </p>
        </div>

        <button
          className="back-dashboard-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </div>

      <div className="contact-card">

        <form onSubmit={handleSubmit} noValidate>

          {/* NAME */}
          <div className="form-group">
            <label htmlFor="contact-name">
              Name
            </label>

            <input
              id="contact-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              maxLength="60"
              autoComplete="name"
              className={errors.name ? "input-error" : ""}
            />

            {errors.name && (
              <span className="field-error">
                {errors.name}
              </span>
            )}
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <label htmlFor="contact-email">
              Email
            </label>

            <input
              id="contact-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              maxLength="120"
              autoComplete="email"
              className={errors.email ? "input-error" : ""}
            />

            {errors.email && (
              <span className="field-error">
                {errors.email}
              </span>
            )}
          </div>

          {/* SUBJECT */}
          <div className="form-group">
            <label htmlFor="contact-subject">
              Subject
            </label>

            <input
              id="contact-subject"
              name="subject"
              type="text"
              value={formData.subject}
              onChange={handleChange}
              placeholder="What would you like to discuss?"
              maxLength="100"
              className={errors.subject ? "input-error" : ""}
            />

            {errors.subject && (
              <span className="field-error">
                {errors.subject}
              </span>
            )}
          </div>

          {/* MESSAGE */}
          <div className="form-group">
            <label htmlFor="contact-message">
              Message
            </label>

            <textarea
              id="contact-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message..."
              rows="7"
              maxLength="2000"
              className={errors.message ? "input-error" : ""}
            />

            <div className="message-meta">
              <span>
                {errors.message ? (
                  <span className="field-error">
                    {errors.message}
                  </span>
                ) : (
                  "Minimum 10 characters"
                )}
              </span>

              <span>
                {formData.message.length}/2000
              </span>
            </div>
          </div>

          {/* STATUS */}
          {status === "success" && (
            <div className="contact-success-message">
              Your message has been sent successfully.
            </div>
          )}

          {status &&
            status !== "success" && (
              <div className="contact-error-message">
                {status}
              </div>
            )}

          {/* SUBMIT */}
          <button
            type="submit"
            className="save-button contact-submit-button"
            disabled={sending}
          >
            {sending ? "Sending..." : "Send Message"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default Contact;