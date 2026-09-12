import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function BlogPosts() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);
  const [message, setMessage] = useState("");

  // Load Blog Posts
  useEffect(() => {
    async function loadPosts() {
      try {
        const response = await API.get("/posts");
        setPosts(response.data);
      } catch (error) {
        console.log("Error loading blog posts:", error);
      }
    }

    loadPosts();
  }, []);

  // Reset Form
  const resetForm = () => {
    setTitle("");
    setExcerpt("");
    setContent("");
    setImage("");
    setTags("");
    setPublished(false);
    setEditingPost(null);
  };

  // Save / Update Blog Post
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const postData = {
        title,
        excerpt,
        content,
        image,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== ""),
        published,
      };

      if (editingPost) {
        await API.put(
          `/posts/${editingPost._id}`,
          postData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMessage("Blog post updated successfully!");
      } else {
        await API.post(
          "/posts",
          postData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMessage("Blog post saved successfully!");
      }

      resetForm();
      setShowForm(false);

      const response = await API.get("/posts");
      setPosts(response.data);

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to save blog post"
      );
    }
  };

  // Delete Blog Post
  const deletePost = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await API.delete(`/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPosts(
        posts.filter((post) => post._id !== id)
      );

      setMessage("Blog post deleted successfully!");

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to delete blog post"
      );
    }
  };

  // Edit Blog Post
  const editPost = (post) => {
    setEditingPost(post);

    setTitle(post.title || "");
    setExcerpt(post.excerpt || "");
    setContent(post.content || "");
    setImage(post.image || "");
    setTags((post.tags || []).join(", "));
    setPublished(post.published || false);

    setShowForm(true);
    setMessage("");
  };

  // Add New Blog Post
  const addNewPost = () => {
    resetForm();
    setShowForm(true);
    setMessage("");
  };

  return (
    <div className="skills-page">

      {/* Header */}
      <div className="skills-header">

        <div>
          <h1>Blog Posts</h1>
          <p>Manage your blog posts and articles.</p>
        </div>

        <div className="skills-header-actions">

          <button
            className="back-dashboard-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>

          <button
            className="add-skill-button"
            onClick={addNewPost}
          >
            + Add Blog Post
          </button>

        </div>

      </div>

      {/* Message */}
      {message && (
        <p className="success-message">
          {message}
        </p>
      )}

      {/* Blog Form */}
      {showForm && (
        <div className="skill-form-card">

          <h2>
            {editingPost
              ? "Edit Blog Post"
              : "Add New Blog Post"}
          </h2>

          <form onSubmit={handleSave}>

            {/* Title */}
            <div className="form-group">

              <label>Title</label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog post title"
                required
              />

            </div>

            {/* Excerpt */}
            <div className="form-group">

              <label>Excerpt</label>

              <textarea
                rows="3"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short description of your blog post..."
              ></textarea>

            </div>

            {/* Image */}
            <div className="form-group">

              <label>Image URL</label>

              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />

              <small>
                Add an image URL for your blog post.
              </small>

            </div>

            {/* Content */}
            <div className="form-group">

              <label>Content</label>

              <textarea
                rows="8"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your blog post here..."
                required
              ></textarea>

            </div>

            {/* Tags */}
            <div className="form-group">

              <label>Tags</label>

              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="React, Node.js, MongoDB"
              />

              <small>
                Separate tags with commas.
              </small>

            </div>

            {/* Published */}
            <div className="form-group">

              <label>

                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                />

                {" "}Publish this post

              </label>

            </div>

            {/* Buttons */}
            <div className="skill-actions">

              <button
                type="submit"
                className="add-skill-button"
              >
                {editingPost
                  ? "Update Blog Post"
                  : "Save Blog Post"}
              </button>

              <button
                type="button"
                className="delete-skill-button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}

      {/* Blog Posts */}
      {posts.length > 0 ? (

        <div className="skills-grid">

          {posts.map((post) => (

            <div
              className="skill-card"
              key={post._id}
            >

              {/* Blog Image */}
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="blog-post-image"
                />
              )}

              {/* Header */}
              <div className="skill-card-header">

                <div>

                  <h2>{post.title}</h2>

                  <p>
                    {post.published
                      ? "Published"
                      : "Draft"}
                  </p>

                </div>

              </div>

              {/* Excerpt */}
              <p>
                {post.excerpt || post.content}
              </p>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="blog-tags">

                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="blog-tag"
                    >
                      #{tag}
                    </span>
                  ))}

                </div>
              )}

              {/* Actions */}
              <div className="skill-actions">

                <button
                  className="edit-skill-button"
                  onClick={() => editPost(post)}
                >
                  Edit
                </button>

                <button
                  className="delete-skill-button"
                  onClick={() => deletePost(post._id)}
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      ) : (

        !showForm && (

          <div className="skills-empty">

            <h2>No blog posts yet</h2>

            <p>
              Create your first blog post to get started.
            </p>

          </div>

        )

      )}

    </div>
  );
}

export default BlogPosts;