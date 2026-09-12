import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function Messages() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get("/messages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessages(response.data);
    } catch (error) {
      console.log("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    API.get("/messages", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        setMessages(response.data);
      })
      .catch((error) => {
        console.log("Error loading messages:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const toggleRead = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");

      await API.put(
        `/messages/${id}`,
        { read: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      loadMessages();
    } catch (error) {
      console.log("Error updating message:", error);
    }
  };

  const deleteMessage = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await API.delete(`/messages/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      loadMessages();
    } catch (error) {
      console.log("Error deleting message:", error);
    }
  };

  return (
    <div className="skills-page">

      {/* Header */}
      <div className="skills-header">
        <div>
          <h1>Messages</h1>
          <p>View and manage messages received from your portfolio.</p>
        </div>

        <button
          className="back-dashboard-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </div>

      {/* Messages */}
      <div className="messages-container">

        {loading ? (
          <div className="skill-form-card">
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="skill-form-card">
            <h2>No Messages</h2>
            <p>You haven't received any messages yet.</p>
          </div>
        ) : (
          messages.map((item) => (
            <div
              className={`message-card ${
                item.read ? "message-read" : "message-unread"
              }`}
              key={item._id}
            >
              <div className="message-card-header">
                <div>
                  <h2>{item.subject || "No Subject"}</h2>

                  <p>
                    <strong>{item.name}</strong> · {item.email}
                  </p>
                </div>

                <span className="message-status">
                  {item.read ? "Read" : "Unread"}
                </span>
              </div>

              <p className="message-content">
                {item.message}
              </p>

              <div className="message-card-footer">
                <span>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : ""}
                </span>

                <div className="message-actions">
                  <button
                    onClick={() => toggleRead(item._id, item.read)}
                  >
                    {item.read ? "Mark Unread" : "Mark Read"}
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => deleteMessage(item._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

      </div>
    </div>
  );
}

export default Messages;